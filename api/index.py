import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = str(Path(__file__).parent.parent / "backend")
sys.path.insert(0, backend_dir)

# Override dotenv to not fail
os.environ.setdefault("MONGO_URL", "")
os.environ.setdefault("DB_NAME", "service_domicile")
os.environ.setdefault("JWT_SECRET", "fallback-secret")

from server import app
