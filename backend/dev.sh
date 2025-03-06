#!/bin/bash 
# Define the virtual environment directory  
VENV_DIR="venv" 

# Determine the activation script path based on the operating system  
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then  
    ACTIVATE_SCRIPT="$VENV_DIR/bin/activate"  
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then  
    ACTIVATE_SCRIPT="$VENV_DIR/Scripts/activate"  
else  
    echo "Unsupported OS: $OSTYPE"  
    exit 1  
fi  

# Activate the virtual environment  
if [ -f "$ACTIVATE_SCRIPT" ]; then  
    echo "Activating virtual environment..."  
    source $ACTIVATE_SCRIPT  
else  
    echo "Error: Activation script not found at $ACTIVATE_SCRIPT"  
    exit 1  
fi  

# Run your application  
PORT="${PORT:-8080}"  
echo "Running application on port $PORT..."  
exec uvicorn ai_ml_tools.main:app --port $PORT --reload   