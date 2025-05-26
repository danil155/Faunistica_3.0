FROM python:3.12-slim

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x init.sh wait-for-postgres.sh

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001"]
