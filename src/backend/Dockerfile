FROM python:3.11-slim

WORKDIR /app

COPY src/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/backend/ .
COPY AI-Models/finetuned-pythia-70m-cnn /models/finetuned-pythia-70m-cnn

ENV OPTIMIZED_MODEL_PATH=/models/finetuned-pythia-70m-cnn

EXPOSE 5000

CMD ["python", "app.py"]
