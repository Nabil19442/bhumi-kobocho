import sys
import types
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent
_repo_root = _backend_dir.parent

for _p in (str(_backend_dir), str(_repo_root)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

if "backend" not in sys.modules:
    _backend_pkg = types.ModuleType("backend")
    _backend_pkg.__path__ = [str(_backend_dir)]
    sys.modules["backend"] = _backend_pkg
