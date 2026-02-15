import os
import httpx
import asyncio
from fastapi import HTTPException
import whisper
import threading
import tempfile
import requests
from dotenv import load_dotenv

from utils.helperFunction import extract_json, encrypt_text, decrypt_text
load_dotenv()

LLM_URL = os.getenv('LLM_API_URL')
MODEL = os.getenv('LLM_MODEL_ID')

if not LLM_URL or not MODEL:
    print("LLM_URL or MODEL is not present")

is_local_llm = os.getenv('USE_LOCAL_LLM', True)

try:
    whisper_model = whisper.load_model("base")
    whisper_model_lock = threading.Lock()
except Exception as e:
    print(f"[INIT ERROR] Could not load Whisper model: {e}")
    whisper_model = None

async def send_payload_to_model(client:httpx.AsyncClient ,system_prompt, user_content, temperature):
    headers = {"Content-Type": "application/json"}
    if not is_local_llm:
        api_key = os.getenv('RESONATE_GEMINI_KEY')
        headers["Authorization"] = f"Bearer {api_key}"
    payload = {
        "model": MODEL, 
        "messages": [
            {"role": "system", "content": system_prompt}, 
            {"role": "user", "content": user_content}
        ],
        "temperature":temperature  
    }

    response = await client.post(LLM_URL, json=payload, headers=headers)
    response.raise_for_status()
    result = response.json()
    return extract_json(result['choices'][0]['message']['content'].strip())
    

async def get_summary_and_tags(client: httpx.AsyncClient, text: str):
    print("[AI SERVICE] Fetching summary and tags...")
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
    
    return await send_payload_to_model(client, system_prompt, user_content, 0.5)

