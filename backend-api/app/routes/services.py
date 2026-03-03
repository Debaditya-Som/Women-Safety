from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_services():
    """
    Return a simple list of available services.
    """
    return [
        {"id": "map", "name": "Map", "api": "/map"},
        {"id": "safe_arrival", "name": "Safe arrival", "api": "/safe-arrival"},
        {"id": "report_incident", "name": "Report Incident", "api": "/api/report"},
        {"id": "walk_with_me", "name": "Walk With Me", "api": "/walk-with-me"},
        {"id": "police", "name": "Police", "api": "/api/police"},
        {"id": "medical", "name": "Medical", "api": "/api/hospitals"},
    ]

