# peetmaekr — NotebookLM Integration

Python integration สำหรับ NotebookLM-style document Q&A และ summarization ผ่าน **Google Gemini API**

## Features

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `add-file` | อัปโหลดไฟล์ (PDF, TXT, DOCX, …) เป็น source |
| `add-url` | เพิ่ม URL เป็น source |
| `add-text` | เพิ่มข้อความตรงๆ เป็น source |
| `query` | ถาม-ตอบแบบ one-shot โดยอิงเอกสาร |
| `chat` | สนทนา multi-turn โดยอิงเอกสาร |
| `summarize` | สรุปเอกสาร (4 styles) |
| `notes` | สร้าง study notes |
| `audio` | สร้าง podcast-style dialogue script |

## Setup

```bash
# 1. ติดตั้ง dependencies
pip install -r requirements.txt

# 2. ตั้งค่า API key
cp .env.example .env
# แก้ไข .env ใส่ GEMINI_API_KEY จาก https://aistudio.google.com/app/apikey

# 3. รัน CLI
python main.py
```

## ตัวอย่างการใช้งาน

```
> add-file report.pdf
> add-url https://example.com/article
> summarize brief
> query What are the main conclusions?
> chat Tell me more about the methodology
> audio
```

## ใช้งานแบบ Library

```python
from dotenv import load_dotenv
from notebooklm import NotebookLM

load_dotenv()
nb = NotebookLM()

nb.add_file("document.pdf")
nb.add_url("https://example.com/page")

print(nb.summarize("brief"))
print(nb.query("What is the main argument?"))
print(nb.audio_overview())
```

## API Key

รับ API key ได้ฟรีที่ [Google AI Studio](https://aistudio.google.com/app/apikey)
