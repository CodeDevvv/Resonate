import os
from Crypto.Protocol.KDF import scrypt
from dotenv import load_dotenv
import httpx
import asyncio

from utils.helperFunction import extract_json, encrypt_text


API_URL = os.getenv('LLAMA_MODELURL', 'http://localhost:11434/v1/chat/completions')

async def get_summary_and_tags(client: httpx.AsyncClient, text: str):
    print("***** Fetching summary and tags *******")
    system_prompt = """You are a precise JSON extractor. 
                        Task: Analyze the text and return a valid JSON object.
                        Required Keys:
                        - "ai_summary": A concise summary.
                        - "tags": An array of 3-5 keywords.
                        Example Output:
                        {
                            "ai_summary": "The user discusses their daily routine and feelings of productivity.",
                            "tags": ["routine", "productivity", "daily life"]
                        }
                    """
    user_content = f"""TEXT: "{text}"
                        INSTRUCTIONS: Return ONLY the JSON object. Do not add conversational text."""
    
    payload = {
        "model": "gemma:2b", 
        "messages": [
            {"role": "system", "content": system_prompt}, 
            {"role": "user", "content": user_content}
        ],
        "temperature": 0.1  
    }
    response = await client.post(API_URL, json=payload)
    result = response.json()
    return extract_json(result['choices'][0]['message']['content'].strip())

async def get_moods(client: httpx.AsyncClient, text: str):
    print("****** Fetching the mood scores ******")
    
    system_prompt = """You are a sentiment analyzer. 
    Task: Rate emotions from 0.0 to 1.0.
    Output Format: A single JSON object with the key "mood".
    
    Example Output:
    {
        "mood": {
            "joy": 0.1,
            "sadness": 0.0,
            "anger": 0.0,
            "fear": 0.0,
            "surprise": 0.0,
            "love": 0.0,
            "calm": 0.9
        }
    }
    """
    
    user_content = f"""TEXT: "{text}"
    INSTRUCTIONS: Return ONLY the JSON object. Ensure ALL 7 keys (joy, sadness, anger, fear, surprise, love, calm) are present."""

    payload = {
        "model": "gemma:2b", 
        "messages": [
            {"role": "system", "content": system_prompt}, 
            {"role": "user", "content": user_content}
        ],
        "temperature": 0.1
    }
    
    response = await client.post(API_URL, json=payload)
    result = response.json()
    return extract_json(result['choices'][0]['message']['content'].strip())

async def get_reflection_and_suggestion(client: httpx.AsyncClient, text: str):
    print("****** Fetching reflection and suggestion ****** ")
    system_prompt = """You are an empathetic counselor. 
    Task: Provide a short reflection and an actionable suggestion.
    
    Example Output:
    {
        "reflections": "You seem to be handling a difficult situation with grace.",
        "suggestions": "Take a moment to appreciate your own resilience today."
    }
    """
    
    user_content = f"""TEXT: "{text}"
    INSTRUCTIONS: Return ONLY the JSON object with keys "reflections" and "suggestions"."""

    payload = {
        "model": "gemma:2b", 
        "messages": [
            {"role": "system", "content": system_prompt}, 
            {"role": "user", "content": user_content}
        ],
        "temperature": 0.3 # Slightly higher for creativity in suggestions
    }
    
    response = await client.post(API_URL, json=payload)
    result = response.json()
    return extract_json(result['choices'][0]['message']['content'].strip())

async def get_goal(client: httpx.AsyncClient, text: str):
    print("****** Fetching the goals ******")
    system_prompt = """You are a goal extractor.
    Task: Identify a specific objective or future plan.
    
    If a goal is found:
    { "goals": "Run a marathon in December" }
    
    If NO goal is found:
    { "goals": null }
    """
    
    user_content = f"""TEXT: "{text}"
    INSTRUCTIONS: Return ONLY the JSON object with key "goal". Use null if unclear."""

    payload = {
        "model": "gemma:2b", 
        "messages": [
            {"role": "system", "content": system_prompt}, 
            {"role": "user", "content": user_content}
        ],
        "temperature": 0.1
    }
    response = await client.post(API_URL, json=payload)
    result = response.json()
    return extract_json(result['choices'][0]['message']['content'].strip())


# Retry 3 Times
MAX_RETRIES = 3

async def call_with_retry (func, client , text, required_keys, should_skip):
    if should_skip:
        return None

    for attempt in range(MAX_RETRIES):
        try:
            result = await func(client, text)
            if isinstance(result, dict) and all(key in result for key in required_keys):
                return result
            
            print(f"Attempt {attempt + 1}: Invalid format for {func.__name__}. Retrying...")
        except Exception as e:
            print(f"Attempt {attempt + 1}: Error in {func.__name__}: {e}")
        
        # Give some time for ollama
        await asyncio.sleep(1)
    return {}
    

async def get_full_analysis(text: str, status):
    async with httpx.AsyncClient(timeout=180.0) as client:
        tasks = [
            call_with_retry(get_summary_and_tags, client, text, ["ai_summary", "tags"], (status.hasSummary and status.hasTags)),
            call_with_retry(get_moods, client, text, ["mood"], status.hasMood),
            call_with_retry(get_reflection_and_suggestion, client, text, ["reflections", "suggestions"], (status.hasReflections and status.hasSuggestions)),
            call_with_retry(get_goal, client, text, ["goals"], status.hasGoals)
        ]
        
        results = await asyncio.gather(*tasks)
        
        final_analysis = {}
        for res in results:
            if res and isinstance(res, dict):
                for key in ["ai_summary", "reflections", "suggestions", "goals"]:
                    if res.get(key): 
                        res[key] = encrypt_text(res[key])
                    
                final_analysis.update(res)
            
        return final_analysis