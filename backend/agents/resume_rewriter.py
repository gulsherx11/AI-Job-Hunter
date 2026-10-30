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
    
    FORMAT REQUIREMENTS (Strict Standard Markdown):
    - Start with Candidate Name as H1: # Candidate Name
    - Follow immediately with contact info line: email@example.com | +123456789 | Location | LinkedIn | GitHub
    - Use H2 for main section headers:
      ## PROFESSIONAL SUMMARY
      ## TECHNICAL SKILLS
      ## WORK EXPERIENCE
      ## PROJECTS
      ## EDUCATION
    - Under WORK EXPERIENCE and PROJECTS, use H3 for each role:
      ### Job Title — Company Name
      *Location | Dates or Present*
      - Strong action-oriented bullet point with quantified metrics
      - Another relevant achievement bullet
    - Under TECHNICAL SKILLS, group skills with bold categories:
      - **Languages & Frameworks:** Python, TypeScript, React...
      - **Tools & Cloud:** Docker, AWS, Git...
    - Do NOT wrap your output in ```markdown or ``` code blocks. Output raw markdown directly.
    """

    state["rewritten_resume"] = ask_llm(prompt)
    print("✅ Resume rewritten and ATS optimized")
    return state
