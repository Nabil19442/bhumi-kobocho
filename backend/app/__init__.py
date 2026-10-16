# App module
import sys
import types
from pathlib import Path

# Path and module aliasing normalization:
# Ensures both backend directory and repo root are on sys.path,
# and aliases 'backend' so legacy absolute imports continue working.
_current_dir = Path(__file__).resolve().parent      # .../backend/app
_backend_dir = _current_dir.parent                  # .../backend
_repo_root = _backend_dir.parent                    # .../repo_root

for _p in (str(_backend_dir), str(_repo_root)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

if "backend" not in sys.modules:
    _backend_pkg = types.ModuleType("backend")
    _backend_pkg.__path__ = [str(_backend_dir)]
    sys.modules["backend"] = _backend_pkg
