from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from collections import defaultdict
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize SBERT model
model = SentenceTransformer('all-MiniLM-L6-v2')

class SearchQuery(BaseModel):
    query: str
    top_k: int = 50  # Default to 5 most similar results

class GraphNode(BaseModel):
    id: str
    label: str
    group: int

class GraphLink(BaseModel):
    source: str
    target: str
    weight: float

class GraphData(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]


@app.post("/graph")
def generate_knowledge_graph(query: SearchQuery):
    """
    Generate knowledge graph based on user query:
    1. Convert query to vector embedding
    2. Find top_k most similar publications from database
    3. Extract tags from these publications
    4. Create nodes from tags
    5. Create edges based on tag co-occurrence in same publications
    """
    try:
        # Step 1: Convert query to embedding
        query_embedding = model.encode(query.query).tolist()
        
        # Step 2: Find most similar publications using vector search
        # This assumes you have a stored procedure in Supabase for vector similarity
        # Example SQL function name: match_publications
        response = supabase.rpc(
            "new_match_publication",
            {
                "query_embedding": query_embedding,
                "match_threshold": 0.4,  # Minimum similarity threshold
                "match_count": query.top_k
            }
        ).execute()
        
        publications = response.data
        
        if not publications:
            return {"nodes": [], "links": []}
        
        # Step 3: Extract all tags from retrieved publications
        all_tags = []
        tag_to_pubs = defaultdict(list)  # Track which publications contain each tag
        
        for idx, pub in enumerate(publications):
            tags = pub.get("tags", [])
            all_tags.extend(tags)
            for tag in tags:
                tag_to_pubs[tag].append(idx)
        
        # Get unique tags
        unique_tags = list(set(all_tags))
        
        # Step 4: Create nodes from tags
        nodes = []
        for tag in unique_tags:
            nodes.append({
                "id": tag,
                "label": tag,
                "group": len(tag_to_pubs[tag])  # Group by frequency
            })
        
        # Step 5: Create edges based on tag co-occurrence
        edge_weights = defaultdict(int)
        
        for pub in publications:
            tags = pub.get("tags", [])
            # Create edges between all pairs of tags in the same publication
            for i, tag1 in enumerate(tags):
                for tag2 in tags[i+1:]:
                    # Sort to ensure consistent edge direction
                    edge_key = tuple(sorted([tag1, tag2]))
                    edge_weights[edge_key] += 1
        
        # Create links from edge weights
        links = []
        for (tag1, tag2), weight in edge_weights.items():
            links.append({
                "source": tag1,
                "target": tag2,
                "weight": weight
            })
        
        return {"nodes": nodes, "links": links}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)