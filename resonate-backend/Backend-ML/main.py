from fastapi import FastAPI, HTTPException, Body, BackgroundTasks
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
import httpx

from utils.helperFunction import encrypt_text, decrypt_text
from utils.ai_service import get_full_analysis, transcribe_audio

app = FastAPI()
load_dotenv()

HEADERS = {}

# Define BaseModel
class AnalyzePayload(BaseModel):
    hasTranscript: bool
    hasSummary: bool
    hasTags: bool
    hasMoodScores: bool
    hasReflections: bool
    hasSuggestions: bool
    hasGoals: bool
    audioUrl: str  
    transcript: str 
    userId: str
    entryId: str # Added this to track the entry ID

# This function handles the logic in the background
async def process_background_analysis(payload: AnalyzePayload):
    print(f"Background Task Started for Audio ID: {payload.entryId}")
    transcription = payload.transcript
    
    try:
        if not transcription:
            print("No transcript found, starting transcription...")
            transcription = await transcribe_audio(payload.audioUrl)
        
        model_results = await get_full_analysis(encrypt_text(transcription), payload)
        
        model_results["transcript"] = transcription
        print("Analyze completed, constructed Analysis Results: ", model_results)
        
        node_backend_url = os.getenv("NODE_BACKEND_URL")
        async with httpx.AsyncClient() as client:
            expressPayload = {
                "analysis" : model_results,
                "status" : payload.model_dump()
            }
            response = await client.post(f"{node_backend_url}/audio/handleAiResult", json=expressPayload)
            print("Sent to Express:", response.status_code)
            
    except Exception as e:
        print(f"Background Processing Failed for {payload.entryId}: {e}")

@app.post("/analyze")
async def startAnalyse(payload: AnalyzePayload, background_tasks: BackgroundTasks):
    print("Received Analyze Request. Offloading to background task.")
    # Add the processing function to background tasks
    background_tasks.add_task(process_background_analysis, payload)
    # Return immediately
    return {"message": "Analysis started", "entryId": payload.entryId}