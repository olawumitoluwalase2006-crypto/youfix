import json
import logging
import re
from typing import Optional
from PIL import Image
import io

from app.config import settings
from app.schemas import GeminiDiagnosisOutput, CategoryEnum, RiskLevelEnum

logger = logging.getLogger(__name__)

GEMINI_SYSTEM_PROMPT = """You are YouFix AI, an expert industrial safety engineer, master plumber, master electrician, and automotive specialist.
Your mission is to accurately diagnose physical faults from user photos and provide actionable, safety-first repair protocols.

IMAGE VALIDATION GUARDRAIL (CRITICAL FIRST STEP):
First, examine whether the uploaded photo actually depicts a genuine household or automotive fault (plumbing, electrical, structural, or automotive mechanical problem).
- If the image is NOT a household or automotive fault (for example: a human hand, face, selfie, person, animal, food, random object, document, artwork, or unrelated scenery), DO NOT force it into one of the repair categories.
- Instead, you MUST strictly return the following JSON:
{
  "category": "Invalid Image",
  "cause": "The uploaded image does not appear to show a household or automotive fault.",
  "risk_level": "Low",
  "recommended_action": "Please upload a clear, focused photo of an actual repair fault.",
  "is_diy": false,
  "professional_required": false,
  "safety_warning": "Invalid image detected. Please submit a valid photo of a plumbing, electrical, or automotive problem.",
  "instructions": [
    "Ensure the problem area is well-lit",
    "Take a close-up photo of the specific fault",
    "Try uploading again with a valid repair image"
  ]
}

STRICT CLASSIFICATION RULES FOR VALID FAULTS:
If the image IS a valid fault, you MUST strictly classify the problem into EXACTLY ONE of these 5 categories ONLY:
   - "Leaking pipe"
   - "Clogged drain"
   - "Damaged electrical socket"
   - "Flat tire"
   - "Overheating engine"

CRITICAL SAFETY & HAZARD ENFORCEMENT:
- "Damaged electrical socket": Electrical faults carry severe electrocution and fire hazard. You MUST set "professional_required": true, "is_diy": false, and "risk_level": "High". Provide a prominent safety_warning instructing the user to shut off the breaker panel immediately and call a certified electrician.
- "Overheating engine": Pressurized scalding coolant and engine block warping present severe burn and catastrophic engine damage risks. You MUST set "professional_required": true, "is_diy": false, and "risk_level": "High". Provide a prominent safety_warning NEVER to open the radiator cap while hot.
- For "Leaking pipe", "Clogged drain", and "Flat tire", evaluate whether it is safely repairable by an amateur with standard tools. If so, "is_diy": true and "professional_required": false. If severe flooding or structural blowout is evident, escalate to professional.

OUTPUT FORMAT:
Return pure, valid JSON with no markdown wrapping, matching this exact JSON schema:
{
  "category": "Leaking pipe" | "Clogged drain" | "Damaged electrical socket" | "Flat tire" | "Overheating engine" | "Invalid Image",
  "cause": "Detailed technical root cause deduced from visual evidence",
  "risk_level": "Low" | "Medium" | "High",
  "recommended_action": "Concise summary of immediate next step",
  "is_diy": true | false,
  "professional_required": true | false,
  "safety_warning": "Urgent precautions or null if none",
  "instructions": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ]
}
"""


