from pipeline import run_pipeline
from tools.job_fetcher import fetch_jobs

# Fetch one real job
jobs = fetch_jobs("AI Engineer", "Pakistan")

if not jobs:
    print("No jobs found, using mock job")
    job = {
        "id": "test123",
        "title": "AI Engineer",
        "company": "TechCorp",
        "location": "Lahore, Pakistan",
        "description": """
        We need an AI Engineer with Python, PyTorch, LLMs experience.
        Responsibilities include building ML models, working with APIs,
        deploying models on cloud platforms AWS/GCP.
        Requirements: Python, PyTorch, Docker, REST APIs, LangChain.
        """,
        "apply_link": "https://example.com"
    }
else:
    job = jobs[0]
    print(f"Testing with real job: {job['title']} at {job['company']}")

# Use a sample resume text for testing
resume_text = """
John Doe | john@email.com | github.com/johndoe

SUMMARY
Software engineering student passionate about AI and full stack development.

SKILLS
Python, JavaScript, React, FastAPI, PyTorch, Docker, Git

EXPERIENCE
Data Science Lead - AWS Cloud Club (2024)
- Built ML models for classification tasks
- Led team of 5 engineers

PROJECTS
Atlas AI - AI powered learning assistant using PyTorch and LangChain
Eventify Hub - Full stack web app with React and FastAPI

EDUCATION
BS Software Engineering - NUTECH (2021-2025)
"""

result = run_pipeline(job, resume_text)

print("\n--- RESULTS ---")
print(f"Company: {result['company_name']}")
print(f"Role: {result['role_title']}")
print(f"Skills: {result['required_skills']}")
print("\nResume preview:")
print(result['rewritten_resume'][:300])
print("\nCover letter preview:")
print(result['cover_letter'][:300])