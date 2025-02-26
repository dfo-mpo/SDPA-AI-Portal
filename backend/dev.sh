#!/bin/bash 

PORT="${PORT:-8080}"
python -m uvicorn ai_ml_tools.main:app --port $PORT --host 0.0.0.0 --forwarded-allow-ips '*' --reload