class GeminiService:
    """Service wrapping Google Gemini Vision API for fault diagnosis."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self._client = None
        self._init_client()

    def _init_client(self):
        """Initialize the Google GenAI or GenerativeAI client quickly."""
        if not self.api_key or self.api_key.startswith("your_"):
            logger.warning("Gemini API key is not configured. Mock diagnosis fallback will be used if enabled.")
            return

        try:
            # Fast-response client initialization
            from google import genai
            from google.genai import types
            
            self._client = genai.Client(
                api_key=self.api_key,
                http_options=types.HttpOptions(
                    retry_options=types.HttpRetryOptions(attempts=2, initial_delay=0.5)
                )
            )
            self._sdk_type = "google-genai"
            logger.info("Initialized fast Google GenAI client.")
            return
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            self._client = None

    def is_configured(self) -> bool:
        """Check if Gemini client is ready with a valid API key."""
        return self._client is not None

    async def analyze_image(
        self,
        image_bytes: bytes,
        mime_type: str = "image/jpeg",
        filename: Optional[str] = None
    ) -> GeminiDiagnosisOutput:
        """
        Send image to Gemini Vision API and parse strict structured diagnosis.
        """
        if not self.is_configured():
            if settings.ENABLE_MOCK_FALLBACK:
                logger.info("Using mock diagnosis fallback (no Gemini API key configured).")
                return self._generate_mock_diagnosis(filename)
            raise ValueError(
                "Gemini API key is not configured on the backend. Please provide GEMINI_API_KEY in .env."
            )

        try:
            pil_image = Image.open(io.BytesIO(image_bytes))

            # Call API depending on SDK
            if getattr(self, "_sdk_type", "") == "google-genai":
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=[pil_image, GEMINI_SYSTEM_PROMPT],
                )
                raw_text = response.text
            else:
                # google-generativeai
                response = self._client.generate_content(
                    [GEMINI_SYSTEM_PROMPT, pil_image],
                    generation_config={"response_mime_type": "application/json"}
                )
                raw_text = response.text

            # Parse and clean JSON text
            cleaned_json = self._extract_json(raw_text)
            data = json.loads(cleaned_json)

            # Validate against Pydantic schema (which enforces safety constraints)
            diagnosis = GeminiDiagnosisOutput(**data)
            return diagnosis

        except Exception as e:
            logger.error(f"Gemini Vision API error during analysis: {e}", exc_info=True)
            if settings.ENABLE_MOCK_FALLBACK:
                logger.warning("Falling back to intelligent mock diagnosis due to API failure.")
                return self._generate_mock_diagnosis(filename)
            raise

    @staticmethod
    def _extract_json(text: str) -> str:
        """Extract JSON substring, stripping markdown code blocks if present."""
        text = text.strip()
        # Remove ```json ... ``` wrapper if present
        pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
        return text

    def _generate_mock_diagnosis(self, filename: Optional[str] = None) -> GeminiDiagnosisOutput:
        """
        Smart fallback diagnosis for testing without an active Gemini API key.
        Inspects filename hints or returns a standard DIY or Pro demonstration fault.
        """
        fname = (filename or "").lower()

        # Invalid Image Guardrail Mock
        if any(w in fname for w in ["invalid", "hand", "face", "food", "person", "dog", "cat", "selfie", "random", "scenery"]):
            return GeminiDiagnosisOutput(
                category=CategoryEnum.INVALID_IMAGE,
                cause="The uploaded image does not appear to show a household or automotive fault.",
                risk_level=RiskLevelEnum.LOW,
                recommended_action="Please upload a clear, focused photo of an actual repair fault.",
                is_diy=False,
                professional_required=False,
                safety_warning="Invalid image detected. Please submit a valid photo of a plumbing, electrical, or automotive problem.",
                instructions=[
                    "Ensure the problem area is well-lit",
                    "Take a close-up photo of the specific fault",
                    "Try uploading again with a valid repair image"
                ]
            )

        if "pipe" in fname or "leak" in fname or "water" in fname:
            return GeminiDiagnosisOutput(
                category=CategoryEnum.LEAKING_PIPE,
                cause="Compression joint seal failure along horizontal copper feed line with mineral crusting.",
                risk_level=RiskLevelEnum.LOW,
                recommended_action="Shut off upstream water supply valve, replace worn rubber gasket, and apply PTFE tape.",
                is_diy=True,
                professional_required=False,
                safety_warning="Place a catch basin beneath the pipe before loosening fittings.",
                instructions=[
                    "Locate and close the fixture shutoff valve clockwise.",
                    "Position a bucket beneath the joint to collect residual water.",
                    "Use an adjustable wrench to loosen the compression nut counter-clockwise.",
                    "Remove the old split washer and wipe threads clean with a rag.",
                    "Wrap 3 full layers of PTFE Teflon thread tape in the direction of the threads.",
                    "Hand-tighten the nut, then apply 1/4 turn with the wrench. Turn water on and check for drips."
                ]
            )

        elif "socket" in fname or "electric" in fname or "outlet" in fname:
            return GeminiDiagnosisOutput(
                category=CategoryEnum.DAMAGED_ELECTRICAL_SOCKET,
                cause="Internal terminal screw arc discharge resulting in melted thermoset plastic and carbonized contacts.",
                risk_level=RiskLevelEnum.HIGH,
                recommended_action="Immediately turn off circuit breaker and schedule a certified electrician for replacement.",
                is_diy=False,
                professional_required=True,
                safety_warning="DANGER: SEVERE ELECTROCUTION & FIRE RISK. Do not touch faceplate or insert any plugs. De-energize breaker immediately.",
                instructions=[
                    "Walk to the main electrical panel immediately.",
                    "Locate the breaker corresponding to this room/circuit and switch it to OFF.",
                    "Verify with a non-contact AC voltage tester that the receptacle is dead.",
                    "Tape over the socket faceplate with warning tape to prevent inadvertent use.",
                    "Contact a licensed, insured electrician to test branch circuit conductor insulation and install a replacement GFCI/standard receptacle."
                ]
            )

        elif "tire" in fname or "wheel" in fname:
            return GeminiDiagnosisOutput(
                category=CategoryEnum.FLAT_TIRE,
                cause="Foreign steel fastener embedded in center crown tread causing gradual deflation.",
                risk_level=RiskLevelEnum.MEDIUM,
                recommended_action="Swap with vehicle spare tire or install a temporary vulcanized tire plug kit.",
                is_diy=True,
                professional_required=False,
                safety_warning="Ensure vehicle is parked on level solid ground with parking brake firmly engaged before jacking.",
                instructions=[
                    "Park on level asphalt or concrete, engage emergency brake, and turn on hazard flashers.",
                    "Place wheel chocks on the opposite diagonal wheel.",
                    "Loosen wheel lug nuts 1/2 turn counter-clockwise with lug wrench while tire is still on ground.",
                    "Position the jack at the factory-designated lift point and elevate until tire clears ground.",
                    "Unthread lug nuts, swap flat tire for spare, and hand-tighten nuts in a star pattern.",
                    "Lower car to pavement and tighten lug nuts firmly with full body weight to manufacturer torque spec."
                ]
            )

        elif "engine" in fname or "overheat" in fname:
            return GeminiDiagnosisOutput(
                category=CategoryEnum.OVERHEATING_ENGINE,
                cause="Upper radiator hose clamp rupture and severe coolant boil-off.",
                risk_level=RiskLevelEnum.HIGH,
                recommended_action="Safely pull off the roadway, shut down the engine immediately, and arrange a tow.",
                is_diy=False,
                professional_required=True,
                safety_warning="CRITICAL SAFETY HAZARD: DO NOT open the radiator cap or overflow reservoir while engine is hot! Scalding pressurized steam can cause 3rd-degree burns.",
                instructions=[
                    "Safely steer vehicle onto roadside shoulder or parking lot and turn ignition off immediately.",
                    "Turn on hazard warning lights.",
                    "Pop the hood release latch from the driver footwell, but do not touch the hot hood directly.",
                    "Allow vehicle to rest and cool down for at least 45 minutes without running.",
                    "Inspect the ground underneath for fluorescent green or pink coolant pooling.",
                    "Do NOT attempt to drive further with temperature needle pinned; call roadside towing to a certified repair facility."
                ]
            )

        else:
            # Default to Clogged drain
            return GeminiDiagnosisOutput(
                category=CategoryEnum.CLOGGED_DRAIN,
                cause="Accumulation of soap scum, hair, and organic debris trapped inside the sink P-trap baffle.",
                risk_level=RiskLevelEnum.LOW,
                recommended_action="Mechanically clear the drain opening with a zip-it snake or clear the trap assembly.",
                is_diy=True,
                professional_required=False,
                safety_warning="Wear protective rubber gloves and eye protection. Do not combine chemical cleaners with bleach.",
                instructions=[
                    "Scoop out any standing stagnant water with a small cup.",
                    "Insert a plastic barbed drain snake down the drain opening.",
                    "Twist clockwise and withdraw slowly to pull up the tangled hair obstruction.",
                    "Repeat 2-3 times until snake comes out clean.",
                    "Flush the drain with 1 gallon of boiling hot water mixed with dish soap to dissolve grease residue.",
                    "Run tap at full blast for 60 seconds to ensure swift unobstructed drainage."
                ]
            )


gemini_service = GeminiService()
