"""
ingest.py

Usage:
  Export SUPABASE_URL and SUPABASE_KEY in env, and set CSV_PATH
  python ingest.py

What it does:
 - Reads CSV of URLs
 - Scrapes each page for title, description, pdfs, authors (best-effort)
 - Extracts main text (first large <article> or concatenated <p>)
 - Generates SBERT embeddings for text chunks (model: all-MiniLM-L6-v2)
 - Generates tags for each chunk using spaCy (noun chunks + entities, top N)
 - Inserts a publications row (if not exists) and chunk rows into Supabase
"""
from dotenv import load_dotenv
load_dotenv()

import os
import re
import json
import time
import logging
from urllib.parse import urlparse, urljoin
from typing import List, Optional, Dict, Any

import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

from sentence_transformers import SentenceTransformer
import spacy

# supabase client
from supabase import create_client, Client

# Config
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
CSV_PATH = os.environ.get("CSV_PATH", "links.csv")
REQUESTS_TIMEOUT = 20
CHUNK_CHAR_SIZE = 1000            # characters per chunk (tweakable)
CHUNK_OVERLAP = 200               # char overlap between chunks
SBERT_MODEL_NAME = "all-MiniLM-L6-v2"  # 384d

# Safety checks
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Please set SUPABASE_URL and SUPABASE_KEY in environment variables.")

# Initialize clients & models
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
sbert = SentenceTransformer(SBERT_MODEL_NAME)  # produces 384-d vectors
nlp = spacy.load("en_core_web_sm")

# Basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- Utilities ----------
def fetch_page(url: str, timeout: int = REQUESTS_TIMEOUT) -> Optional[str]:
    """Fetch HTML content from a URL with retry logic."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    max_retries = 3
    for attempt in range(max_retries):
        try:
            resp = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
            resp.raise_for_status()
            return resp.text
        except requests.exceptions.Timeout:
            logger.warning(f"Timeout fetching {url} (attempt {attempt + 1}/{max_retries})")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # exponential backoff
        except requests.exceptions.RequestException as e:
            logger.warning(f"Failed to fetch {url}: {e}")
            return None
    return None


def extract_metadata(html: str, url: str) -> Dict[str, Any]:
    """Extract metadata and main content from HTML."""
    soup = BeautifulSoup(html, "html.parser")

    # Title
    title = None
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    
    # meta description / abstract
    desc = None
    m = soup.find("meta", attrs={"name": "description"})
    if m and m.get("content"):
        desc = m["content"].strip()
    if not desc:
        m2 = soup.find("meta", attrs={"property": "og:description"})
        if m2 and m2.get("content"):
            desc = m2["content"].strip()

    # authors - best-effort: schema.org author/meta name author
    authors = None
    author_meta = soup.find("meta", attrs={"name": "author"})
    if author_meta and author_meta.get("content"):
        authors = author_meta["content"]
    else:
        # try schema.org
        auth_tag = soup.find(attrs={"itemprop": "author"})
        if auth_tag:
            authors = auth_tag.get_text(strip=True)

    # pdf url (look for <a> links ending with .pdf)
    pdf_url = None
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.lower().endswith(".pdf"):
            pdf_url = href if href.startswith("http") else urljoin(url, href)
            break

    # year - cheap regex search in meta or title
    year = None
    text_for_year = " ".join(filter(None, [title, desc]))
    year_match = re.search(r"\b(19|20)\d{2}\b", text_for_year)
    if year_match:
        year = int(year_match.group(0))

    # mission/organism - impossible to reliably extract generically; leave blank
    mission = None
    organism = None

    # main textual content - heuristics: article tag or main or largest text of paragraphs
    main_text = None
    article = soup.find("article")
    if article:
        main_text = " ".join([p.get_text(separator=" ", strip=True) for p in article.find_all("p")])
    if not main_text:
        main = soup.find("main")
        if main:
            main_text = " ".join([p.get_text(separator=" ", strip=True) for p in main.find_all("p")])
    if not main_text:
        # fallback: collect top N <p> with longest text
        paragraphs = [p.get_text(separator=" ", strip=True) for p in soup.find_all("p")]
        paragraphs_sorted = sorted(paragraphs, key=lambda s: len(s), reverse=True)
        main_text = " ".join(paragraphs_sorted[:10])

    # Clean up text
    if main_text:
        main_text = re.sub(r'\s+', ' ', main_text).strip()

    # metadata: store page url, html title, meta tags, etc.
    metadata = {
        "fetched_url": url,
        "meta_title": title,
        "meta_description": desc,
        "pdf_url_found": pdf_url,
        "paragraph_count": len(soup.find_all("p"))
    }

    return {
        "title": title,
        "authors": authors,
        "year": year,
        "mission": mission,
        "organism": organism,
        "pdf_url": pdf_url,
        "abstract": desc,
        "text": main_text,
        "metadata": metadata
    }


def chunk_text(text: str, chunk_size: int = CHUNK_CHAR_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split text into overlapping chunks."""
    if not text:
        return []
    text = text.strip()
    chunks = []
    start = 0
    L = len(text)
    while start < L:
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:  # only add non-empty chunks
            chunks.append(chunk)
        start = end - overlap
        if end >= L:
            break
    return chunks


