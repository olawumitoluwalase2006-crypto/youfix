import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas import GeminiDiagnosisOutput, CategoryEnum, RiskLevelEnum

client = TestClient(app)


def test_health_check():
    """Verify that health check endpoint returns 200 and expected schema."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "gemini_configured" in data
    assert "supabase_configured" in data


def test_categories_endpoint():
    """Verify that the categories endpoint lists the 5 exact project categories."""
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5

    category_names = {c["name"] for c in data}
    expected = {
        "Leaking pipe",
        "Clogged drain",
        "Damaged electrical socket",
        "Flat tire",
        "Overheating engine"
    }
    assert category_names == expected


def test_electrical_socket_safety_constraint():
    """
    Test requirement: If problem involves Damaged electrical socket,
    professional_required MUST be True and is_diy MUST be False.
    """
    diagnosis = GeminiDiagnosisOutput(
        category=CategoryEnum.DAMAGED_ELECTRICAL_SOCKET,
        cause="Melted socket contacts due to overload.",
        risk_level=RiskLevelEnum.HIGH,
        recommended_action="Shut off breaker and call an electrician.",
        is_diy=True,  # Deliberately attempt setting True to test safety validator override
        professional_required=False,  # Deliberately attempt setting False
        safety_warning=None,
        instructions=["Turn off breaker.", "Call electrician."]
    )

    # Validator should have overridden these values
    assert diagnosis.professional_required is True
    assert diagnosis.is_diy is False
    assert diagnosis.safety_warning is not None
    assert "ELECTROCUTION" in diagnosis.safety_warning.upper()


def test_overheating_engine_safety_constraint():
    """
    Test requirement: If problem involves Overheating engine,
    professional_required MUST be True and is_diy MUST be False.
    """
    diagnosis = GeminiDiagnosisOutput(
        category=CategoryEnum.OVERHEATING_ENGINE,
        cause="Coolant leak causing boiling temperature.",
        risk_level=RiskLevelEnum.HIGH,
        recommended_action="Pull over and wait for engine to cool.",
        is_diy=True,
        professional_required=False,
        instructions=["Safely pull over.", "Do not open cap."]
    )

    assert diagnosis.professional_required is True
    assert diagnosis.is_diy is False
    assert "RADIATOR" in diagnosis.safety_warning.upper() or "HOT" in diagnosis.safety_warning.upper()


def test_diy_leaking_pipe_constraint():
    """Verify that a Low-risk leaking pipe remains DIY eligible."""
    diagnosis = GeminiDiagnosisOutput(
        category=CategoryEnum.LEAKING_PIPE,
        cause="Loose slip-joint nut.",
        risk_level=RiskLevelEnum.LOW,
        recommended_action="Tighten nut and wrap tape.",
        is_diy=True,
        professional_required=False,
        instructions=["Turn off water valve.", "Tighten nut."]
    )

    assert diagnosis.is_diy is True
    assert diagnosis.professional_required is False


def test_history_endpoint():
    """Verify that history endpoint returns an array of records."""
    response = client.get("/api/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_stats_endpoint():
    """Verify stats returns accurate aggregated metrics."""
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_diagnoses" in data
    assert "diy_eligible" in data
    assert "professional_required" in data
