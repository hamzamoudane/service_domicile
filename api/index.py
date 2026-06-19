import os
from fastapi import FastAPI, APIRouter

app = FastAPI()
router = APIRouter(prefix="/api")

@router.get("/health")
async def health():
    return {"status": "ok", "env": {k: v[:20] for k, v in sorted(os.environ.items()) if not k.startswith("__")}}

app.include_router(router)
