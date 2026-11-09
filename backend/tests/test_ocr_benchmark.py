"""
Test OCR benchmark generation and report verification.
"""

import os
from backend.ocr_benchmark import run_benchmark, BENCHMARK_REPORT_PATH


def test_ocr_benchmark_runs_and_writes_report():
    bench = run_benchmark()
    assert "field_totals" in bench
    assert "condition_stats" in bench
    assert "deed_no" in bench["field_totals"]
    assert bench["field_totals"]["deed_no"]["total"] == 40

    assert os.path.exists(BENCHMARK_REPORT_PATH)
    with open(BENCHMARK_REPORT_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    assert "Optical Character Recognition" in content
    assert "DEMO DATA — NOT A LEGAL VERDICT" in content
    assert "Overall Per-Field Extraction Accuracy" in content
