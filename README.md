# HireFit
 
<p align="center">
  <b>AI Resume–Job Matcher and Safer Resume Optimizer</b><br/>
  Analyze resume-to-JD fit, identify recruiter-facing gaps, validate evidence, simulate shortlist risk, and generate a safer optimized resume draft.
</p>
 
<p align="center">
  <img alt="React" src="https://img.shields.io/badge/Frontend-React-blue">
  <img alt="Vite" src="https://img.shields.io/badge/Build-Vite-purple">
  <img alt="Tailwind" src="https://img.shields.io/badge/UI-TailwindCSS-06B6D4">
  <img alt="FastAPI" src="https://img.shields.io/badge/Backend-FastAPI-009688">
  <img alt="Python" src="https://img.shields.io/badge/Language-Python-3776AB">
  <img alt="Deployment" src="https://img.shields.io/badge/Deploy-Vercel%20%7C%20Render-black">
</p>
 
---
 
## Live Demo
 
- **Frontend:** https://ai-resume-job-matcher-beta.vercel.app/
- **Backend Health:** https://ai-resume-job-matcher-bfaq.onrender.com/health
 
---

## Overview
 
**HireFit** is an AI-powered resume analysis and safer optimization platform built to help users understand how well their resume aligns with a job description.
 
Unlike basic ATS keyword tools, HireFit combines:
 
- **structured JD parsing**
- **evidence-backed skill validation**
- **recruiter-style shortlist risk analysis**
- **ATS audit**
- **multi-JD comparison**
- **safer resume optimization with honesty guardrails**
 
The goal is not just to score a resume, but to help the user improve it responsibly.
 
---
 
## Why HireFit?
 
Most resume tools fall into one of these traps:
 
- **shallow keyword matching with little explanation**
- **overly aggressive AI rewriting**
- **inflated suggestions that add unsupported claims**
- **no recruiter-facing analysis beyond ATS score**
 
HireFit was designed to solve that by focusing on:
 
- **explainability**
- **safety**
- **evidence-backed recommendations**
- **recruiter relevance**
- **practical resume improvement**
 
---
 
## Key Features
 
### Resume vs Job Description Analysis
- upload resume
- paste JD or fetch from URL
- analyze resume-to-JD alignment
 
### Skill Intelligence
- required skills
- preferred skills
- general skills
- matched skills
- missing skills
- critical missing skills
 
### Evidence-Backed Validation
Checks whether claimed or matched skills are actually supported by:
 
- skills section
- experience
- projects
- summary
- certifications
 
### Experience Alignment
- estimates candidate experience from resume
- compares it against JD minimum experience expectations
 
### Detailed Scoring
- required skill score
- preferred skill score
- general skill score
- weighted skill score
- semantic score
- section evidence score
- skill support score
- critical missing penalty
- overall match score
- fit label
 
### ATS Audit
- contact information checks
- summary quality
- skills section checks
- quantified impact detection
- readability / ATS formatting review
- quick ATS fixes
 
### Recruiter View
- evidence-backed keyword coverage
- why-not-shortlisted simulator
- practical next-step action plan
 
### Safer Resume Optimization
- optimized headline
- optimized summary
- reordered skills
- cleaned experience / project bullets
- before vs after comparison
- unresolved gaps
- manual review warning
- export as TXT / DOC / PDF
 
### Multi-JD Comparison
- compare one resume against multiple job descriptions
- identify stronger and weaker targets
 
### UI / UX
- light / dark mode
- sticky result tabs
- recruiter-focused sections
- structured optimized resume preview
- persistent visitor count
 
---


## Product Philosophy
 
HireFit is intentionally designed with guardrails.
 
### It does **not** try to:
- invent new skills
- fabricate experience
- exaggerate achievements
- blindly optimize for ATS by stuffing keywords
 
### It **does** try to:
- strengthen supported resume content
- surface real gaps honestly
- improve recruiter readability
- help users make safer, more credible edits
 
> Every generated output should still be reviewed manually before use.
 
---
 
## Architecture
 
### Frontend
- React
- Vite
- Tailwind CSS
 
### Backend
- FastAPI
- Python
 
### Matching Engine
- deterministic NLP and scoring
- TF-IDF + cosine similarity for deployment-safe semantic comparison
 
### LLM Layer
- Gemini for explanation and safer rewrite generation
- mock fallback support
 
### Deployment
- Frontend: Vercel
- Backend: Render
 
---
 
## Tech Stack
 
### Frontend
- React
- Vite
- Tailwind CSS
- jsPDF
 
### Backend
- FastAPI
- Uvicorn
- Python
 
### NLP / Analysis
- rule-based parsing
- TF-IDF
- cosine similarity
- evidence validation heuristics
- recruiter-style risk simulation
 
### LLM
- Gemini API
 
---
 
## Project Structure
 
```bash
ai-resume-matcher/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── llm/
│   │   └── utils/
│   ├── data/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
├── README.md
└── .gitignore
```

---
 
## Important Modules
 
