from tools.llm import ask_llm
from state import AgentState

def rewrite_resume(state: AgentState) -> AgentState:
    print("\n✍️  Agent 2: Rewriting resume for ATS...")

    prompt = f"""
    You are an expert resume writer and ATS optimization specialist.
    
    ORIGINAL RESUME:
    {state['original_resume']}
    
    TARGET ROLE: {state['role_title']} at {state['company_name']}
    
    REQUIRED SKILLS:
    {', '.join(state['required_skills'])}
    
    KEY RESPONSIBILITIES:
    {chr(10).join(state['responsibilities'])}
    
    Rewrite the resume to:
    1. Mirror keywords from the job description for ATS systems
    2. Reorder bullet points to prioritize relevant experience
    3. Reframe experience using the language of the job description
    4. Quantify achievements where possible
    5. NEVER fabricate experience — only reframe what exists
    
    Keep all sections: Summary, Skills, Experience, Education.
    Write the summary specifically for this role and company.
    Return the complete rewritten resume in clean plain text.
    """

    state["rewritten_resume"] = ask_llm(prompt)
    print("✅ Resume rewritten and ATS optimized")
    return state