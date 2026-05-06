import json
from tools.llm import ask_llm_json
from state import AgentState

def parse_jd(state: AgentState) -> AgentState:
    print("🔍 Agent 1: Parsing job description...")

    prompt = f"""
    Extract information from this job description.
    
    Job Title: {state['job_title']}
    Company: {state['job_company']}
    
    Job Description:
    {state['job_description'][:3000]}
    
    Return a JSON object with exactly these fields:
    {{
        "company_name": "company name",
        "role_title": "exact job title",
        "required_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
        "responsibilities": ["resp1", "resp2", "resp3", "resp4"]
    }}
    """

    raw = ask_llm_json(prompt)

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        parsed = {
            "company_name": state["job_company"],
            "role_title": state["job_title"],
            "required_skills": ["Python", "Problem Solving", "Communication"],
            "responsibilities": ["Work on projects", "Collaborate with team"]
        }

    state["company_name"] = parsed.get("company_name", state["job_company"])
    state["role_title"] = parsed.get("role_title", state["job_title"])
    state["required_skills"] = parsed.get("required_skills", [])
    state["responsibilities"] = parsed.get("responsibilities", [])

    print(f"✅ Role: {state['role_title']} at {state['company_name']}")
    print(f"✅ Skills: {len(state['required_skills'])} extracted")
    return state