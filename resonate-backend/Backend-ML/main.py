from fastapi import FastAPI, HTTPException, Body, BackgroundTasks
import os
from pydantic import BaseModel
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import scrypt
from dotenv import load_dotenv
import httpx

from utils.helperFunction import encrypt_text, decrypt_text
from utils.ai_service import get_full_analysis, transcribe_audio

app = FastAPI()
load_dotenv()

HEADERS = {}
node_backend_url = os.getenv("NODE_BACKEND_URL")

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
    entryId: str 

# This function handles the logic in the background
async def process_background_analysis(payload: AnalyzePayload):
    print(f"\n[BACKGROUND] Task Started | Entry ID: {payload.entryId} | User ID: {payload.userId}")
    transcription = payload.transcript
    try:
        if not transcription:
            print(f"[TRANSCRIPT] No transcript provided. Starting transcription")
            transcription = await transcribe_audio(payload.audioUrl)
            print(f"[TRANSCRIPT] Transcription completed for Entry ID: {payload.entryId}")
        else:
            print(f"[TRANSCRIPT] Using provided transcript for Entry ID: {payload.entryId}")
            transcription = decrypt_text(transcription)
            
        print(f"[AI ANALYSIS] Starting full analysis for Entry ID: {payload.entryId}...")
        model_results = await get_full_analysis(transcription, payload)
        
        if payload.transcript == "" or not payload.transcript: 
            model_results["transcript"] = encrypt_text(transcription)
        print(f"[AI ANALYSIS] Analysis completed.")
        
        async with httpx.AsyncClient() as client:
            # Structure of model_results
            # 
            expressPayload = {
                "analysis" : model_results,
                "status" : payload.model_dump()
            }
            print(f"[WEBHOOK] Sending success payload to Express")
            response = await client.post(f"{node_backend_url}/api/webhooks/handleAiResult", json=expressPayload)
            print(f"[WEBHOOK] Success Response Status: {response.status_code}")
            
    except Exception as e:
        print(f"[ERROR] Background Processing Failed for Entry ID: {payload.entryId} | Error: {e}")
        async with httpx.AsyncClient() as client:
            expressPayload = {"status" : payload.model_dump() , "analysis" : "failed"}
            print(f"[WEBHOOK] Sending failure payload to Express...")
            response = await client.post(f"{node_backend_url}/api/webhooks/handleAiResult", json=expressPayload)
            print(f"[WEBHOOK] Failure Response Status: {response.status_code}")

@app.post("/analyze")
async def startAnalyse(payload: AnalyzePayload, background_tasks: BackgroundTasks):
    print(f"[API] Received Analyze Request for Entry ID: {payload.entryId}. Offloading to background task.")
    # Add the processing function to background tasks
    background_tasks.add_task(process_background_analysis, payload)
    # Return immediately
    return {"message": "Analysis started", "entryId": payload.entryId}