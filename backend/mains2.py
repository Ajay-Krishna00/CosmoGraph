# rag_pipeline.py

import numpy as np
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import gemini

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

TABLE_NAME = "chunks"
VECTOR_COLUMN = "embedding"
ID_COLUMN = "id"
CONTENT_COLUMN = "content"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")


# ========================================
# CORE FUNCTIONS
# ========================================

def convert_query_to_vector(query: str) -> list:
    """Convert text to 384D embedding"""
    embedding = embedder.encode([query], convert_to_numpy=True)[0]
    return embedding.tolist()


def calculate_cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Compute cosine similarity"""
    dot = np.dot(vec1, vec2)
    norm = np.linalg.norm(vec1) * np.linalg.norm(vec2)
    return 0.0 if norm == 0 else dot / norm


def _retrieve_with_rpc(query_vector: list, top_k: int):
    """Retrieve using Supabase RPC"""
    try:
        response = supabase.rpc(
            "match_chunks",
            {"query_embedding": query_vector, "match_count": top_k}
        ).execute()
        return response.data or []
    except Exception as e:
        print(f"RPC failed: {e}")
        return []


def _retrieve_manual(query_vector: list, top_k: int):
    """Manual fallback if RPC fails"""
    response = supabase.table(TABLE_NAME).select(f"{ID_COLUMN}, {VECTOR_COLUMN}, {CONTENT_COLUMN}").execute()
    if not response.data:
        return []

    q_vec = np.array(query_vector, dtype=np.float32)
    results = []

    for row in response.data:
        emb = row.get(VECTOR_COLUMN)
        if not emb:
            continue

        try:
            if isinstance(emb, str):
                emb = [float(x) for x in emb.strip("[]").split(",")]
            db_vec = np.array(emb, dtype=np.float32)
            sim = calculate_cosine_similarity(q_vec, db_vec)
            results.append({
                "id": row[ID_COLUMN],
                "similarity": float(sim),
                "content": row.get(CONTENT_COLUMN, "")
            })
        except Exception:
            continue

    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]


def retrieve_similar_vectors(query: str, top_k: int = 10, method="rpc"):
    """Main retrieval function"""
    query_vector = convert_query_to_vector(query)
    if method == "rpc":
        results = _retrieve_with_rpc(query_vector, top_k)
        if results:
            return results
    return _retrieve_manual(query_vector, top_k)


def run_rag_pipeline(query: str, top_k: int = 10):
    """
    Full RAG flow:
    1. Retrieve similar vectors
    2. Concatenate their content
    3. Generate summary via Gemini
    """
    results = retrieve_similar_vectors(query, top_k=top_k, method="rpc")
    if not results:
        return {"summary": "No relevant data found.", "results": []}

    # Combine content for summary
    combined_text = "\n".join([r["content"] for r in results if r["content"]])
    summary = gemini.generate_Summary(combined_text, query)

    return summary;
