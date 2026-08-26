# 🇮🇳 Yojna Setu

### मेरी योजना, मेरी तरक्की।
**National Scheme Bridge Portal**

> **Right Scheme. Right Calculation. Right Channel.**

Yojna Setu is a citizen-first digital platform designed to simplify access to government concessional finance schemes by helping beneficiaries discover suitable schemes, understand their estimated financial commitments, and locate relevant channel partners.

Built for **Smart India Hackathon 2026 — Problem Statement 26092**.

---

## 🚀 Problem

Government concessional financial assistance schemes can provide important support for entrepreneurship and education, but beneficiaries often struggle to understand:

- Which scheme is suitable for their needs?
- Am I potentially eligible?
- How much financial assistance may be available?
- What could my estimated EMI look like?
- Which channel partner should I approach?
- Where is the nearest relevant channel partner?

The existing ecosystem contains multiple schemes, financial institutions and channel partners, creating a complex journey for citizens.

### The Gap

The challenge is not simply the absence of government schemes.

The challenge is the gap between:

**"I need financial assistance."**

and

**"I know which scheme fits me, how the financing works, and where I should proceed."**

Yojna Setu aims to bridge this gap.

---

# 💡 Our Solution

Yojna Setu acts as an **intelligent scheme discovery and access layer** that helps citizens navigate the concessional finance ecosystem.

### The platform focuses on three core capabilities:

