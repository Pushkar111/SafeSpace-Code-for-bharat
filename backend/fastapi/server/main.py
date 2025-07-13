from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routes.api import router as api_router
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="SafeSpace API",
    description="Real-time threat intelligence and safety recommendations",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api", tags=["api"])

@app.get("/")
async def root():
    return {"message": "SafeSpace API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "SafeSpace API is operational"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
