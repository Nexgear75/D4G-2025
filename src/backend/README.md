# Flask Summarization API

A Flask API that receives text via POST request and returns a summarized version (10-15 words) using a local AI model.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the API:
```bash
python app.py
```

The API will start on `http://localhost:5000`

## Usage

### Summarize Text

**Endpoint:** `POST /summarize`

**Request Body:**
```json
{
  "text": "Your long text here that needs to be summarized..."
}
```

**Response:**
```json
{
  "summary": "Brief 10-15 word summary",
  "original_length": 150,
  "summary_length": 12
}
```

### Example with curl:
```bash
curl -X POST http://localhost:5000/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here..."}'
```

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy"
}
```

## Model Configuration

By default, the API uses `facebook/bart-large-cnn` model. To use a different model, change the `model_name` variable in `app.py` at line 11.

To use a locally trained model, replace the model name with the path to your local model:
```python
model_name = "../../trained-pythia-70m-xlsum"
```
