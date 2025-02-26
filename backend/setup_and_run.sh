#!/bin/bash  

# Define the virtual environment directory  
VENV_DIR="venv"  

# Create a virtual environment if it doesn't exist  
if [ ! -d "$VENV_DIR" ]; then  
    python -m venv $VENV_DIR  
fi  

# Activate the virtual environment  
source $VENV_DIR/bin/activate  

# Upgrade pip  
pip install --upgrade pip  

# Install the required packages  
pip install -r requirements.txt  

# Run your application  
PORT="${PORT:-8080}"  
uvicorn ai_ml_tools.main:app --port $PORT --host 0.0.0.0 --forwarded-allow-ips '*' --reload  