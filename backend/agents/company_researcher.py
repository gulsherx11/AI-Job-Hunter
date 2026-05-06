from tavily import TavilyClient
from tools.llm import ask_llm
from state import AgentState
import os
from dotenv import load_dotenv

load_dotenv()
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

def research_company(state: AgentState) -> AgentState:
    print("\n🌐 Agent 3: Researching company online...")

    queries = [
        f"{state['company_name']} company mission values culture",
        f"{state['company_name']} recent news 2025",
        f"{state['company_name']} work environment employees"
    ]

    all_results = []
    for query in queries:
        try:
            results = tavily.search(query=query, max_results=2)
            for r in results["results"]:
                all_results.append(f"Source: {r['url']}\n{r['content']}")
        except Exception as e:
            print(f"  Search failed for '{query}': {e}")

    raw_research = "\n\n".join(all_results)
    print(f"✅ Found {len(all_results)} web sources")

    prompt = f"""
    Based on these web search results about {state['company_name']},
    write a concise company research summary covering:
    
    1. What the company does (core product/service)
    2. Mission and values
    3. Culture and work environment
    4. Recent news or developments
    5. Why someone would want to work there
    
    Web Results:
    {raw_research[:4000]}
    
    Write 3-4 professional paragraphs.
    This will be used to personalize a cover letter.
    """

    state["company_research"] = ask_llm(prompt)
    print("✅ Company research complete")
    return state