### Backend
- `analyzer.py`
- `matcher_engine.py`
- `resume_structurer.py`
- `jd_guardrails.py`
- `jd_url_extractor.py`
- `ats_auditor.py`
- `keyword_coverage.py`
- `shortlist_simulator.py`
- `multi_jd_compare.py`
- `tailor_planner.py`
- `tailor_service.py`
- `tailor_validator.py`
- `resume_tailor_llm.py`
- `tailor_prompt_builder.py`
- `visitor_counter.py`
 
### Frontend
- `UploadForm`
- `ResultTabs`
- `MiniSummaryCards`
- `ATSAuditPanel`
- `KeywordCoveragePanel`
- `ShortlistRiskPanel`
- `MultiJDComparePanel`
- `TailoredResumePanel`
- `TailorComparisonPanel`
- `EvidenceDetailsPanel`
- `ExportTailoredResumeButtons`
- `ThemeToggle`
- `AppBrand`
 
---
 
## Core Workflow
 
1. User uploads a resume  
2. User pastes a JD or fetches one from a URL  
3. HireFit analyzes:
   - skill alignment
   - evidence support
   - experience fit
   - ATS readiness
   - recruiter-facing risk
4. User reviews fit and gaps  
5. User generates a safer optimized draft  
6. User compares before vs after  
7. User exports the optimized version  
 
---
 
## Screenshots
 
### Overview Tab
![Overview](./screenshots/overview.png)
![Overview](./screenshots/overview1.png)
 
### Recruiter View
![Recruiter View](./screenshots/recruiter-view.png)
![Recruiter View](./screenshots/recruiter-view2.png)
 
### Optimized Resume Tab
![Optimized Resume](./screenshots/optimized-resume.png)
![Optimized Resume](./screenshots/optimized-resume2.png)
 
### Deep Dive Tab
![Deep Dive](./screenshots/deep-dive1.png)
![Deep Dive](./screenshots/deep-dive2.png)
![Deep Dive](./screenshots/deep-dive3.png)
 
### Multi-JD Compare
![Compare Jobs](./screenshots/compare-jobs.png)
 
---
 
## Local Setup
 
### Backend
 
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
 ```

Create a .env using .env.example.
 
## Example:
 
 ```bash
APP_NAME=HireFit API
APP_VERSION=1.0.0
ALLOWED_ORIGINS=http://localhost:5173
LLM_PROVIDER=mock
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
 ```
 
---
  
### Frontend
 
```bash
cd frontend
npm install
npm run dev
 ```

Create a frontend .env:
 
VITE_API_BASE_URL=http://127.0.0.1:8000
 
 
---
 
## Deployment
 
### Frontend
 
Deploy on Vercel.
 
Required environment variable:
 
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
 
### Backend
 
Deploy on Render.
 
Important environment variables:
 ```bash
APP_NAME
 
APP_VERSION
 
ALLOWED_ORIGINS
 
LLM_PROVIDER
 
GEMINI_API_KEY
 
GEMINI_MODEL
 ```
 
 
---
 
## Validation and Guardrails
 
HireFit includes both frontend and backend validation for job descriptions.
 
1)  warns on:
 
- code/script-like text
 
- overly short content
 
- non-JD-like content
 
 
2) It also auto-cleans many pasted JD artifacts such as:
 
- copied HTML fragments
 
- extra spacing
 
- portal formatting junk
 
 
This helps reduce false errors for real technical job descriptions.
 
 
---
 
## Safety Notes
 
HireFit should be used as a resume improvement assistant, not as a final truth engine.
 
Users should always:
 
- review every generated change manually
 
- verify every resume claim
 
- avoid adding unsupported skills
 
- treat optimization as guided editing, not automatic truth
 
 
 
---
 
## Current Strengths
 
- Safer than naive AI resume rewriters
 
- More explainable than keyword-only ATS tools
 
- Combines ATS, recruiter, and evidence views
 
- Supports resume-to-multiple-JD comparison
 
- Optimized draft generation is constrained by source evidence
 
- Useful for iterative improvement
 
 
 
---
 
## Current Limitations
 
- JD URL extraction can still be noisy on some job portals
 
- Parsing quality depends on resume structure quality
 
- Score calibration can still vary across niche domains
 
- Optimized output quality depends on source resume clarity
 
- Some domain-specific resumes need stronger customization
 
 
 
---
 
## Future Improvements
 
- Stronger site-specific JD extraction
 
- Richer domain support for non-software roles
 
- Account/login and saved history
 
- Shareable analysis reports
 
- Resume version tracking
 
- Interview question generation from JD gaps
 
- Batch JD testing
 
- Analytics dashboard for repeated applications
 
- Stronger recruiter persona modes
 
- Downloadable branded report PDFs
 
 
 
---
 
## Ideal Use Cases
 
- students preparing for campus placements
 
- job seekers tailoring resumes role-by-role
 
- early-career engineers checking role fit before applying
 
- technical candidates wanting recruiter-style feedback
 
- users comparing one resume across multiple job opportunities
 
 
 
---
 
## Author
 
## Created by Jatin Shukla
 
 
---