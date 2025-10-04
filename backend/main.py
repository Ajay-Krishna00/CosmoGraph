from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon; later restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    search: str

@app.get("/")
def home():
    return {"message": "FastAPI backend is running 🚀"}

@app.post("/search")
def search_graph(query: Query):
    # TODO → Replace this with real knowledge graph generation
    return {
        "nodes": [
            {"id": "Mars", "group": "Planet"},
            {"id": "Water", "group": "Resource"}
        ],
        "links": [
            {"source": "Mars", "target": "Water", "label": "contains"}
        ]
    }
