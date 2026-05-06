from groq import Groq
from state import AgentState
import os
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_system_prompt(state: AgentState) -> str:
    return f"""
    You are a professional technical interviewer at {state['company_name']}.
    You are interviewing for the role of {state['role_title']}.
    
    CANDIDATE RESUME:
    {state['rewritten_resume']}
    
    REQUIRED SKILLS: {', '.join(state['required_skills'])}
    
    COMPANY CONTEXT: {state['company_research'][:500]}
    
    YOUR BEHAVIOR:
    - Ask ONE question at a time
    - After each answer give brief feedback (2-3 sentences)
    - Say what was strong and what was missing
    - Then move to the next question
    - After 5 questions give a final score out of 10 with summary
    - Be professional, realistic, and reference the candidate's actual projects
    - Start by introducing yourself briefly and asking the first question
    """

def chat(
    user_message: str,
    chat_history: list,
    state: dict
) -> str:
    messages = [{"role": "system", "content": get_system_prompt(state)}]
    messages.extend(chat_history)

    if user_message:
        messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=500,
        temperature=0.7
    )

    return response.choices[0].message.content.strip()