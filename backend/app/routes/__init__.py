"""Route definitions package for YouFix backend."""
from app.routes.diagnose import router as diagnose_router
from app.routes.history import router as history_router

__all__ = ["diagnose_router", "history_router"]
