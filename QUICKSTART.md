# Quick Start Guide

Get the NASA Weather Probability Prediction System up and running in 5 minutes!

## Prerequisites

- **Python 3.11+** installed on your system
- **pip** (Python package manager)
- **git** for cloning the repository

## Installation Steps

### 1. Clone & Navigate
```bash
git clone https://github.com/taefednu/NASA-HACKATHON.git
cd NASA-HACKATHON
```

### 2. Set Up Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Linux/macOS
# OR
venv\Scripts\activate     # On Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment (Optional)
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys (optional)
# GOOGLE_MAPS_API_KEY=your_key_here
```

### 5. Run the Server
```bash
# Set Python path
export PYTHONPATH=$(pwd):$PYTHONPATH  # On Linux/macOS
# OR
set PYTHONPATH=%cd%;%PYTHONPATH%      # On Windows

# Start the server
python backend/api.py
```

## Access the Application

Once the server is running, open your browser and navigate to:

```
http://localhost:5000
```

You should see the interactive web interface with a Google Map!

## Test the API

Try making a request:

```bash
curl "http://localhost:5000/api/health"
```

Or get weather predictions:

```bash
curl "http://localhost:5000/api/analyze?lat=55.7558&lon=37.6173&date=2025-10-15"
```

## What's Next?

- 📖 Read the [full README](README.md) for detailed information
- 📚 Check out the [API Documentation](docs/API.md)
- 🧪 Run tests: `pytest tests/ -v`
- 💻 See [examples/example_usage.py](examples/example_usage.py) for code samples

## Troubleshooting

### Module not found error?
Make sure you've activated the virtual environment and set PYTHONPATH:
```bash
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
```

### Port 5000 already in use?
Edit `backend/api.py` and change the port:
```python
app.run(debug=True, host='0.0.0.0', port=8000)  # Use 8000 instead
```

### Dependencies won't install?
Make sure you're using Python 3.11+:
```bash
python --version
```

## Support

Need help? Open an issue on [GitHub](https://github.com/taefednu/NASA-HACKATHON/issues)!

---

**Enjoy exploring weather predictions! 🌦️**
