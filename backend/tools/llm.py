from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY is missing. Add it to backend/.env")

client = Groq(api_key=api_key)


def get_model_candidates() -> list[str]:
    """Return a cost-aware list of Groq models that are actually available for this account."""
    configured = os.getenv("GROQ_MODEL")
    env_fallbacks = os.getenv("GROQ_MODEL_FALLBACKS", "")
    candidates = []

    if configured:
        candidates.append(configured)

    for model in env_fallbacks.split(","):
        cleaned = model.strip()
        if cleaned:
            candidates.append(cleaned)

    preferred = [
        "openai/gpt-oss-20b",
        "openai/gpt-oss-120b",
        "groq/compound-mini",
        "groq/compound",
    ]

    seen = set()
    ordered = []
    for model in candidates + preferred:
        if model and model not in seen:
            seen.add(model)
            ordered.append(model)

    return ordered or ["openai/gpt-oss-20b"]


def _call_groq(messages: list, max_tokens: int, temperature: float):
    """Try a series of Groq models in order until one succeeds."""
    last_error = None

    for model in get_model_candidates():
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            return model, response
        except Exception as exc:
            msg = str(exc).lower()
            status = getattr(exc, "status_code", None)
            code = getattr(exc, "code", None)

            is_model_issue = (
                status == 404
                or code == "model_not_found"
                or "model" in msg and ("not found" in msg or "does not exist" in msg)
            )
            is_rate_or_temp_issue = (
                status in (429, 500, 502, 503, 504)
                or "rate limit" in msg
                or "temporar" in msg
                or "overloaded" in msg
            )

            if not is_model_issue and not is_rate_or_temp_issue:
                raise

            last_error = exc

    if last_error is not None:
        raise last_error

    raise RuntimeError("No Groq models are available for this request.")


def ask_llm(prompt: str, system: str = None, history: list = None) -> str:
    """
    Main LLM function used by all agents.
    Supports simple prompts, system prompts, and full conversation history.
    """
    messages = []

    if system:
        messages.append({"role": "system", "content": system})

    if history:
        messages.extend(history)

    messages.append({"role": "user", "content": prompt})

    _, response = _call_groq(messages, max_tokens=2048, temperature=0.7)
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

    _, response = _call_groq(messages, max_tokens=1024, temperature=0.1)
    return response.choices[0].message.content.strip()