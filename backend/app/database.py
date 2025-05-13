import os
import psycopg2

# Load from .env only in development
if os.environ.get("RENDER") != "true":
    from dotenv import load_dotenv
    load_dotenv()

# Debug
print("DB_HOST:", os.getenv("DB_HOST"))
print("DB_PASSWORD:", "✅" if os.getenv("DB_PASSWORD") else "❌ MISSING")

# Connect
try:
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    cursor = conn.cursor()
    print("✅ Connected to Supabase")
except Exception as e:
    print("❌ Failed to connect to Supabase:", e)
    conn = None
    cursor = None
