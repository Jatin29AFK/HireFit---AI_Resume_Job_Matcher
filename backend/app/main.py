import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.matcher import router as matcher_router

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "AI Resume Job Matcher API")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Hybrid AI Resume–Job Matcher backend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matcher_router)


@app.get("/")
def root():
    return {
        "message": f"{APP_NAME} backend is running",
        "docs": "/docs",
        "version": APP_VERSION
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "resume-matcher-api",
        "version": APP_VERSION
    }