```text
        CITIZEN
           │
           ▼
   ┌───────────────────┐
   │  Scheme Matching  │
   └─────────┬─────────┘
             │
             ▼
   ┌───────────────────┐
   │ Financial Planning│
   └─────────┬─────────┘
             │
             ▼
   ┌───────────────────┐
   │ Partner Routing   │
   └─────────┬─────────┘
             │
             ▼
     OFFICIAL CHANNEL
     ✨ Key Features
1. 🧠 Smart Scheme Recommender

The user provides basic information such as:

Purpose of assistance
Project type
Estimated project cost
Income
Education/status information
Location

Yojna Setu evaluates the provided information against configured scheme rules and presents potentially suitable schemes.

Example

A user says:

"Mujhe ₹4 lakh ka loan chahiye dairy business start karne ke liye."

The system processes the user's requirements and identifies relevant schemes based on the configured eligibility rules.

The recommendation also explains why a scheme may be suitable.

2. 🧮 Concessional EMI Calculator

Yojna Setu provides a scheme-aware financial calculator.

Users can explore:

Loan amount
Interest rate
Repayment period
Moratorium
Estimated EMI
Total interest
Total repayment
Applicable concessions

Unlike a generic EMI calculator, the system is designed around scheme-specific financial parameters.

⚠️ Calculations are estimates. Final loan amount, eligibility, interest rate and repayment terms are subject to verification by the concerned authority/channel partner.

3. 📍 Channel Partner Locator

Yojna Setu helps users discover relevant channel partners near their location.

The locator provides:

Partner name
Partner type
Location
Distance
Supported schemes
Partner information
Map-based visualization
Location-based search
Scheme-based filtering

The prototype uses map data and configured partner information to demonstrate intelligent partner discovery.

4. 🗺️ Intelligent Partner Routing

The goal is not simply to find the nearest partner.

The system can consider factors such as:

Scheme Compatibility
        +
Partner Type
        +
Location
        +
Distance
        +
Partner Status
        ↓
Recommended Channel Partner

For the current prototype, partner utilization/status information may use demo/sample data where live government integration is unavailable.

5. 🤖 Scheme Assistant

The Scheme Assistant provides conversational guidance for questions such as:

Which scheme may suit my requirement?
What is a moratorium?
How does the EMI work?
What information is required?
Where can I find a channel partner?

The assistant is designed to simplify government scheme information into citizen-friendly language.

🌐 Multilingual Experience

Yojna Setu is designed with accessibility and multilingual users in mind.

Current interface:

🇬🇧 English
🇮🇳 हिन्दी

The architecture can be extended to additional Indian languages.

🏛️ SIH 2026
Smart India Hackathon 2026

Problem Statement: 26092

Title: AI-Driven Scheme Matching for Marginalized Entrepreneurs

Organization: Ministry of Social Justice and Empowerment (MoSJE)

Department: Department of Social Justice and Empowerment

Category: Software

Theme: Smart Automation

Expected Solution Areas

The problem statement focuses on:

Smart Scheme Recommender
Financial Calculator
Geo-Spatial Partner Locator & Router

Yojna Setu is designed around these three core requirements.

🧩 Existing Ecosystem

Yojna Setu is not intended to replace existing government financing systems.

The government ecosystem already contains:

Government concessional schemes
NSFDC and other development-finance institutions
State Channelising Agencies
Banks
RRBs
NBFC-MFIs
PM-SURAJ
CSCs
Other authorized channel partners
Our Role

Yojna Setu focuses on simplifying the discovery and decision-support journey before or around the official application process.

Government Schemes
        │
        ▼
Existing Government Ecosystem
        │
        │
        ▼
     YOJNA SETU
        │
 ┌──────┼────────┐
 ▼      ▼        ▼
Scheme  Finance  Partner
Match   Planning Routing
 │      │        │
 └──────┼────────┘
        ▼
Official Application / Channel
🎯 Target Users
Primary Users
Marginalized entrepreneurs
First-time entrepreneurs
Eligible beneficiaries seeking concessional finance
Students seeking educational financing
Rural and semi-urban citizens
Users with low financial literacy
Potential Institutional Users
Government departments
Development finance institutions
State Channelising Agencies
Channel partners
CSC operators
🛠️ Technology Stack

The technology stack can evolve as the prototype develops.

Frontend
React
TypeScript / JavaScript
Responsive Web UI
AI
Google Gemini
Google AI Studio
Backend
Node.js / Python
REST APIs
Database
Structured scheme data
Partner data
User/session data
Maps
OpenStreetMap
Leaflet
Automation
n8n where workflow automation is required
🏗️ High-Level Architecture
                    ┌───────────────┐
                    │     USER      │
                    └───────┬───────┘
                            │
                            ▼
                 ┌──────────────────┐
                 │   YOJNA SETU UI  │
                 └────────┬─────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
   Scheme Matcher    EMI Calculator   Partner Locator
          │               │                │
          ▼               ▼                ▼
   Eligibility       Financial       Geo-Spatial
      Rules           Engine           Routing
          │               │                │
          └───────────────┼────────────────┘
                          │
                          ▼
                ┌──────────────────┐
                │ Recommendation   │
                │ & Guidance Layer │
                └────────┬─────────┘
                         │
                         ▼
                Official Ecosystem
🔐 Responsible AI

Yojna Setu is designed as a scheme discovery and guidance platform, not an autonomous loan approval system.

The platform should not:

Approve loans
Guarantee eligibility
Make autonomous credit decisions
Predict a user's repayment ability
Replace the concerned authority or channel partner

AI is primarily used for:

Natural-language understanding
Conversational guidance
Multilingual assistance
Information explanation
User input interpretation

Eligibility and scheme-specific calculations should be governed by structured and verifiable rules/data wherever possible.

⚠️ Prototype Disclaimer

Yojna Setu is currently a Smart India Hackathon prototype.

Some components may use:

Demonstration data
Simulated partner-status information
Configured scheme datasets
Prototype integrations

This should not be interpreted as a live government service or an official loan approval platform.

Final eligibility, sanction, loan amount, interest rate and repayment conditions are determined by the relevant government authority, scheme and channel partner.

📊 Example User Journey
Ravi wants to start a business
Ravi
 │
 │ "I need ₹4 lakh for my business"
 ▼
Yojna Setu
 │
 ▼
Enter basic information
 │
 ▼
Scheme Matching
 │
 ▼
Potentially Suitable Schemes
 │
 ▼
Financial Calculator
 │
 ▼
Estimated EMI / Repayment
 │
 ▼
Channel Partner Locator
 │
 ▼
Eligible/Relevant Partners
 │
 ▼
Official Application Journey
🌟 Why Yojna Setu?
Before

"Mujhe government loan chahiye, lekin kaunsi scheme hai aur kahan apply karna hai?"

With Yojna Setu

"Mujhe apni requirement bataani hai, suitable scheme samajhni hai, financing estimate dekhna hai aur relevant channel partner find karna hai."

In one sentence:

Yojna Setu bridges the gap between citizens and the government concessional finance ecosystem.

📈 Future Roadmap

Potential future improvements include:

More Indian languages
Voice-first scheme discovery
Official government API integrations
Real-time channel partner status
Document assistance
Application tracking
Personalized scheme dashboard
CSC/operator mode
Government administration dashboard
Scheme-data update management
Accessibility improvements
Offline/low-connectivity support
👨‍💻 Team

Project: Yojna Setu

Hackathon: Smart India Hackathon 2026

Problem Statement: 26092

Category: Software

Theme: Smart Automation

Organization: Ministry of Social Justice and Empowerment

📜 License

This project is developed as a hackathon prototype.

Add the appropriate open-source license here if the repository is intended to be publicly distributed.

🇮🇳 Yojna Setu
मेरी योजना, मेरी तरक्की।

Right Scheme. Right Calculation. Right Channel.


### GitHub repo ke liye recommended structure

```text
yojna-setu/
│
├── README.md
├── LICENSE
├── .gitignore
├── package.json
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── data/
│
├── public/
│   ├── logo/
│   └── assets/
│
├── data/
│   ├── schemes.json
│   └── partners.json
│
├── docs/
│   ├── architecture/
│   ├── screenshots/
│   └── PRD/
│
└── .env.example
