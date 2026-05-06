from typing import TypedDict, List

class AgentState(TypedDict):
    # Job info
    job_id: str
    job_title: str
    job_company: str
    job_location: str
    job_description: str
    job_apply_link: str

    # Extracted by JD Parser
    company_name: str
    role_title: str
    required_skills: List[str]
    responsibilities: List[str]

    # Resume
    original_resume: str
    rewritten_resume: str

    # Generated content
    cover_letter: str
    company_research: str
    interview_questions: str