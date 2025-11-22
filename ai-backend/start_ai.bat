@echo off
echo 🚀 Starting StockMaster AI Backend...
echo.

REM Navigate to AI backend directory
cd /d "C:\Users\HP\Desktop\StockMaster\ai-backend"

echo 📦 Installing Python dependencies...
pip install -r requirements.txt

echo.
echo 🤖 Starting AI Assistant...
echo ✅ Backend will be available at: http://localhost:8000
echo 🌐 API Documentation: http://localhost:8000/docs
echo.

python ai_agent.py

pause