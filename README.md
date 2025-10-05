# 🌌 CosmoGraph

**CosmoGraph** is an **AI-powered research exploration tool** that visualizes relationships between scientific publications using **semantic embeddings** and **knowledge graphs**.  
It helps users discover, summarize, and navigate NASA’s bioscience research by turning complex text data into meaningful visual connections.

---

## 🧠 Overview

CosmoGraph enables a new way of exploring space biology research by combining:
- **Semantic Search** — find publications similar in *meaning*, not just keywords.
- **AI Summarization** — generate concise summaries for each relevant publication.
- **Knowledge Graph Visualization** — view interconnected concepts and relationships through interactive nodes and links.
- **Filtering** — refine results by tags, similarity, or relevance.

---

## 🎯 Example Use Case

> A user searches: “water on Mars”  
>  
> CosmoGraph finds publications that discuss **Martian hydration**, **planetary geology**, or **astrobiology experiments**, even if “water” and “Mars” don’t appear together.  
>  
> It displays:
> - A **summary panel** with related papers and their abstracts  
> - A **knowledge graph** connecting topics like *Water Cycle*, *Soil Analysis*, *Life Detection*  
> - Clickable nodes showing related research clusters  

---

## ⚙️ Tech Stack

| Layer | Technology | Role |
|-------|-------------|------|
| **Frontend** | React + Vite + Tailwind + react-force-graph | Interactive visualization UI |
| **Backend** | FastAPI + Uvicorn | Handles embeddings, vector search, and summarization |
| **Database** | Supabase (Postgres + pgvector) | Stores publications and embedding vectors |
| **AI/ML** | SentenceTransformers (SBERT) | Generates embeddings for semantic matching |
| **Language** | Python + JavaScript | Core backend and frontend languages |

---

## 🧩 How It Works

### 🔹 Step 1: Query Embedding
- User enters a query (e.g. “photosynthesis in microgravity”).  
- The backend uses **Sentence-BERT** to convert it into a numerical embedding (a list of 384 values representing meaning).

### 🔹 Step 2: Vector Search in Supabase
- The embedding is sent to a **PostgreSQL function** (`match_publications`) that finds the most semantically similar publications using cosine similarity.


```sql
CREATE OR REPLACE FUNCTION match_publications(
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  title text,
  abstract text,
  tags text[],
  url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.abstract,
    p.tags,
    p.pdf_url,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM publications p
  WHERE 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 🔹 Step 3: AI Summarization
Once results are retrieved, the backend uses a text summarization model (e.g., OpenAI or Gemini) to condense each publication’s abstract.

### 🔹 Step 4: Knowledge Graph Construction
Tags from publications are used as nodes.

Publications that share tags form edges between those nodes.

Each node links to the related publications in the sidebar.

### 🔹 Step 5: Frontend Visualization
The graph and results are displayed using react-force-graph-2d.

Clicking on a node shows related publications and summaries.
---
## 🖥️ Backend Setup
### 1️⃣ Create Environment File
Inside backend/.env:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key  # optional for summarization
```
### 2️⃣ Install Dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # on Windows
# or
source venv/bin/activate # on Mac/Linux

pip install -r requirements.txt
```
### 3️⃣ Run Backend Server
```bash
python -m uvicorn main:app --reload
```
Visit 👉 http://127.0.0.1:8000/docs
to see automatically generated FastAPI API documentation.

---

## 💻 Frontend Setup
Install & Run
```bash
npm install
npm run dev
```
Open the app at 👉 http://localhost:5173

---

## 🚀 Future Enhancements
- Citation or author-based connections
- Multi-query comparison mode
- Graph-based summarization
- Downloadable visualizations
- User accounts with Supabase Auth

---

## 🧑‍💻 Author
- Abhay Murali
- Ajay Krishna D
- Niranjana Ajay
- Rohan
- Rose Francis
- Thaariq Hassan