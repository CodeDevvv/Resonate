from fastapi import FastAPI, HTTPException, Body
import os
import whisper
from pydantic import BaseModel
import threading
import tempfile
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import scrypt
from dotenv import load_dotenv
import asyncio
import requests

from utils.helperFunction import encrypt_text
from utils.ai_service import get_full_analysis

app = FastAPI()
load_dotenv()

try:
    whisper_model = whisper.load_model("base")
    whisper_model_lock = threading.Lock()
except Exception as e:
    print(f"Could not load Whisper model: {e}")
    whisper_model = None

HEADERS = {}

# Define BaseModel
class AudioRequest(BaseModel):
    url: str

class Status(BaseModel):
    hasSummary: bool
    hasTags: bool
    hasMood: bool
    hasReflections: bool
    hasSuggestions: bool
    hasGoals: bool
class AiAnalysisRequest(BaseModel):
    transcription: str
    status: Status

# --- API Endpoints ---
@app.post("/transcribe")
async def transcribe_audio(payload: AudioRequest):
    if not whisper_model:
        raise HTTPException(status_code=503, detail="Transcription service is unavailable.")
        
    def downloadAudioFromUrl(url):
        print(f"Downloading Audio..")
        try:
            response = requests.get(url, timeout=60) # Sync download
            response.raise_for_status()
        except Exception as e:
            raise RuntimeError(f"Download failed: {e}")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(response.content)
            print("Audio Downloaded.")
            return tmp.name
            
    def run_transcription(audio_path, tries):
        try:
            print("Starting Whisper Transcription, try:", tries)
            with whisper_model_lock:
                result = whisper_model.transcribe(audio_path)
                return result["text"]
        finally:
            if audio_path and os.path.exists(audio_path):
                os.unlink(audio_path)

    try:
        audio_path = await asyncio.to_thread(downloadAudioFromUrl, payload.url)
        transcript_text = None
        if audio_path:
            tries = 0
            if transcript_text is None and tries <= 3:
                tries+=1
                transcript_text = run_transcription(audio_path, tries)
            else:
                raise HTTPException(status_code=400, detail="Transcription not generated")
        print("Audio Transcription Completed")
        encrypted_text = encrypt_text(transcript_text)
        return {
            "transcription": encrypted_text, 
        }

    except Exception as e:
        print(f"Processing Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/analyisTranscript')
async def get_AI_analysis(payload: AiAnalysisRequest):
    print(", Starting AI Analysis...")
    ai_results = await get_full_analysis(payload.transcription, payload.status)
    print("AI Analysis Sucessfully completed. Results :", ai_results)
    return {
        "ai_results" : ai_results
    }
    