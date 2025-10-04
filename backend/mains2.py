import numpy as np
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# ========================================
# CONFIGURATION
# ========================================
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

TABLE_NAME = "chunks"
VECTOR_COLUMN = "embedding"
ID_COLUMN = "id"
CONTENT_COLUMN = "content"
PUBLICATION_COLUMN = "publication_id"
CHUNK_INDEX_COLUMN = "chunk_index"
PAGE_NUMBER_COLUMN = "page_number"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize sentence transformer (384 dimensions)
print("🔄 Loading embedding model...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")
print("✅ Model loaded!\n")

# ========================================
# CORE FUNCTIONS
# ========================================
# Add this to test your data format
def debug_check_embeddings():
    """Check the format of embeddings in your table"""
    print("🔍 Checking embedding format...")
    
    response = supabase.table(TABLE_NAME).select("id, embedding").limit(1).execute()
    
    if response.data:
        sample = response.data[0]
        emb = sample['embedding']
        
        print(f"Embedding type: {type(emb)}")
        print(f"First 100 chars: {str(emb)[:]}")
        
        if isinstance(emb, str):
            print("⚠️ Embeddings are stored as STRINGS")
            print("This will be handled by the updated code.")
        elif isinstance(emb, list):
            print("✅ Embeddings are stored as LISTS")
            print(f"Dimension: {len(emb)}")
        else:
            print(f"❓ Unknown format: {type(emb)}")
    else:
        print("❌ No data in table")

# Run this before your main code
debug_check_embeddings()

def convert_query_to_vector(query: str) -> list:
    """
    Convert text query to 384-dimensional vector embedding
    
    Args:
        query: Text string to embed
    
    Returns:
        List of 384 floats representing the embedding
    """
    print(f"🔄 Converting query to vector: '{query}'")
    embedding = embedder.encode([query], convert_to_numpy=True)[0]
    vector = embedding.tolist()
    print(f"✅ Generated {len(vector)}-dimensional vector\n")
    return vector


def calculate_cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """
    Calculate cosine similarity between two vectors
    
    Args:
        vec1: First vector
        vec2: Second vector
    
    Returns:
        Similarity score between 0 and 1
    """
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return dot_product / (norm1 * norm2)


def retrieve_similar_vectors(query: str, top_k: int = 50, method: str = "rpc") -> list:
    """
    Retrieve most similar vectors from Supabase
    
    Args:
        query: Search query text
        top_k: Number of results to return
        method: "rpc" (uses SQL function) or "manual" (fetches all and computes)
    
    Returns:
        List of dictionaries with id, similarity, and embedding
    """
    query_vector = convert_query_to_vector(query)
    
    if method == "rpc":
        return _retrieve_with_rpc(query_vector, top_k)
    else:
        return _retrieve_manual(query_vector, top_k)


def _retrieve_with_rpc(query_vector: list, top_k: int) -> list:
    """
    Retrieve using Supabase RPC function (requires SQL function setup)
    """
    print(f"🔍 Searching for top {top_k} similar vectors using RPC...")
    
    try:
        response = supabase.rpc(
            'match_chunks',
            {
                'query_embedding': query_vector,
                'match_count': top_k
            }
        ).execute()
        
        if response.data:
            print(f"✅ Found {len(response.data)} similar vectors\n")
            return response.data
        else:
            print("⚠️ No results found\n")
            return []
    
    except Exception as e:
        print(f"❌ RPC Error: {e}")
        print("💡 Falling back to manual method...\n")
        return _retrieve_manual(query_vector, top_k)


