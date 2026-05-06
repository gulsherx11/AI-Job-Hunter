from langgraph.graph import StateGraph, END
from state import AgentState
from agents.jd_parser import parse_jd
from agents.resume_rewriter import rewrite_resume
from agents.company_researcher import research_company
from agents.cover_letter import write_cover_letter
from agents.interview_prep import prepare_interview

def build_pipeline():
    graph = StateGraph(AgentState)

    graph.add_node("parse_jd", parse_jd)
    graph.add_node("rewrite_resume", rewrite_resume)
    graph.add_node("research_company", research_company)
    graph.add_node("write_cover_letter", write_cover_letter)
    graph.add_node("prepare_interview", prepare_interview)

    graph.set_entry_point("parse_jd")
    graph.add_edge("parse_jd", "rewrite_resume")
    graph.add_edge("rewrite_resume", "research_company")
    graph.add_edge("research_company", "write_cover_letter")
    graph.add_edge("write_cover_letter", "prepare_interview")
    graph.add_edge("prepare_interview", END)

    return graph.compile()


def run_pipeline(job: dict, resume_text: str) -> AgentState:
    pipeline = build_pipeline()

    initial_state: AgentState = {
        "job_id": job.get("id", ""),
        "job_title": job.get("title", ""),
        "job_company": job.get("company", ""),
        "job_location": job.get("location", ""),
        "job_description": job.get("description", ""),
        "job_apply_link": job.get("apply_link", ""),
        "company_name": "",
        "role_title": "",
        "required_skills": [],
        "responsibilities": [],
        "original_resume": resume_text,
        "rewritten_resume": "",
        "cover_letter": "",
        "company_research": "",
        "interview_questions": "",
    }

    print("\n🚀 Pipeline started...\n")
    return pipeline.invoke(initial_state)