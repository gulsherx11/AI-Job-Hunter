from tools.llm import ask_llm
from state import AgentState

def write_cover_letter(state: AgentState) -> AgentState:
    print("\n📝 Agent 4: Writing personalized cover letter...")

    prompt = f"""
    You are an expert cover letter writer.
    
    CANDIDATE RESUME:
    {state['rewritten_resume']}
    
    TARGET ROLE: {state['role_title']} at {state['company_name']}
    
    REQUIRED SKILLS:
    {', '.join(state['required_skills'])}
    
    COMPANY RESEARCH:
    {state['company_research']}
    
    Write a compelling cover letter that:
    1. Opens with a strong hook showing genuine knowledge of the company
    2. Connects candidate's top 3 experiences to the role requirements
    3. Shows cultural fit using specific details from the company research
    4. Closes with a confident call to action
    
    Rules:
    - DO NOT start with "I am writing to apply for"
    - Reference specific company products, missions, or values
    - Sound like a real human wrote it, not AI
    - Keep it under 400 words, 4 paragraphs
    - End with candidate's name from the resume
    
    Format as a proper letter with Dear Hiring Manager and sign off.
    """

    state["cover_letter"] = ask_llm(prompt)
    print("✅ Cover letter written")
    return state