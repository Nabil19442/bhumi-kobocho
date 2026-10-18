import io
import pytest
from PIL import Image

from backend.app.rules import parse_and_normalize_date, evaluate_date_status, compare_records
from backend.app.names import evaluate_name_status
from backend.app.ocr import extract_fields_from_text, preprocess_image_for_ocr
from backend.app.guardian import generate_guardian_risk_report


def test_bengali_and_english_textual_date_parsing():
    """Verify Bengali and English textual dates are parsed correctly to ISO format."""
    # Bengali textual date: 15 October 2026
    res1 = parse_and_normalize_date("১৫ অক্টোবর ২০২৬")
    assert res1 is not None
    assert res1["primary"] == "2026-10-15"
    assert res1["is_ambiguous"] is False

    # English textual date: 15 October 2026
    res2 = parse_and_normalize_date("15 October 2026")
    assert res2 is not None
    assert res2["primary"] == "2026-10-15"

    # English abbreviated date: 15-Oct-2026
    res3 = parse_and_normalize_date("15-Oct-2026")
    assert res3 is not None
    assert res3["primary"] == "2026-10-15"

    # Bengali year first: 2026 সালের 15 অক্টোবর
    res4 = parse_and_normalize_date("২০২৬ সালের ১৫ অক্টোবর")
    assert res4 is not None
    assert res4["primary"] == "2026-10-15"


def test_date_comparison_with_textual_and_iso_formats():
    """Verify that textual extracted date matches reference ISO date without ambiguity error."""
    status, code, notes = evaluate_date_status("১৫ অক্টোবর ২০২৬", "2026-10-15")
    assert status == "Matched"
    assert code == "DATE_CONVENTION_MATCH"


def test_explainable_recommended_next_steps():
    """Verify that compare_records outputs recommended_next_step on all fields."""
    extracted = {
        "owner_name": "মোঃ সাকিব হাসান",
        "seller_name": "আব্দুল করিম",
        "dag_no": "1234",
        "khatian_no": "456",
        "mouza": "শান্তিপুর",
        "area_decimal": "10.0",
        "document_date": "2026-10-15",
        "deed_no": "2026-0017"
    }
    reference = {
        "owner_name_bn": "মোঃ সাকিব হাসান",
        "seller_name_bn": "আব্দুল করিম",
        "dag_no": "1234",
        "khatian_no": "999",  # Intentional mismatch
        "mouza": "শান্তিপুর",
        "area_decimal": "10.0",
        "document_date": "2026-10-15",
        "deed_no": "2026-0017"
    }
    comp = compare_records(extracted, reference)
    results = comp["results"]

    for r in results:
        assert "recommended_next_step" in r
        assert "recommended_next_step_bn" in r
        assert len(r["recommended_next_step"]) > 0
        assert len(r["recommended_next_step_bn"]) > 0

    khatian_res = next(r for r in results if r["field"] == "khatian_no")
    assert khatian_res["status"] == "Mismatch"
    assert "খতিয়ানের মূল ভলিউম তলব করুন" in khatian_res["recommended_next_step_bn"]


def test_new_name_tokens_transliteration():
    """Verify additional Bangladeshi name tokens match cross-script."""
    # Naim
    res_naim = evaluate_name_status("নাঈম হাসান", "Nayeem Hasan")
    assert res_naim[0] in ("Matched", "Needs review")

    # Tanvir
    res_tanvir = evaluate_name_status("তানভীর আহমেদ", "Tanvir Ahmed")
    assert res_tanvir[0] == "Matched"

    # Morshed
    res_morshed = evaluate_name_status("মোর্শেদ আলম", "Morshed Alam")
    assert res_morshed[0] == "Matched"

    # Tarek
    res_tarek = evaluate_name_status("তারেক রহমান", "Tarek Rahman")
    assert res_tarek[0] == "Matched"

    # Ayesha
    res_ayesha = evaluate_name_status("আয়েশা বেগম", "Ayesha Begum")
    assert res_ayesha[0] == "Matched"


def test_ocr_preprocess_image():
    """Verify PIL-based image preprocessor runs safely on raw image bytes."""
    # Create simple in-memory test image
    img = Image.new("RGB", (800, 600), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    raw_bytes = buf.getvalue()

    processed_bytes = preprocess_image_for_ocr(raw_bytes)
    assert len(processed_bytes) > 0

    # Ensure output can be opened as an image
    out_img = Image.open(io.BytesIO(processed_bytes))
    assert out_img.mode == "L"  # Grayscale
    assert out_img.width >= 1200  # Upscaled for OCR readability


def test_ocr_hal_dag_priority():
    """Verify Hal Dag is extracted with priority over Sabek Dag in deed text."""
    deed_text = """
    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
    সাব-রেজিস্ট্রারের কার্যালয়, সাভার
    দলিল নং: 5812/2022
    মৌজা: সাভার, জেএল নং: 45
    সি.এস. ও এস.এ. খতিয়ান: 45, আর.এস. খতিয়ান: 129
    সাবেক দাগ: 700, হাল দাগ: 784
    জমির পরিমাণ: 7.00 শতাংশ
    বিক্রেতা: সুলতানা জাহান
    ক্রেতা: নাসরিন আক্তার
    """
    fields = extract_fields_from_text(deed_text)
    ext = fields["extracted_fields"]
    assert ext["dag_no"] == "784"  # Hal Dag must be prioritized over Sabek 700
    assert ext["khatian_no"] == "129"  # RS Khatian prioritized over SA 45
    assert ext["seller_name"] == "সুলতানা জাহান"
    assert ext["buyer_name"] == "নাসরিন আক্তার"


def test_ocr_comma_separated_area():
    """Verify area decimal extraction supports Bengali/English comma separated numbers."""
    deed_text = """
    দলিল নং: 2026-11
    মৌজা: কালীপুর
    দাগ নং: 550
    খতিয়ান নং: 220
    জমির পরিমাণ: ১০,৫০ শতক
    তারিখ: 15/08/2026
    """
    fields = extract_fields_from_text(deed_text)
    ext = fields["extracted_fields"]
    assert "১০,৫০" in ext["area_decimal"]


def test_guardian_risk_report_dynamic_parcel_lookup():
    """Verify that Land Guardian risk report dynamically pulls real parcel info for known IDs."""
    report = generate_guardian_risk_report("PCL-DHK-SAV-045-0558")
    assert report is not None
    assert report["dag_no"] == "558"
    assert report["khatian_no"] == "128"
