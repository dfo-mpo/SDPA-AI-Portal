# Dockerfile for FastAPI backend  
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10  
  
WORKDIR /app 
  
COPY requirements.txt .  
  
RUN pip install --no-cache-dir -r requirements.txt \ 
    && playwright install --with-deps chromium  
  
COPY . .  
  
EXPOSE 8000  
  
CMD ["uvicorn", "ai_ml_tools.main:app", "--host", "0.0.0.0", "--port", "8000"]  