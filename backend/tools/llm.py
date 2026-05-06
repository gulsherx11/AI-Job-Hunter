from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_llm(prompt: str, system: str = None, history: list = None) -> str:
    """
    Main LLM function used by all agents.
    Supports simple prompts, system prompts, and full conversation history.
    """
    messages = []

    # Add system prompt if provided
    if system:
        messages.append({"role": "system", "content": system})

    # Add conversation history if provided (for chatbot)
    if history:
        messages.extend(history)

    # Add the main prompt
    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=2048,
        temperature=0.7
    )

    return response.choices[0].message.content.strip()


def ask_llm_json(prompt: str) -> str:
    """
    LLM call that forces JSON output.
    Used by JD parser where we need structured data back.
    """
    messages = [
        {
            "role": "system",
            "content": "You are a data extractor. Always respond with valid JSON only. No markdown, no explanation, no code blocks."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=1024,
        temperature=0.1  # low temperature for structured output
    )

    return response.choices[0].message.content.strip()