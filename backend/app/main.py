from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.database import conn, cursor
from app.auth import auth_router
from app.websocket import ws_router
app= FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://yourdomain.com"
]
,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(ws_router) 
@app.get("/")
def root():
    if not cursor:
        raise HTTPException(status_code=500, detail="❌ Database connection failed (cursor is None)")
    try:
        cursor.execute("SELECT 1;")
        return {"message": "✅ FastAPI is connected to Supabase!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Query failed: {str(e)}")
