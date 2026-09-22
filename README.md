# 🛡️ SentinelOffer AI - Fake Offer Letter & Phishing Inspector

[![System Operational](https://img.shields.io/badge/System-Operational-brightgreen)](#)
[![Powered by Gemini](https://img.shields.io/badge/AI-Gemini%203.6%20Flash-blue)](#)
[![Security Headers](https://img.shields.io/badge/Security-Helmet%20%2B%20RateLimit-success)](#)
[![Test Suite](https://img.shields.io/badge/Tests-Jest%20%2B%20Supertest-pass)](#)

**SentinelOffer AI** is an intelligent, real-time cybersecurity assistant designed to protect job seekers, students, and professionals from fake employment offer letters, phishing emails, and recruitment fraud using **Google Gemini 3.6 Flash**.

---

## 🎯 1. Chosen Vertical & Persona

- **Challenge Vertical**: Cybersecurity & Fraud Prevention
- **Target Persona**: Job seekers, recent graduates, remote workers, and email users vulnerable to impersonation scams, advance-fee employment fraud, and fake offer letters.
- **Problem Addressed**: Bad actors increasingly spoof enterprise communications and issue realistic-looking job offers to steal sensitive financial credentials, request up-front equipment payments via gift cards/crypto, or perform identity theft.

---

## 🏗️ 2. Technical Approach & Architecture

SentinelOffer AI utilizes a **Hybrid Multi-Tier Threat Detection Architecture**:

```
 ┌────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
 │  User Input    │ ────> │  Validation Middleware │ ────> │  Heuristic Scanner   │
 │ (Text / File)  │       │ (MIME, Payload Limits) │       │ (Fast Pattern Rules) │
 └────────────────┘       └────────────────────────┘       └──────────┬───────────┘
                                                                      │
 ┌────────────────┐       ┌────────────────────────┐                  ▼
 │  UI Rendering  │ <──── │  Threat Evaluator      │ <──── ┌──────────────────────┐
 │ (ARIA Compliant│       │ (Merged Score & Flags) │       │  Gemini 3.6 Flash AI │
 └────────────────┘       └────────────────────────┘       │ (Structured JSON Schema)
                                                           └──────────────────────┘
```

1. **Validation & Rate Limiting Layer**: Validates payload size (max 15,000 chars, max 5MB file upload) and enforces IP rate limits (100 requests per 15 min) via Express & Helmet security middleware.
2. **Offline Heuristic Pre-Scanner**: Instantly analyzes deterministic threat indicators (e.g., `@gmail.com` recruiter domains, Telegram/WhatsApp interview redirects, gift card/check payment requests, urgent 24-hour pressure tactics).
3. **Gemini 3.6 Flash Engine**: Executes deep semantic analysis with strict structured JSON output schema enforcement (`responseSchema`).
4. **Resilient Retry Mechanism**: Employs `async-retry` with exponential backoff for graceful handling of transient API network latency or 429/503 status codes.

---

## ⚙️ 3. How the Solution Works

1. **Input Submission**: Users paste text or upload documents (PDF, PNG, JPEG, DOCX, TXT) into the interface.
2. **Multi-Stage Threat Scanning**:
   - **Stage 1**: Checks text against rule-based heuristic patterns.
   - **Stage 2**: Sends payload to Gemini 3.6 Flash requesting structured evaluation:
     - `threatScore` (0-100 integer probability score)
     - `flags` (array of specific red flag quotes or anomalies)
     - `summary` (2-sentence verdict summary)
3. **Verdict Calculation**: Combines Gemini AI threat scores with heuristic weighting to present a unified risk badge (**Safe Document**, **Suspicious**, or **High-Risk Scam**).

---

## 🛡️ 4. Key Evaluation Criteria Alignment

| Evaluation Area | Implementation Details |
| :--- | :--- |
| **Code Quality** | Modular MVC-style separation (`src/services`, `src/routes`, `src/middleware`, `src/config`). Clean JSDoc annotations and structured JSON responses. |
| **Security** | Configured with `helmet` security headers, `express-rate-limit`, CORS policies, memory-only file buffer handling (no disk writes), strict input length sanitization, and `.env` key protection. |
| **Efficiency** | Hybrid offline pre-scanning reduces latency; exponential backoff retries preserve quota; static frontend served directly without bundler bloat. Repository size stays under **200 KB**. |
| **Testing** | Automated unit and integration test suite using **Jest** and **Supertest** (`npm test`) covering API endpoints, health status, error handling, and heuristic logic. |
| **Accessibility** | Built with semantic HTML5 tags (`<main>`, `<header>`, `<section>`, `<label>`), explicit ARIA attributes (`aria-live="polite"`, `aria-busy`), high contrast ratios, and full keyboard operability. |
| **Problem Alignment** | Directly targets fake offer letters and phishing emails with actionable red-flag breakdowns for end users. |

---

## 💡 5. Assumptions Made

- **API Availability**: If the Gemini API key is unconfigured or temporarily unreachable, the system automatically falls back to offline heuristic threat scoring without crashing.
- **File Upload Types**: Evaluates text content and common document formats (PDF, PNG, JPEG, TXT, DOCX) up to 5MB.
- **Language**: Current prompt optimization targets English language employment and phishing communications.

---

## 🚀 6. Quick Start & Setup Guide

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/rohit11-alt/PromptWar.git
   cd PromptWar
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and insert your Gemini API Key:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env`:*
   ```env
   PORT=3000
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Start the Application**:
   - **Development mode**:
     ```bash
     npm run dev
     ```
   - **Production mode**:
     ```bash
     npm start
     ```
   - Open your browser at `http://localhost:3000`.

---

## 🧪 7. Running Automated Tests

Run the full Jest test suite:
```bash
npm test
```

Test Coverage includes:
- `GET /api/health` system operational check.
- `POST /api/scan-offer` text scan handling.
- `POST /api/scan-offer` empty payload & 15k character limit validation.
- Unit testing of offline heuristic pattern detection logic.

---

## 📄 License
ISC License © 2026 PhishGuard AI