# 🩺 HealthScan

**AI-powered medical report analyzer.** Upload a blood test report, get simple explanations anyone can understand.

> "Snap your medical report. Understand your health in seconds."

---

## 🚀 Quick Start

### 1. Clone & Setup
```bash
cd healthscan/backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

### 2. Configure API Key
```bash
copy .env.example .env
# Edit .env and add your Gemini API key
```

### 3. Run
```bash
python -m uvicorn app.main:app --reload --port 8000
```

### 4. Test
Open http://localhost:8000 — you should see the HealthScan API response.

Open http://localhost:8000/docs — Swagger UI to test the upload endpoint.

---

## 📸 How It Works

1. **Upload** a blood test report (JPG, PNG, PDF)
2. **AI reads** every test parameter
3. **Get explanations** in simple English + Hindi
4. **See severity** — 🟢 Green / 🟡 Yellow / 🔴 Red for each value
5. **Overall summary** — quick health overview

---

## ⚠️ Disclaimer

This tool is for **informational purposes only** and is **NOT medical advice**.
Always consult a qualified healthcare professional for diagnosis and treatment.

---

## 🛠️ Tech Stack

- **Backend:** FastAPI (Python)
- **AI:** Google Gemini / OpenAI GPT-4 Vision
- **Database:** SQLite (Phase 1)
- **Frontend:** HTML + CSS + JS

---

Built with ❤️ to make healthcare more accessible.
