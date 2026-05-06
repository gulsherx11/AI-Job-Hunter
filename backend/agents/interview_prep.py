from tools.llm import ask_llm
from state import AgentState

def prepare_interview(state: AgentState) -> AgentState:
    print("\n🎯 Agent 5: Generating interview prep...")

    prompt = f"""
    You are an expert interview coach preparing a candidate for:
    Role: {state['role_title']} at {state['company_name']}
    
    CANDIDATE RESUME:
    {state['rewritten_resume']}
    
    REQUIRED SKILLS:
    {', '.join(state['required_skills'])}
    
    COMPANY CONTEXT:
    {state['company_research']}
    
    Generate:
    
    ## Top 5 Technical Questions
    For each:
    - **Q:** The question
    - **Why asked:** One sentence
    - **Strong answer:** Based on candidate's actual resume experience
    
    ## Top 3 Behavioral Questions
    For each:
    - **Q:** The question  
    - **STAR Answer:** Using candidate's real experience
    
    ## 3 Smart Questions to Ask the Interviewer
    Reference specific company details from the research.
    
    Make all answers specific to the candidate's actual projects and experience.
    """

    state["interview_questions"] = ask_llm(prompt)
    print("✅ Interview prep complete")
    return state