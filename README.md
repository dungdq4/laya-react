# Laya — ReactJS Remix

A modern, responsive React + Vite + Tailwind CSS remix of the **Laya Demo** (Fast System 1 Decisions with Calibrated Probabilities).

## 🚀 Features

- **Decisions, Not Text**: Implements the System 1 decision engine pattern with **`choice`**, **`score`**, and **`noul`** typed questions.
- **8 Core Patterns (Tabs)**:
  1. **Support triage**: Multi-question classification (`intent`, `is_urgent`, `frustration`, `refund_requested`, `churn_risk`) with code-level routing thresholds.
  2. **Email + phishing**: In-code email body cleaner (strips signatures, quotes, legal disclaimers) + spam & phishing quarantine detection.
  3. **LLM guardrails**: Jailbreak, prompt injection, sensitive data, and harm severity screening before expensive LLMs.
  4. **RAG passage filter**: Multi-passage batched evaluation scoring relevance, contradictions, and injection in a single pass.
  5. **Moderation**: Toxic, harassment, threat, spam detection and composite severity scoring ($3 \times \text{threat} + 2 \times \text{harassment} + 1.5 \times \text{toxic} + \text{spam}$).
  6. **Model routing**: Multi-factor routing to the cheapest capable model based on difficulty and domain.
  7. **Multilingual routing**: Up-front script and language detection before forward pass to route to either `laya` or `laya-multilingual`.
  8. **Playground**: Free-form JSON state and typed questions editor matching the exact Laya API shape.

- **Interactive Probability Inspector**: Click on any row in the answers table to view the full calibrated probability distribution and bar charts.
- **Instant Client-side Simulation Engine**: Runs offline out-of-the-box with realistic sub-50ms latencies and calibrated probabilities, without needing heavy PyTorch/CUDA weights installed locally.
- **Clean Dark Glassmorphism UI**: Built with Tailwind CSS v4 and Lucide React icons.

## 🛠️ Getting Started

```bash
cd laya-react
npm install
npm run dev
```

The application will launch at `http://localhost:5173`.

## 📦 Production Build

```bash
npm run build
npm run preview
```

## 📂 Project Structure

```
laya-react/
├── src/
│   ├── components/
│   │   ├── tabs/
│   │   │   ├── SupportTriageTab.tsx
│   │   │   ├── EmailPhishingTab.tsx
│   │   │   ├── GuardrailsTab.tsx
│   │   │   ├── RagFilterTab.tsx
│   │   │   ├── ModerationTab.tsx
│   │   │   ├── ModelRoutingTab.tsx
│   │   │   ├── MultilingualRoutingTab.tsx
│   │   │   └── PlaygroundTab.tsx
│   │   ├── ActionBanner.tsx
│   │   ├── AnswersTable.tsx
│   │   ├── Header.tsx
│   │   ├── JsonViewer.tsx
│   │   └── TabNav.tsx
│   ├── services/
│   │   ├── emailUtils.ts      # TypeScript port of email_utils.py regex cleaner
│   │   └── engine.ts          # Decision engine services and business logic
│   ├── types.ts               # Core types for choice, score, noul, state
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── package.json
└── vite.config.ts
```
