FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv \
  && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/kickhub-bi-seeder-venv
RUN python3 -m venv /opt/kickhub-bi-etl-venv
RUN python3 -m venv /opt/kickhub-bi-ml-venv
RUN python3 -m venv /opt/kickhub-bi-relatorios-venv

COPY bi/python/etl_oltp_to_bi/requirements.txt /tmp/requirements-etl.txt
COPY bi/python/ml_churn_rfm/requirements.txt /tmp/requirements-ml.txt
COPY bi/python/relatorios/requirements.txt /tmp/requirements-relatorios.txt
COPY bi/python/seeder/requirements.txt /tmp/requirements-seeder.txt
RUN /opt/kickhub-bi-seeder-venv/bin/pip install --no-cache-dir -r /tmp/requirements-seeder.txt
RUN /opt/kickhub-bi-etl-venv/bin/pip install --no-cache-dir -r /tmp/requirements-etl.txt
RUN /opt/kickhub-bi-ml-venv/bin/pip install --no-cache-dir -r /tmp/requirements-ml.txt
RUN /opt/kickhub-bi-relatorios-venv/bin/pip install --no-cache-dir -r /tmp/requirements-relatorios.txt

COPY backend/package*.json ./
RUN npm ci

COPY backend/prisma ./prisma
RUN npx prisma generate

COPY backend .

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
