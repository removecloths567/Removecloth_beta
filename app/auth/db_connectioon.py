import psycopg2
import os

DATABASE_URL="postgresql://postgres.epaovxvsouskdgfrkekq:removecloths%23G14%40classified@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute("SELECT version();")
    db_version = cur.fetchone()
    print("Connected successfully!")
    print("PostgreSQL version:", db_version)

    cur.close()
    conn.close()

except Exception as e:
    print("Database connection failed:", e)
