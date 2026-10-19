import base64
import logging
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

from app.config import settings
from app.schemas import DiagnosisCreate, DiagnosisResponse

logger = logging.getLogger(__name__)


class SupabaseService:
    """Service wrapping Supabase PostgreSQL client and Storage bucket operations."""

    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_KEY
        self.bucket_name = settings.SUPABASE_BUCKET
        self._client = None
        self._in_memory_records: List[Dict[str, Any]] = []
        self._init_client()

    def _init_client(self):
        """Initialize the Supabase Python client if credentials are configured."""
        if not self.url or not self.key or "your-" in self.url or "your-" in self.key:
            logger.warning(
                "Supabase URL or Key not set in environment. Running in resilient in-memory fallback mode."
            )
            self._client = None
            self._seed_initial_mock_records()
            return

        try:
            from supabase import create_client, Client
            self._client: Client = create_client(self.url, self.key)
            logger.info("Successfully connected to Supabase database & storage.")
        except Exception as e:
            logger.error(f"Failed to connect to Supabase: {e}. Falling back to in-memory mode.")
            self._client = None
            self._seed_initial_mock_records()

    def is_configured(self) -> bool:
        """Return True if connected to live Supabase."""
        return self._client is not None

    async def upload_image(self, file_bytes: bytes, filename: str, content_type: str = "image/jpeg") -> str:
        """
        Upload image file to Supabase Storage bucket and return public URL.
        Falls back to a Base64 Data URL if storage bucket is not configured.
        """
        if self._client:
            try:
                # Generate unique path: diagnoses/<uuid>_<filename>
                clean_name = "".join(c for c in filename if c.isalnum() or c in ".-_")
                file_path = f"diagnoses/{uuid.uuid4().hex[:10]}_{clean_name}"

                self._client.storage.from_(self.bucket_name).upload(
                    file_path,
                    file_bytes,
                    {"content-type": content_type}
                )

                public_url_res = self._client.storage.from_(self.bucket_name).get_public_url(file_path)
                logger.info(f"Image uploaded to Supabase Storage: {public_url_res}")
                return public_url_res
            except Exception as e:
                logger.warning(f"Supabase storage upload failed ({e}). Storing as Data URL fallback.")

        # Fallback: Encode as Base64 Data URI so frontend can render immediately
        encoded = base64.b64encode(file_bytes).decode("utf-8")
        return f"data:{content_type};base64,{encoded}"

    async def create_diagnosis(self, diagnosis_data: DiagnosisCreate) -> DiagnosisResponse:
        """
        Persist diagnosis to Supabase 'diagnoses' table and return saved record.
        """
        record_id = str(uuid.uuid4())
        now = datetime.utcnow()

        payload = {
            "image_url": diagnosis_data.image_url,
            "category": diagnosis_data.category.value if hasattr(diagnosis_data.category, "value") else diagnosis_data.category,
            "cause": diagnosis_data.cause,
            "risk_level": diagnosis_data.risk_level.value if hasattr(diagnosis_data.risk_level, "value") else diagnosis_data.risk_level,
            "recommended_action": diagnosis_data.recommended_action,
            "is_diy": diagnosis_data.is_diy,
            "professional_required": diagnosis_data.professional_required,
            "safety_warning": diagnosis_data.safety_warning,
            "instructions": diagnosis_data.instructions,
        }

        if self._client:
            try:
                response = self._client.table("diagnoses").insert(payload).execute()
                if response.data and len(response.data) > 0:
                    saved = response.data[0]
                    return DiagnosisResponse(**saved)
            except Exception as e:
                logger.error(f"Error inserting into Supabase table: {e}. Persisting to in-memory fallback.")

        # In-memory persistence fallback
        full_record = {
            "id": record_id,
            "created_at": now.isoformat(),
            **payload
        }
        self._in_memory_records.insert(0, full_record)
        return DiagnosisResponse(**full_record)

    async def get_history(
        self,
        limit: int = 50,
        offset: int = 0,
        category: Optional[str] = None,
        risk_level: Optional[str] = None
    ) -> List[DiagnosisResponse]:
        """
        Retrieve past diagnoses from Supabase ordered by creation date descending.
        """
        if self._client:
            try:
                query = self._client.table("diagnoses").select("*").order("created_at", desc=True)
                if category:
                    query = query.eq("category", category)
                if risk_level:
                    query = query.eq("risk_level", risk_level)
                query = query.range(offset, offset + limit - 1)
                res = query.execute()
                if res.data:
                    return [DiagnosisResponse(**item) for item in res.data]
            except Exception as e:
                logger.error(f"Error querying Supabase history: {e}. Returning in-memory records.")

        # In-memory query fallback
        filtered = self._in_memory_records
        if category:
            filtered = [r for r in filtered if r.get("category") == category]
        if risk_level:
            filtered = [r for r in filtered if r.get("risk_level") == risk_level]

        sliced = filtered[offset: offset + limit]
        return [DiagnosisResponse(**r) for r in sliced]

    async def get_diagnosis_by_id(self, diagnosis_id: str) -> Optional[DiagnosisResponse]:
        """
        Retrieve a single diagnosis by its UUID.
        """
        if self._client:
            try:
                res = self._client.table("diagnoses").select("*").eq("id", diagnosis_id).execute()
                if res.data and len(res.data) > 0:
                    return DiagnosisResponse(**res.data[0])
            except Exception as e:
                logger.error(f"Error fetching diagnosis {diagnosis_id} from Supabase: {e}")

        for r in self._in_memory_records:
            if r.get("id") == diagnosis_id:
                return DiagnosisResponse(**r)
        return None

    def _seed_initial_mock_records(self):
        """Seed initial realistic records so history is immediately testable."""
        self._in_memory_records = [
            {
                "id": "11111111-2222-3333-4444-555555555555",
                "image_url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
                "category": "Leaking pipe",
                "cause": "Loose slip-joint nut and degraded rubber washer beneath the P-trap.",
                "risk_level": "Low",
                "recommended_action": "Tighten slip nut, replace rubber washer, and apply PTFE thread seal tape.",
                "is_diy": True,
                "professional_required": False,
                "safety_warning": "Place catch bucket underneath before unscrewing. Avoid over-tightening plastic fittings.",
                "instructions": [
                    "Turn off under-sink water supply valves.",
                    "Position a bucket beneath P-trap to capture trapped water.",
                    "Hand-loosen slip-joint nuts or use tongue-and-groove pliers gently.",
                    "Inspect washer for cracking and replace if needed.",
                    "Wrap PTFE tape clockwise around threads 3-4 times.",
                    "Reassemble, hand-tighten firmly, and test for leaks with running water."
                ],
                "created_at": "2026-10-17T14:30:00Z"
            },
            {
                "id": "22222222-3333-4444-5555-666666666666",
                "image_url": "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=80",
                "category": "Damaged electrical socket",
                "cause": "Electrical arcing and thermal breakdown causing severe socket discoloration and melted faceplate.",
                "risk_level": "High",
                "recommended_action": "Immediately shut off circuit breaker and schedule a certified electrician.",
                "is_diy": False,
                "professional_required": True,
                "safety_warning": "DANGER: HIGH ELECTROCUTION & FIRE HAZARD. Do not touch faceplate or insert any plugs. De-energize breaker immediately.",
                "instructions": [
                    "Locate your main breaker panel immediately.",
                    "Flip the circuit breaker controlling this receptacle to OFF.",
                    "Verify with a non-contact voltage tester that receptacle is dead.",
                    "Do NOT attempt to disassemble or plug appliances into this receptacle.",
                    "Contact an authorized certified electrician to diagnose branch wiring integrity."
                ],
                "created_at": "2026-10-17T18:15:00Z"
            }
        ]


supabase_service = SupabaseService()
