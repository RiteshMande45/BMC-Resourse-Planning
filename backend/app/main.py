
from fastapi import FastAPI

app = FastAPI(
    title="BMC Resource Planning System",
    description=(
        "Employee resource allocation, skill matching, "
        "project tracking and workforce analytics."
    ),
    version="0.1.0",
)


@app.get("/")
def home():
    return {
        "message": "BMC Resource Planning API is running",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "bmc-resource-planning-api",
    }
