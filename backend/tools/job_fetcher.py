import requests
import os
from dotenv import load_dotenv

load_dotenv()

JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")

HEADERS = {
    "X-RapidAPI-Key": JSEARCH_API_KEY,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
}

def fetch_jobs(
    query: str,
    location: str = "Pakistan",
    num_pages: int = 1,
    remote_only: bool = False
) -> list:
    """
    Fetch jobs from JSearch API (pulls from LinkedIn, Indeed, Glassdoor).
    Returns a clean list of job objects.
    """
    print(f"🔍 Fetching jobs for: '{query}' in '{location}'...")

    params = {
        "query": f"{query} in {location}",
        "page": "1",
        "num_pages": str(num_pages),
        "date_posted": "month",
    }

    if remote_only:
        params["remote_jobs_only"] = "true"

    try:
        response = requests.get(
            "https://jsearch.p.rapidapi.com/search",
            headers=HEADERS,
            params=params,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()

        jobs = []
        for job in data.get("data", []):
            jobs.append({
                "id": job.get("job_id", ""),
                "title": job.get("job_title", ""),
                "company": job.get("employer_name", ""),
                "location": (job.get("job_city") or "") + ", " + (job.get("job_country") or ""),
                "type": job.get("job_employment_type", ""),
                "is_remote": job.get("job_is_remote", False),
                "description": job.get("job_description", ""),
                "apply_link": job.get("job_apply_link", ""),
                "posted_at": job.get("job_posted_at_datetime_utc", ""),
                "salary_min": job.get("job_min_salary", None),
                "salary_max": job.get("job_max_salary", None),
                "logo": job.get("employer_logo", None),
            })

        print(f"✅ Found {len(jobs)} jobs")
        return jobs

    except Exception as e:
        print(f"❌ Job fetch error: {e}")
        return []


def fetch_jobs_multi(
    location: str = "Pakistan",
    include_remote: bool = True
) -> list:
    """
    Fetches AI/ML jobs. Optimized to avoid timeout.
    Only fetches from a single query to keep it fast.
    """
    # Use a single comprehensive query instead of multiple sequential calls
    query = "AI Engineer OR Machine Learning Engineer"
    
    jobs = fetch_jobs(query=query, location=location, num_pages=1)
    
    print(f"✅ Total jobs fetched: {len(jobs)}")
    return jobs