async def get_moodScores(client: httpx.AsyncClient, text: str):
    print("[AI SERVICE] Fetching mood scores...")
    
    system_prompt = """You are a sentiment analyzer. 
    Task: Rate emotions from 0.0 to 1.0.
    Output Format: A single JSON object with the key "mood_scores".
    
    Example Output:
    {
        "mood_scores": {
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

    return await send_payload_to_model(client, system_prompt,user_content, 0.1)

async def get_reflection_and_suggestion(client: httpx.AsyncClient, text: str):
    print("[AI SERVICE] Fetching reflection and suggestion...")
    system_prompt = """You are an empathetic counselor. 
    Task: Provide a reflection and an actionable suggestion.
    
    Example Output :
    {
        "reflections": "You seem to be handling a difficult situation with grace.",
        "suggestions": "Take a moment to appreciate your own resilience today."
    }
    """
    
    user_content = f"""TEXT: "{text}"
    INSTRUCTIONS: Return ONLY the JSON object with keys "reflections" and "suggestions" and strictly follow the format."""

    return await send_payload_to_model(client, system_prompt,user_content, 0.4)

async def get_goal(client: httpx.AsyncClient, text: str):
    print("[AI SERVICE] Fetching goals...")
    system_prompt = """You are a goal extractor.
    Task: Identify a specific objective or future plan.
    
    If a goal is found:
    { "goals": "Run a marathon in December" }
    
    If NO goal is found:
    { "goals": "None detected" }
    """
    
    user_content = f"""TEXT: "{text}"
    INSTRUCTIONS: Return ONLY the JSON object with key "goals". Use null if unclear."""
    
    return await send_payload_to_model(client, system_prompt,user_content, 0.2)

MAX_RETRIES = 3
async def get_combined_analysis(client, text, required_keys):
    keys = {
        "ai_summary": '"ai_summary": Concise summary of the text (keep it shorter then actual text).',
        "tags": ' "tags": Array of 3-5 keywords.',
        "mood_scores": '"mood_scores": { "joy": float, "sadness": float, "anger": float, "fear": float, "surprise": float, "love": float, "calm": float } (Rate 0.0 to 1.0)',
        "reflections": '"reflections": An empathetic reflection.',
        "suggestions": '"suggestions": One actionable suggestion.',
        "goals": '"goals": Identify a specific objective or "None detected".'
    }
    requiredAnalysis = f"""
                        {'\n'.join(keys[key] for key in required_keys)}
                    """
    user_content = f"TEXT: '{text}'\nINSTRUCTIONS: Return ONLY the JSON object with requried keys only."
    
    accumulated_results = {}
    for attempt in range(MAX_RETRIES):
        try:
            system_prompt = f"""You are a precise JSON extractor and psychologist. Analyze the text and return ONE JSON object.
                                Required Keys:
                                {requiredAnalysis}
                            """
            print("[AI SERVICE] Performing combined analysis...: Attempt:", attempt + 1)
            results  = await send_payload_to_model(client, system_prompt,user_content, 0.2)
            if isinstance(results, dict):
                accumulated_results.update(results)
            isCompleted = True
            requiredAnalysis = ""
            for key in required_keys:
                if key not in accumulated_results:
                    requiredAnalysis += f"{keys[key]}\n"
                    isCompleted  = False
            if isCompleted:
                print("Successfully")
                return [accumulated_results]
        except: 
            print("Error While combine, reattempt")
    return [accumulated_results]

# Retry 3 Times
async def call_with_retry (func, client , text, required_keys, should_skip):
    if should_skip:
        return None

    for attempt in range(MAX_RETRIES):
        try:
            result = await func(client, text)
            if isinstance(result, dict) and all(key in result for key in required_keys):
                return result
            
            print(f"[WARNING] Invalid format from {func.__name__} (Attempt {attempt + 1}). Retrying...")
        except Exception as e:
            print(f"[ERROR] Exception in {func.__name__} (Attempt {attempt + 1}): {e}")
            # Give some time for ollama
            await asyncio.sleep(1)
    return {}
    
async def get_full_analysis(text: str, status):
    async with httpx.AsyncClient(timeout=180.0) as client:
        results = {}
        if not is_local_llm:
            required_keys = [
                key for key, present in [
                        ("ai_summary", status.hasSummary),
                        ("tags", status.hasTags),
                        ("mood_scores", status.hasMoodScores),
                        ("reflections", status.hasReflections),
                        ("suggestions", status.hasSuggestions),
                        ("goals", status.hasGoals)
                    ] if not present
                ]
                            
            results = await get_combined_analysis(client, text, required_keys)    
        else:
            print("[AI ANALYSIS] Starting concurrent analysis tasks...")
            tasks = [
                call_with_retry(get_summary_and_tags, client, text, ["ai_summary", "tags"], (status.hasSummary and status.hasTags)),
                call_with_retry(get_moodScores, client, text, ["mood_scores"], status.hasMoodScores),
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
        print("[AI ANALYSIS] Analysis Completed.")
        return final_analysis;
    
async def transcribe_audio(audio_url):
    if not whisper_model:
        print("[TRANSCRIPT ERROR] Transcription service is unavailable (Model not loaded).")
        raise HTTPException(status_code=503, detail="Transcription service is unavailable.")
        
    def downloadAudioFromUrl(url):
        print(f"[TRANSCRIPT] Downloading audio from URL")
        try:
            response = requests.get(url, timeout=60)
            response.raise_for_status()
        except Exception as e:
            print(f"[TRANSCRIPT ERROR] Download failed: {e}")
            raise RuntimeError(f"Download failed: {e}")

        tmp = tempfile.NamedTemporaryFile(dir='.', delete=False, suffix=".wav")
        try:
            tmp.write(response.content)
            tmp.flush()
            os.fsync(tmp.fileno())
            return tmp.name
        finally:
            tmp.close() 
            
    def run_whisper():
        with whisper_model_lock:
            return whisper_model.transcribe(audio_path, fp16=False)
      
    audio_path = None
    try:
        print("[TRANSCRIPT] Triggered download and transcribe...")
        audio_path = await asyncio.to_thread(downloadAudioFromUrl, audio_url)
        
        transcript_text = None
        for tries in range(1, 4): 
            try:
                print(f"[TRANSCRIPT] Starting Whisper transcription (Attempt {tries})...")
                result = await asyncio.to_thread(run_whisper)
                transcript_text = result["text"]
                
                if transcript_text: 
                    break 
            except Exception as e:
                print(f"[WARNING] Whisper attempt {tries} failed: {e}")
                await asyncio.sleep(1)

        if not transcript_text:
            raise HTTPException(status_code=500, detail="Transcription failed after retries")
        
        return transcript_text

    except Exception as e:
        print(f"[TRANSCRIPT ERROR] Processing Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if audio_path and os.path.exists(audio_path):
            try:
                os.unlink(audio_path)
                print(f"[CLEANUP] Deleted temp file")
            except Exception as e:
                print(f"[CLEANUP WARNING] Failed to delete temp file: {e}")