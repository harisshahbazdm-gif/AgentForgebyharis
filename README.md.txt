🚀 AgentForge

AgentForge is an AI-powered platform that provides ready-to-use data agents for automating common data workflows such as cleaning datasets, building structured case lists, reshaping data formats, and detecting exceptions.

Upload data → Select agent → Run AI → Get structured output.

✨ Features
🤖 AI Agents

Data Cleaning Agent

Standardizes formatting

Detects duplicates

Fixes inconsistent values

Cleans whitespace

Case Builder Agent

Converts raw datasets into structured case lists

Category Standardizer

Normalizes category values

Data Reshaper

Converts wide datasets into normalized structure

Exception Detector

Identifies anomalies and suspicious records

🧠 Architecture

Frontend:

Lightweight web interface

Agent selection dashboard

Backend:

Vercel Serverless Functions

Anthropic Claude API

Secure environment variable handling

🔒 Security

API keys are NOT stored in this repository.

Environment variables must be configured in deployment settings.

AI processing happens server-side.

⚙️ Local Development
Clone repository
git clone https://github.com/YOUR_USERNAME/agentforge.git
cd agentforge

Install dependencies
npm install

Setup environment variables

Create a file:

.env.local


Add:

ANTHROPIC_API_KEY=


⚠️ Never commit your API key.

Run locally
vercel dev

🚀 Deployment (Vercel)

Import repository into Vercel.

Open:

Project Settings → Environment Variables


Add:

Key: ANTHROPIC_API_KEY
Value: your_api_key_here


Deploy.

📌 Vision

AgentForge aims to build a marketplace of reusable AI agents that organizations can integrate into workflows without complex setup.

Build once. Scale everywhere.

👨‍💻 Author

Haris Shahbaz