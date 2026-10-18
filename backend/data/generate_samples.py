import hashlib
import os
from PIL import Image, ImageDraw, ImageFont

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLES_DIR = os.path.join(DATA_DIR, "samples")
os.makedirs(SAMPLES_DIR, exist_ok=True)

FONTS_DIR = os.path.join(DATA_DIR, "fonts")
REGULAR_FONT_PATH = os.path.join(FONTS_DIR, "NotoSansBengali-Regular.ttf")
BOLD_FONT_PATH = os.path.join(FONTS_DIR, "NotoSansBengali-Bold.ttf")

def generate_sample_deed(filename, text_lines):
    # Render at 1240x1754 (A4 @ 150dpi), black text on near-white background
    img = Image.new("RGB", (1240, 1754), color=(252, 252, 250))
    draw = ImageDraw.Draw(img)

    # Load Noto Sans Bengali fonts
    title_font = ImageFont.truetype(BOLD_FONT_PATH, 38)
    sub_font = ImageFont.truetype(BOLD_FONT_PATH, 24)
    body_font = ImageFont.truetype(REGULAR_FONT_PATH, 32)
    seal_font = ImageFont.truetype(BOLD_FONT_PATH, 26)

    # Draw ornamental border
    draw.rectangle([40, 40, 1200, 1714], outline=(70, 60, 40), width=4)
    draw.rectangle([52, 52, 1188, 1702], outline=(150, 140, 120), width=2)

    # Header
    y = 80
    header_title = "গণপ্রজাতন্ত্রী বাংলাদেশ (DEMO DEED)"
    bbox_title = draw.textbbox((0, 0), header_title, font=title_font)
    title_w = bbox_title[2] - bbox_title[0]
    draw.text(((1240 - title_w) // 2, y), header_title, font=title_font, fill=(30, 70, 32))
    
    y += 55
    header_sub = "DEMO DATA — NOT A LEGAL VERDICT"
    bbox_sub = draw.textbbox((0, 0), header_sub, font=sub_font)
    sub_w = bbox_sub[2] - bbox_sub[0]
    draw.text(((1240 - sub_w) // 2, y), header_sub, font=sub_font, fill=(180, 40, 40))

    y += 45
    draw.line([80, y, 1160, y], fill=(120, 110, 90), width=3)
    y += 50

    for line in text_lines:
        draw.text((90, y), line, font=body_font, fill=(15, 15, 15))
        y += 65

    # Stamp box (Seal)
    draw.rectangle([860, 1380, 1140, 1630], outline=(180, 40, 40), width=3)
    seal_text = "DEMO SEAL\nBHUMI KOBOCH"
    draw.text((890, 1470), seal_text, font=seal_font, fill=(180, 40, 40))

    filepath = os.path.join(SAMPLES_DIR, filename)
    img.save(filepath, "PNG")

    with open(filepath, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()

    return filepath, file_hash

if __name__ == "__main__":
    lines1 = [
        "দলিল নম্বর (Deed No): 1482/2021",
        "তারিখ (Date): 2021-04-12",
        "মালিকের নাম (Owner Name): মোঃ রফিকুল ইসলাম (Md. Rafiqul Islam)",
        "খতিয়ান নম্বর (Khatian No): 412",
        "দাগ নম্বর (Dag No): 1058",
        "মৌজা (Mouza): মিরপুর (Mirpur), JL-28",
        "জমির পরিমাণ (Area Decimal): 15.5 শতাংশ",
        "জমির শ্রেণি (Class): নাল (Nal / Agricultural)",
        "এনআইডি শেষ ৪ সংখ্যা (NID Last 4): 8912",
        "স্বত্ব বিবরণ: বৈধ খরিদ সূত্রে দখলকার (DEMO SPECIMEN)"
    ]

    path1, hash1 = generate_sample_deed("deed_sample_001.png", lines1)
    print(f"Generated {path1} with SHA-256: {hash1}")

    lines2 = [
        "দলিল নম্বর (Deed No): 8901/2019",
        "তারিখ (Date): 2019-11-20",
        "মালিকের নাম (Owner Name): সুলতানা জাহান (Sultana Jahan)",
        "খতিয়ান নম্বর (Khatian No): 835",
        "দাগ নম্বর (Dag No): 2490",
        "মৌজা (Mouza): বাড্ডা (Badda), JL-12",
        "জমির পরিমাণ (Area Decimal): 8.25 শতাংশ",
        "জমির শ্রেণি (Class): ভিটি (Viti / Homestead)",
        "এনআইডি শেষ ৪ সংখ্যা (NID Last 4): 4431"
    ]
    path2, hash2 = generate_sample_deed("deed_sample_002.png", lines2)
    print(f"Generated {path2} with SHA-256: {hash2}")

    lines3 = [
        "দলিল নম্বর (Deed No): 2311/2018",
        "তারিখ (Date): 2018-02-15",
        "মালিকের নাম (Owner Name): আব্দুল করিম শেখ (Abdul Karim Sheikh)",
        "খতিয়ান নম্বর (Khatian No): 129",
        "দাগ নম্বর (Dag No): 784",
        "মৌজা (Mouza): সাভার (Savar), JL-45",
        "জমির পরিমাণ (Area Decimal): 24.0 শতাংশ",
        "জমির শ্রেণি (Class): বাগান (Orchard)",
        "এনআইডি শেষ ৪ সংখ্যা (NID Last 4): 6023",
        "স্বত্ব বিবরণ: পৈতৃক সূত্রে প্রাপ্ত ও ভোগদখলকার (DEMO SPECIMEN)"
    ]
    path3, hash3 = generate_sample_deed("deed_sample_003.png", lines3)
    print(f"Generated {path3} with SHA-256: {hash3}")

    lines4 = [
        "দলিল নম্বর (Deed No): 710/2008 (বায়া দলিল / Baya Deed)",
        "তারিখ (Date): 2008-03-14",
        "মালিকের নাম (Owner Name): আবুল হোসেন তালুকদার (Abul Hossain Talukdar)",
        "খতিয়ান নম্বর (Khatian No): 410",
        "দাগ নম্বর (Dag No): 2490",
        "মৌজা (Mouza): বাড্ডা (Badda), JL-12",
        "জমির পরিমাণ (Area Decimal): 8.25 শতাংশ",
        "জমির শ্রেণি (Class): ভিটি (Viti / Homestead)",
        "এনআইডি শেষ ৪ সংখ্যা (NID Last 4): 1209",
        "মূল দলিল বিবরণ: সাব-কবলা বায়া দলিল রেকর্ড (DEMO SPECIMEN)"
    ]
    path4, hash4 = generate_sample_deed("deed_sample_004.png", lines4)
    print(f"Generated {path4} with SHA-256: {hash4}")
