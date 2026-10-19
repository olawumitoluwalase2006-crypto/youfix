import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status

from app.supabase_service import supabase_service
from app.schemas import DiagnosisResponse, CategoryEnum, RiskLevelEnum

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["History & Records"])


@router.get("/history", response_model=List[DiagnosisResponse])
async def get_diagnosis_history(
    limit: int = Query(default=50, ge=1, le=100, description="Max records to return"),
    offset: int = Query(default=0, ge=0, description="Records offset for pagination"),
    category: Optional[str] = Query(default=None, description="Filter by fault category"),
    risk_level: Optional[str] = Query(default=None, description="Filter by risk level (Low, Medium, High)")
):
    """
    Retrieve historical diagnosis records with optional category and risk filtering.
    """
    logger.info(f"Fetching history with limit={limit}, offset={offset}, category={category}, risk={risk_level}")
    records = await supabase_service.get_history(
        limit=limit,
        offset=offset,
        category=category,
        risk_level=risk_level
    )
    return records


@router.get("/diagnoses/{diagnosis_id}", response_model=DiagnosisResponse)
async def get_diagnosis_detail(diagnosis_id: str):
    """
    Retrieve full details for a single diagnosis by its UUID.
    """
    logger.info(f"Fetching diagnosis details for ID: {diagnosis_id}")
    record = await supabase_service.get_diagnosis_by_id(diagnosis_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnosis with ID '{diagnosis_id}' not found."
        )
    return record


@router.get("/categories")
async def get_categories() -> List[Dict[str, Any]]:
    """
    Return metadata for the 5 supported problem categories.
    """
    return [
        {
            "id": CategoryEnum.LEAKING_PIPE.value,
            "name": "Leaking pipe",
            "domain": "Plumbing",
            "typical_diy": True,
            "badge_color": "blue",
            "description": "Pipe joint leaks, pinhole punctures, and P-trap drainage seepage."
        },
        {
            "id": CategoryEnum.CLOGGED_DRAIN.value,
            "name": "Clogged drain",
            "domain": "Plumbing",
            "typical_diy": True,
            "badge_color": "cyan",
            "description": "Slow or stopped sinks, showers, and grease/hair obstructions."
        },
        {
            "id": CategoryEnum.DAMAGED_ELECTRICAL_SOCKET.value,
            "name": "Damaged electrical socket",
            "domain": "Electrical",
            "typical_diy": False,
            "badge_color": "red",
            "description": "Arcing, melted plastic, spark scorch marks, and loose terminal blocks."
        },
        {
            "id": CategoryEnum.FLAT_TIRE.value,
            "name": "Flat tire",
            "domain": "Automotive",
            "typical_diy": True,
            "badge_color": "amber",
            "description": "Tread punctures, sidewall deflation, bead leaks, and spare wheel swaps."
        },
        {
            "id": CategoryEnum.OVERHEATING_ENGINE.value,
            "name": "Overheating engine",
            "domain": "Automotive",
            "typical_diy": False,
            "badge_color": "orange",
            "description": "Coolant system boilover, radiator hose rupture, or water pump failure."
        }
    ]


@router.get("/stats")
async def get_diagnosis_stats() -> Dict[str, Any]:
    """
    Return diagnostic statistics for dashboard overview.
    """
    history = await supabase_service.get_history(limit=100)
    total = len(history)
    diy_count = sum(1 for r in history if r.is_diy)
    pro_count = sum(1 for r in history if r.professional_required)
    high_risk_count = sum(1 for r in history if r.risk_level == RiskLevelEnum.HIGH)

    category_counts = {}
    for cat in CategoryEnum:
        category_counts[cat.value] = sum(1 for r in history if r.category == cat.value)

    return {
        "total_diagnoses": total,
        "diy_eligible": diy_count,
        "professional_required": pro_count,
        "high_risk_alerts": high_risk_count,
        "category_breakdown": category_counts
    }