def generate_tags_for_text(text: str, top_n: int = 8) -> List[str]:
    """
    Use spaCy to extract candidate tags:
      - Named entities (PERSON, ORG, GPE, etc.)
      - Noun chunks
    Rank by frequency and return top_n unique tags.
    """
    if not text or len(text) > 1000000:  # Skip very large texts for spaCy
        return []
    
    doc = nlp(text[:100000])  # Limit text length for performance
    candidates = []

    # named entities
    for ent in doc.ents:
        if len(ent.text) > 1 and ent.label_ in ['PERSON', 'ORG', 'GPE', 'PRODUCT', 'EVENT', 'LOC']:
            candidates.append(ent.text.strip())

    # noun chunks
    for nc in doc.noun_chunks:
        t = nc.text.strip()
        if len(t) > 1 and len(t.split()) <= 4:  # Limit to shorter phrases
            candidates.append(t)

    # basic normalization and frequency
    freq = {}
    for c in candidates:
        key = c.lower()
        freq[key] = freq.get(key, 0) + 1

    # sort by freq then length heuristic
    sorted_items = sorted(freq.items(), key=lambda kv: (-kv[1], -len(kv[0])))

    tags = []
    seen = set()
    for key, _ in sorted_items:
        # sanitize tag
        tag = key.strip()
        # avoid very short tokens
        if len(tag) < 2:
            continue
        # title-case tags for readability
        tag_readable = " ".join([w.capitalize() for w in tag.split()])
        if tag_readable.lower() not in seen:
            tags.append(tag_readable)
            seen.add(tag_readable.lower())
        if len(tags) >= top_n:
            break

    return tags


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of texts."""
    if not texts:
        return []
    embeddings = sbert.encode(texts, show_progress_bar=False, convert_to_numpy=True, batch_size=32)
    return [emb.tolist() for emb in embeddings]


# ---------- Supabase helpers ----------
def upsert_publication(pub_id: str, metadata: Dict[str, Any]) -> bool:
    """
    Insert publication row if not exists, update if exists.
    Returns True on success.
    """
    payload = {
        "id": pub_id,
        "title": metadata.get("title"),
        "authors": metadata.get("authors"),
        "year": metadata.get("year"),
        "mission": metadata.get("mission"),
        "organism": metadata.get("organism"),
        "pdf_url": metadata.get("pdf_url"),
        "abstract": metadata.get("abstract"),
        "metadata": metadata.get("metadata") or {},
    }

    try:
        # Use upsert with on_conflict to handle duplicates
        response = supabase.table("publications").upsert(
            payload, 
            on_conflict="id"
        ).execute()
        
        if response.data:
            logger.info(f"Successfully upserted publication: {pub_id}")
            return True
        else:
            logger.error(f"Failed to upsert publication {pub_id}")
            return False
            
    except Exception as e:
        logger.exception(f"Supabase error on upsert_publication for {pub_id}: {e}")
        return False


def insert_chunks(publication_id: str, chunk_texts: List[str], page_numbers: List[Optional[int]], start_chunk_index: int = 0) -> int:
    """
    Embeds chunk_texts, generates tags for each chunk, and inserts rows into 'chunks' table.
    Returns number of successfully inserted chunks.
    """
    if not chunk_texts:
        return 0

    # batch embed
    logger.info(f"Embedding {len(chunk_texts)} chunks for publication {publication_id}")
    try:
        embeddings = embed_texts(chunk_texts)
    except Exception as e:
        logger.exception(f"Failed to embed chunks: {e}")
        return 0

    rows = []
    for i, (chunk_text, emb) in enumerate(zip(chunk_texts, embeddings)):
        idx = start_chunk_index + i
        try:
            tags = generate_tags_for_text(chunk_text, top_n=6)
        except Exception as e:
            logger.warning(f"Failed to generate tags for chunk {idx}: {e}")
            tags = []
        
        row = {
            "publication_id": publication_id,
            "chunk_index": idx,
            "content": chunk_text,
            "page_number": page_numbers[i] if i < len(page_numbers) else None,
            "embedding": emb,
            "tags": tags
        }
        rows.append(row)

    # Insert rows in batches
    BATCH = 50
    inserted = 0
    for i in range(0, len(rows), BATCH):
        batch = rows[i:i+BATCH]
        try:
            response = supabase.table("chunks").insert(batch).execute()
            if response.data:
                inserted += len(batch)
                logger.info(f"Inserted batch of {len(batch)} chunks")
            else:
                logger.error(f"Failed to insert chunk batch")
        except Exception as e:
            logger.exception(f"Error inserting chunk batch: {e}")
    
    return inserted


# ---------- Main flow ----------
def sanitize_publication_id(url: str) -> str:
    """Create a clean publication ID from URL."""
    p = urlparse(url)
    path = p.path.rstrip("/").replace("/", "_")
    base = f"{p.netloc}{path}"
    # collapse non-alphanumeric
    base = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", base)
    # Remove consecutive underscores
    base = re.sub(r"_+", "_", base)
    # limit length
    return base[:200].rstrip("_")


def process_row(url: str) -> Dict[str, Any]:
    """
    Scrapes the URL, upserts publication, chunks text, inserts chunk rows.
    Returns stats dict.
    """
    stats = {"url": url, "fetched": False, "pub_upserted": False, "chunks_inserted": 0, "error": None}
    
    html = fetch_page(url)
    if not html:
        stats["error"] = "Failed to fetch"
        return stats
    stats["fetched"] = True

    try:
        meta = extract_metadata(html, url)
    except Exception as e:
        stats["error"] = f"Failed to extract metadata: {e}"
        logger.exception(f"Metadata extraction failed for {url}")
        return stats

    publication_id = sanitize_publication_id(url)
    
    # Upsert publication
    pub_ok = upsert_publication(publication_id, meta)
    stats["pub_upserted"] = pub_ok
    if not pub_ok:
        stats["error"] = "Failed to upsert publication"
        return stats

    # chunk text
    text = meta.get("text") or meta.get("abstract") or ""
    if not text or len(text.strip()) == 0:
        stats["error"] = "No text to chunk"
        logger.warning(f"No text found for {url}")
        return stats

    try:
        chunks = chunk_text(text)
        if not chunks:
            stats["error"] = "No chunks generated"
            return stats
            
        page_numbers = [None] * len(chunks)
        inserted = insert_chunks(publication_id, chunks, page_numbers, start_chunk_index=0)
        stats["chunks_inserted"] = inserted
    except Exception as e:
        stats["error"] = f"Failed to process chunks: {e}"
        logger.exception(f"Chunk processing failed for {url}")
    
    return stats


def main():
    """Main execution function."""
    logger.info("Starting ingestion process...")
    
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"CSV file not found: {CSV_PATH}")
    
    df = pd.read_csv(CSV_PATH)
    if "url" not in df.columns:
        raise RuntimeError("CSV must contain a 'url' column.")

    logger.info(f"Found {len(df)} URLs to process")
    
    results = []
    success_count = 0
    fail_count = 0
    
    # iterate with progress bar
    for idx, row in tqdm(df.iterrows(), total=len(df), desc="Processing URLs"):
        url = str(row["url"]).strip()
        if not url or url.lower() in ['nan', 'none', '']:
            continue
        
        try:
            res = process_row(url)
            results.append(res)
            
            if res.get("chunks_inserted", 0) > 0:
                success_count += 1
            else:
                fail_count += 1
            
            # small sleep to avoid hammering servers
            time.sleep(1)
            
        except KeyboardInterrupt:
            logger.info("Interrupted by user")
            break
        except Exception as e:
            logger.exception(f"Unexpected error for URL {url}")
            results.append({"url": url, "error": str(e)})
            fail_count += 1

    # Save the run summary
    out = "ingest_summary.json"
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(results, fh, indent=2)
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Ingestion complete!")
    logger.info(f"Total URLs processed: {len(results)}")
    logger.info(f"Successful: {success_count}")
    logger.info(f"Failed: {fail_count}")
    logger.info(f"Summary saved to {out}")
    logger.info(f"{'='*60}\n")


if __name__ == "__main__":
    main()