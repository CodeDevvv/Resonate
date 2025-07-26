from fastapi import FastAPI, HTTPException, Body
import os
import whisper
from pydantic import BaseModel
import threading
import tempfile
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import scrypt
from dotenv import load_dotenv
import httpx
import json
import asyncio

app = FastAPI()
load_dotenv()

try:
    whisper_model = whisper.load_model("base")
    whisper_model_lock = threading.Lock()
except Exception as e:
    print(f"Could not load Whisper model: {e}")
    whisper_model = None

API_URL = os.getenv('LLAMA_MODELURL', 'http://localhost:11434/v1/chat/completions')
HEADERS = {}

class TranscriptPayload(BaseModel):
    transcript: str

def extract_json(text: str):
    """
    Finds and parses the first valid JSON object within a string.
    """
    try:
        start_index = text.find('{')
        end_index = text.rfind('}')
        if start_index != -1 and end_index != -1:
            json_str = text[start_index : end_index + 1]
            return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return None
    return None

def encrypt_transcription(text: str) -> dict:
    encryption_key = os.getenv("ENCRYPTION_KEY")
    if not encryption_key:
        return {"status": False, "message": "Encryption key not found."}
    
    try:
        salt = b'salt'
        key = scrypt(encryption_key.encode('utf-8'), salt, key_len=32, N=16384, r=8, p=1)
        iv = os.urandom(16)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        text_bytes = text.encode('utf-8')
        block_size = AES.block_size
        pad_len = block_size - len(text_bytes) % block_size
        padded_text = text_bytes + bytes([pad_len] * pad_len)
        encrypted = cipher.encrypt(padded_text)
        return {"transcription": f"{iv.hex()}:{encrypted.hex()}", "status": True}
    except Exception as e:
        return {"status": False, "message": f"Encryption failed: {e}"}

async def get_summary_and_tags(client: httpx.AsyncClient, text: str):
    """Fetches the summary and tags."""
    system_prompt = """Analyze the text and return a single, valid JSON object with two keys: "ai_summary" (a concise summary) and "tags" (an array of 3-5 keywords)."""
    payload = {"model": "gemma:2b", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": text}]}
    response = await client.post(API_URL, json=payload)
    result = response.json()
    return extract_json(result['choices'][0]['message']['content'].strip())

async def get_moods(client: httpx.AsyncClient, text: str):
    """Fetches only the mood scores."""
    system_prompt = """You are a sentiment analysis tool. Analyze the user's text and return a single, valid JSON object "mood" containing emotion scores from 0.0 to 1.0.
    The JSON object must ONLY contain the following keys: "joy", "sadness", "anger", "fear", "surprise", "love", "calm".

    Example Input: "I was so happy to see them but sad they had to leave so soon."
    Example JSON Output:    
    "mood": {
        "joy": 0.8,
        "sadness": 0.6,
        "anger": 0.0,
        "fear": 0.0,
        "surprise": 0.1,
        "love": 0.5,
        "calm": 0.2
    }
"""    
    payload = {"model": "gemma:2b", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": text}]}
    response = await client.post(API_URL, json=payload)
    result = response.json()
    return extract_json(result['choices'][0]['message']['content'].strip())

async def get_reflection_and_suggestion(client: httpx.AsyncClient, text: str):
    """Fetches the reflection and suggestion."""
    system_prompt = """Analyze the text and return a single, valid JSON object with two keys: "reflections" (a short, empathetic observation) and "suggestions" (an actionable tip)."""
    payload = {"model": "gemma:2b", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": text}]}
    response = await client.post(API_URL, json=payload)
    result = response.json()
    return extract_json(result['choices'][0]['message']['content'].strip())

async def get_goal(client: httpx.AsyncClient, text: str):
    """Fetches only the goal."""
    system_prompt = """Analyze the text for a stated goal. Return a single, valid JSON object with one key: "goal". The value should be a string of the goal, or null if no goal is found."""
    payload = {"model": "gemma:2b", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": text}]}
    response = await client.post(API_URL, json=payload)
    result = response.json()
    return extract_json(result['choices'][0]['message']['content'].strip())

async def get_full_analysis(text: str):
    """Runs all analysis tasks concurrently and combines the results."""
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            tasks = [
                get_summary_and_tags(client, text),
                get_moods(client, text),
                get_reflection_and_suggestion(client, text),
                get_goal(client, text)
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        summary_tags_res = results[0] if not isinstance(results[0], Exception) else {}
        moods_res = results[1] if not isinstance(results[1], Exception) else {}
        ref_sug_res = results[2] if not isinstance(results[2], Exception) else {}
        goal_res = results[3] if not isinstance(results[3], Exception) else {}

        final_analysis = {
            **summary_tags_res,
            **moods_res,
            **ref_sug_res,
            **goal_res
        }
        return final_analysis

    except Exception as e:
        print(f"Full analysis orchestration failed: {e}")
        return None

# --- API Endpoints ---
@app.post("/transcribe")
async def transcribe_audio(audio: bytes = Body(...)):
    if not whisper_model:
        raise HTTPException(status_code=503, detail="Transcription service is unavailable.")
    audio_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            temp_audio.write(audio)
            audio_path = temp_audio.name
        with whisper_model_lock:
            transcription_result = whisper_model.transcribe(audio_path)
        return encrypt_transcription(transcription_result["text"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        if audio_path and os.path.exists(audio_path):
            os.unlink(audio_path)

@app.post("/analysis_transcript")
async def analysis_transcript(payload: TranscriptPayload):
    full_analysis = await get_full_analysis(payload.transcript)
    print(full_analysis)
    if not full_analysis or not isinstance(full_analysis, dict):
        return {"status": False, "message": "AI analysis returned invalid data."}
    
    required_keys = ['ai_summary', 'tags', 'mood', 'reflections', 'suggestions', 'goal']
    
    if not all(key in full_analysis for key in required_keys):
        return {"status": False, "message": f"AI analysis was incomplete. Missing keys."}
    
    print("Analysis successful. Returning results.")
    return {
        "status": True,
        "results": full_analysis
    }