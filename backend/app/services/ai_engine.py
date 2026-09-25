import google.generativeai as genai
from PIL import Image
import json
import whisper
from ..config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# Load Whisper model lazily
whisper_model = None

def get_whisper():
    global whisper_model
    if whisper_model is None:
        whisper_model = whisper.load_model("base")
    return whisper_model

def transcribe_audio_file(audio_path: str) -> str:
    try:
        model = get_whisper()
        result = model.transcribe(audio_path)
        return result.get("text", "")
    except Exception:
        return ""

async def analyze_report(image_path: str, user_text: str = "") -> dict:
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Analyze this municipal complaint.
        User reported text/audio transcription: "{user_text}"
        
        Task:
        1. Classify issue type (e.g., Pothole, Trash Overflow, Water Leakage, Streetlight Failure, Broken Drainage, Illegal Dumping)
        2. Evaluate Severity (LOW, MEDIUM, HIGH, CRITICAL)
        3. Assign a Priority Score between 0.0 and 100.0
        4. Route to Department (Public Works, Sanitation, Water & Sewerage, Electrical Board)

        Return strictly a valid JSON matching this schema:
        {{
            "issue_type": "string",
            "severity": "string",
            "priority_score": float,
            "department": "string"
        }}
        """
        
        image = Image.open(image_path)
        response = model.generate_content([prompt, image])
        
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
    except Exception as e:
        # Fallback values if API fails or key is missing
        return {
            "issue_type": "General Municipal Issue",
            "severity": "MEDIUM",
            "priority_score": 50.0,
            "department": "Public Works"
        }