def _retrieve_manual(query_vector: list, top_k: int) -> list:
    """
    Retrieve by fetching all vectors and computing similarity manually
    """
    print(f"🔍 Fetching all vectors from table '{TABLE_NAME}'...")
    
    try:
        # Fetch all embeddings from Supabase (including content!)
        response = supabase.table(TABLE_NAME).select(f"{ID_COLUMN}, {VECTOR_COLUMN}, {CONTENT_COLUMN}").execute()
        
        if not response.data:
            print("⚠️ No data in table\n")
            return []
        
        print(f"✅ Retrieved {len(response.data)} vectors from database")
        print("🔄 Computing cosine similarities...\n")
        
        # Convert query to numpy array
        q_vec = np.array(query_vector, dtype=np.float32)
        
        # Calculate similarities
        results = []
        for row in response.data:
            if row.get(VECTOR_COLUMN):
                try:
                    # Handle both string and list formats
                    emb_data = row[VECTOR_COLUMN]
                    
                    # If it's a string, try to parse it
                    if isinstance(emb_data, str):
                        # Remove brackets and split
                        emb_data = emb_data.strip('[]').split(',')
                        db_vec = np.array([float(x.strip()) for x in emb_data], dtype=np.float32)
                    else:
                        # Already a list
                        db_vec = np.array(emb_data, dtype=np.float32)
                    
                    # Skip if dimensions don't match
                    if len(db_vec) != len(q_vec):
                        print(f"⚠️ Skipping ID {row[ID_COLUMN]}: dimension mismatch ({len(db_vec)} vs {len(q_vec)})")
                        continue
                    
                    similarity = calculate_cosine_similarity(q_vec, db_vec)
                    if similarity > 0.5:
                        results.append({
                            'id': row[ID_COLUMN],
                            'similarity': float(similarity),
                            'embedding': db_vec.tolist()[:50],  # Only store first 5 dims for display
                            'content': row.get(CONTENT_COLUMN, "No content available")
                        })
                
                except Exception as e:
                    print(f"⚠️ Error processing row {row.get(ID_COLUMN)}: {e}")
                    continue
        
        if not results:
            print("❌ No valid vectors found\n")
            return []
        
        # Sort by similarity (highest first)
        results.sort(key=lambda x: x['similarity'], reverse=True)
        
        # Return top_k results
        top_results = results[:top_k]
        print(f"✅ Computed similarities for {len(results)} vectors\n")
        
        return top_results
    
    except Exception as e:
        print(f"❌ Manual retrieval error: {e}\n")
        import traceback
        traceback.print_exc()
        return []


def display_results(results: list):
    """
    Pretty print the search results
    """
    if not results:
        print("❌ No results to display\n")
        return
    
    print("=" * 60)
    print("🎯 SEARCH RESULTS")
    print("=" * 60)
    
    for i, result in enumerate(results, 1):
        print(f"\n{i}. Chunk ID: {result['id']}")
        print(f"   Similarity: {result['similarity']:.4f} ({result['similarity']*100:.2f}%)")
        
        # Show content if available
        if 'content' in result and result['content']:
            content_preview = result['content'][:]
            print(f"   Content: {content_preview}")
        
        # Show first few dimensions of embedding
        if 'embedding' in result:
            emb_preview = result['embedding'][:384] #10
            print(f"   Embedding preview: [{', '.join(f'{x:.4f}' for x in emb_preview)}...]")
    
    print("\n" + "=" * 60 + "\n")


# ========================================
# DEMO USAGE
# ========================================

if __name__ == "__main__":
    # Example queries
    queries = [
        "radiation effects on astronauts",
        "plant growth in space",
        "microgravity experiments"
    ]
    
    print("🚀 SUPABASE VECTOR RAG SYSTEM")
    print("=" * 60 + "\n")
    
    # Test each query
    for query in queries:
        print(f"📝 Query: '{query}'\n")
        
        # Retrieve similar vectors (tries RPC first, falls back to manual)
        results = retrieve_similar_vectors(query, top_k=3, method="rpc")
        
        # Display results
        display_results(results)
        
        print("\n" + "-" * 60 + "\n")
    
    # Interactive mode
    print("\n💬 Interactive Mode - Enter your queries (type 'quit' to exit):")
    print("-" * 60)
    
    while True:
        user_query = input("\n🔍 Your query: ").strip()
        
        if user_query.lower() in ['quit', 'exit', 'q']:
            print("\n👋 Goodbye!\n")
            break
        
        if not user_query:
            continue
        
        results = retrieve_similar_vectors(user_query, top_k=50, method="rpc")
        display_results(results)