---
config:
  layout: fixed
---
flowchart TB
 subgraph Cliente["🖥️ Cliente (Browser)"]
        NEXT["Next.js + TypeScript\nTailwindCSS | Chart.js | SweetAlert2"]
  end
 subgraph Backend["⚙️ Backend (Node.js)"]
        NEST["NestJS + TypeScript\nPrisma ORM | REST API"]
  end
 subgraph IA["🧠 Serviço IA (Python)"]
        PY["Python 3.x\nScikit-learn | Pandas | NumPy\nRandom Forest"]
        MODEL[("modelo.pkl")]
  end
 subgraph Dados["🗄️ Dados"]
        PG[("PostgreSQL")]
  end
    NEST -- Prisma ORM --> PG
    PY -- "lê/grava .pkl" --> MODEL
    PY -- lê features --> PG
    PY -- grava resultados --> PG
    NEXT -- HTTP REST (JSON) --> Backend
    NEST -- subprocess / HTTP --> IA