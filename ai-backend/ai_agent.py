import sqlite3
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain.agents import create_agent
import os
from dotenv import load_dotenv

load_dotenv()

# -----------------------------
# 1) CREATE FAKE DATABASE HERE
# -----------------------------
# Create a file-based SQLite database instead of in-memory
db_path = "stockmaster.db"
connection = sqlite3.connect(db_path)
cursor = connection.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    stock INTEGER
)
""")

cursor.execute("""
INSERT OR REPLACE INTO products (id, name, stock) VALUES
(1, 'Steel Rods', 12),
(2, 'Copper Sheets', 5),
(3, 'Bolts M10', 0)
""")

connection.commit()
connection.close()

# Use the file-based SQLite database
db = SQLDatabase.from_uri(f"sqlite:///{db_path}")
app = FastAPI(title="StockMaster AI Assistant")

# # --------------------
# # 1) Connecting to  existing stockmasterr db
# # --------------------
# DB_URL = os.getenv("DB_URL")
# db = SQLDatabase.from_uri(DB_URL)

# --------------------
# 2) using Gemini Flash LLM
# --------------------
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

toolkit = SQLDatabaseToolkit(db=db, llm=llm)
agent = create_agent(
    llm=llm,
    toolkit=toolkit,
    verbose=True
)

# --------------------
# 3) FastAPI Endpoint for AI
# --------------------
class Query(BaseModel):
    question: str

@app.post("/ai/query")
def ai_query(q: Query):
    try:
        answer = agent.run(q.question)
        return {"answer": answer}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def root():
    return {"message": "StockMaster AI Agent is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
