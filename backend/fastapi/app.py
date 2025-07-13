from fastapi import FastAPI
from server.routes.api import router as api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SafeSpace API",
    description="Real-time safety intelligence API",
    version="1.0.0"
)

# Include API routes
app.include_router(api_router)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "SafeSpace API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)