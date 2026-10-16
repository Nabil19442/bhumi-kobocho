import hashlib
import os
from PIL import Image, ImageDraw, ImageFont

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLES_DIR = os.path.join(DATA_DIR, "samples")
os.makedirs(SAMPLES_DIR, exist_ok=True)

def generate_sample_deed(filename, text_lines):
    img = Image.new("RGB", (800, 1100), color=(254, 252, 245))
    draw = ImageDraw.Draw(img)

    # Draw border
    draw.rectangle([20, 20, 780, 1080], outline=(70, 60, 40), width=3)
    draw.rectangle([28, 28, 772, 1072], outline=(150, 140, 120), width=1)

    # Header
    y = 50
    draw.text((250, y), "গণপ্রজাতন্ত্রী বাংলাদেশ (DEMO DEED)", fill=(30, 70, 32))
    y += 35
    draw.text((220, y), "DEMO DATA — NOT A LEGAL VERDICT", fill=(180, 40, 40))
    y += 40
    draw.line([50, y, 750, y], fill=(120, 110, 90), width=2)
    y += 30

    for line in text_lines:
        draw.text((60, y), line, fill=(20, 20, 20))
        y += 32

    # Stamp box
    draw.rectangle([550, 850, 730, 1030], outline=(180, 40, 40), width=2)
    draw.text((570, 930), "DEMO SEAL\nBHUMI KOBOCH", fill=(180, 40, 40))

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
