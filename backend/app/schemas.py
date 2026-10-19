from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


class CategoryEnum(str, Enum):
    LEAKING_PIPE = "Leaking pipe"
    CLOGGED_DRAIN = "Clogged drain"
    DAMAGED_ELECTRICAL_SOCKET = "Damaged electrical socket"
    FLAT_TIRE = "Flat tire"
    OVERHEATING_ENGINE = "Overheating engine"


class RiskLevelEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class GeminiDiagnosisOutput(BaseModel):
    """Schema expected from Google Gemini Vision API structured response."""
    category: CategoryEnum = Field(
        ...,
        description="The fault category strictly classified into one of the 5 allowed categories."
    )
    cause: str = Field(
        ...,
        description="Detailed technical root cause deduced from visual evidence."
    )
    risk_level: RiskLevelEnum = Field(
        ...,
        description="Hazard rating: Low, Medium, or High."
    )
    recommended_action: str = Field(
        ...,
        description="Primary recommended course of action."
    )
    is_diy: bool = Field(
        ...,
        description="True if the user can safely repair this themselves."
    )
    professional_required: bool = Field(
        ...,
        description="True if a licensed professional is required due to safety or complexity."
    )
    safety_warning: Optional[str] = Field(
        default=None,
        description="Critical hazard or safety instructions."
    )
    instructions: List[str] = Field(
        default_factory=list,
        description="Numbered step-by-step repair or mitigation instructions."
    )

    @model_validator(mode="after")
    def enforce_safety_constraints(self):
        """
        Enforce strict safety rules:
        If a problem involves severe hazards (like Damaged electrical socket or Overheating engine,
        or High risk), professional_required must be set to True and is_diy to False,
        with a prominent safety warning.
        """
        # Critical high hazard categories
        severe_categories = {
            CategoryEnum.DAMAGED_ELECTRICAL_SOCKET,
            CategoryEnum.OVERHEATING_ENGINE,
        }

        if self.category in severe_categories or self.risk_level == RiskLevelEnum.HIGH:
            self.professional_required = True
            self.is_diy = False

            # Ensure a safety warning is populated
            if not self.safety_warning or not self.safety_warning.strip():
                if self.category == CategoryEnum.DAMAGED_ELECTRICAL_SOCKET:
                    self.safety_warning = (
                        "CRITICAL ELECTROCUTION HAZARD: Disconnect circuit breaker immediately! "
                        "Do NOT touch exposed wires or attempt DIY electrical replacement. "
                        "A licensed electrician is legally and safely required."
                    )
                elif self.category == CategoryEnum.OVERHEATING_ENGINE:
                    self.safety_warning = (
                        "SEVERE THERMAL / PRESSURE HAZARD: Do NOT open the radiator cap or coolant reservoir "
                        "while engine is hot! Scalding pressurized coolant can cause critical burns. "
                        "Allow engine to cool for at least 45 minutes and consult a professional mechanic."
                    )
                else:
                    self.safety_warning = (
                        "HIGH HAZARD DETECTED: This repair involves significant risk to life, property, "
                        "or mechanical integrity. Professional intervention is strongly recommended."
                    )
        return self


class DiagnosisCreate(GeminiDiagnosisOutput):
    """Schema for persisting a diagnosis record in Supabase."""
    image_url: str = Field(..., description="Public or storage URL of the uploaded image")


class DiagnosisResponse(DiagnosisCreate):
    """Schema for returning a full diagnosis record to the frontend."""
    id: str = Field(..., description="Unique record identifier (UUID)")
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp of when the diagnosis was generated"
    )

    class Config:
        from_attributes = True


class HealthResponse(BaseModel):
    """API health check response schema."""
    status: str = "ok"
    service: str = "YouFix Backend API"
    version: str = "1.0.0"
    gemini_configured: bool
    supabase_configured: bool
    environment: str
