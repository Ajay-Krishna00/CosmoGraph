import google.generativeai as genai
import os
from dotenv import load_dotenv


load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def generate_Summary(paragraph: str, query: str):
    response = genai.GenerativeModel("models/gemini-2.5-flash").generate_content(
    f"""
    You are an expert scientific summarizer specializing in space biosciences.
    You are given data extracted from NASA bioscience publications:

    {paragraph}

    The user query is:
    {query}

    Your task:
    - Provide a clear, accurate, and concise scientific summary that directly addresses the query.
    - Highlight key findings, experimental results, and impacts where relevant.
    - If applicable, note knowledge gaps, consensus, or disagreements across studies.
    - Avoid unnecessary repetition; focus on insights that are most relevant to the query.
    - Write in a professional, scientific tone suitable for researchers and mission planners.
    - When presenting points or lists, always use a hyphen (-) instead of an asterisk (*).
    """
)

    print(response.text)