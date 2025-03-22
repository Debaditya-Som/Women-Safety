from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import report, hospital,police, chatbot
from app.database import connect_to_mongo, close_mongo_connection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)

# Include report routes
app.include_router(report.router, prefix="/api/report", tags=["report"])

# Include hospital routes
app.include_router(hospital.router, prefix="/api/hospitals", tags=["hospitals"])

app.include_router(police.router, prefix="/api/police", tags=["police"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])

