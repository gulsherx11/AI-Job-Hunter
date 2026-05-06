from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import tempfile
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pipeline import run_pipeline
from tools.pdf_reader import read_resume
from tools.job_fetcher import fetch_jobs_multi, fetch_jobs
from agents.interview_chatbot import chat

app = FastAPI(title="AI Job Hunter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Health Check ───────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "message": "AI Job Hunter API is running"}


# ─── Fetch Jobs ─────────────────────────────────────────────
@app.get("/api/jobs")
def get_jobs(
    location: str = "Pakistan",
    query: str = None,
    remote: bool = False
):
    """
    Fetch jobs based on location and optional query.
    If no query provided, fetches both AI and Full Stack jobs.
    """
    try:
        if query:
            jobs = fetch_jobs(
                query=query,
                location=location,
                remote_only=remote
            )
        else:
            jobs = fetch_jobs_multi(
                location=location,
                include_remote=remote
            )
        return {"jobs": jobs, "total": len(jobs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Generate Application Package ───────────────────────────
@app.post("/api/generate")
async def generate(
    job_id: str = Form(...),
    job_title: str = Form(...),
    job_company: str = Form(...),
    job_location: str = Form(...),
    job_description: str = Form(...),
    job_apply_link: str = Form(...),
    resume_pdf: UploadFile = File(...),
):
    """
    Run the full LangGraph pipeline for a selected job.
    Returns rewritten resume, cover letter, research, interview prep.
    """

    # Save uploaded PDF temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await resume_pdf.read())
        pdf_path = tmp.name

    try:
        # Read resume text from PDF
        resume_text = read_resume(pdf_path)

        # Build job object
        job = {
            "id": job_id,
            "title": job_title,
            "company": job_company,
            "location": job_location,
            "description": job_description,
            "apply_link": job_apply_link,
        }

        # Run the full agent pipeline
        result = run_pipeline(job, resume_text)

        return {
            "success": True,
            "company_name": result["company_name"],
            "role_title": result["role_title"],
            "required_skills": result["required_skills"],
            "rewritten_resume": result["rewritten_resume"],
            "cover_letter": result["cover_letter"],
            "company_research": result["company_research"],
            "interview_questions": result["interview_questions"],
            "apply_link": result["job_apply_link"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        os.unlink(pdf_path)


# ─── Interview Chatbot ───────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    history: List[dict]
    state: dict

@app.post("/api/chat")
def interview_chat(req: ChatRequest):
    """
    Live mock interview chatbot endpoint.
    Maintains conversation history between messages.
    """
    try:
        response = chat(
            user_message=req.message,
            chat_history=req.history,
            state=req.state
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Search Jobs ─────────────────────────────────────────────
@app.get("/api/jobs/search")
def search_jobs(
    q: str,
    location: str = "Pakistan",
    remote: bool = False
):
    """Search jobs with a custom query."""
    try:
        jobs = fetch_jobs(query=q, location=location, remote_only=remote)
        return {"jobs": jobs, "total": len(jobs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))