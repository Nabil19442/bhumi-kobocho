import io
import base64
import hashlib
from typing import Dict, Any, Optional
import qrcode
from PIL import Image

def calculate_sha256(file_bytes: bytes) -> str:
    """Calculates deterministic SHA-256 hex digest of provided bytes."""
    return hashlib.sha256(file_bytes).hexdigest()

def check_file_integrity(
    file_bytes: bytes,
    expected_hash: str
) -> Dict[str, Any]:
    """
    Verifies SHA-256 integrity against expected hash.
    Explicit constraint: Never claim 'valid/ownership proven'.
    Returns status: 'Unchanged' or 'File content changed'.
    """
    calculated_hash = calculate_sha256(file_bytes)
    is_match = (calculated_hash.strip().lower() == expected_hash.strip().lower())
    
    status = "Unchanged" if is_match else "File content changed"
    status_bn = "ফাইল অপরিবর্তিত রয়েছে (ডিজিটাল হ্যাশ মিলেছে)" if is_match else "ফাইলের ভেতরের তথ্য পরিবর্তিত হয়েছে"

    return {
        "status": status,
        "status_bn": status_bn,
        "is_intact": is_match,
        "calculated_sha256": calculated_hash,
        "expected_sha256": expected_hash,
        "disclaimer": "DEMO DATA — not a legal verdict. Cryptographic hash checks document bit-integrity only, never legal title or authentic ownership.",
        "verified_at": "timestamp_now",
        "notice": "Unchanged indicates only that byte data matches the reference file. File content changed indicates any byte modification."
    }

def generate_record_qr_base64(record_data: Dict[str, Any]) -> str:
    """
    Generates a secure QR code encoding record identification + demo hash.
    Returns PNG image data as base64 string.
    """
    payload = (
        f"BHUMI-KOBOCH-DEMO-RECORD\n"
        f"ID: {record_data.get('id', 'N/A')}\n"
        f"Khatian: {record_data.get('khatian_no', 'N/A')} | Dag: {record_data.get('dag_no', 'N/A')}\n"
        f"Area: {record_data.get('area_decimal', 'N/A')} dec\n"
        f"SHA-256: {record_data.get('file_hash_sha256', 'N/A')[:16]}...\n"
        f"NOTICE: DEMO DATA — not a legal verdict"
    )

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=3,
    )
    qr.add_data(payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#1e3a1e", back_color="#ffffff")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"
