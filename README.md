# 🚀 PortfolioAI — AI-Powered Developer Portfolio & ATS Resume Suite

**PortfolioAI** is an advanced full-stack platform designed to help developers build, analyze, and publish recruiter-ready portfolio websites in seconds using artificial intelligence.

---

## 🌟 Key Features

### 1. 🤖 AI Portfolio Generator
- **Instant Resume-to-Portfolio**: Upload any PDF resume to automatically extract candidate bio, technical skills, projects with live/GitHub URLs, work experience timeline, education, and contact details.
- **Smart Formatting**: Cleans, refines, and formats resume data into modern developer profiles.
- **Interactive Builder**: Switch templates live, customize fields before saving, and persist to your account with a single click.

### 2. 🎨 3 Premium Developer Templates
- **Modern**: Glassmorphic dark theme, indigo/violet glows, skills pills, project cards with GitHub/demo links, and an interactive career timeline.
- **Minimal**: Editorial Swiss-style layout with high-contrast typography and recruiter-friendly scannability.
- **Creative**: Cyberpunk/creator aesthetic with neon emerald and cyan accents, terminal tags, and interactive cards.

### 3. 📄 AI Resume ATS Analyzer
- Evaluates resumes against modern ATS (Applicant Tracking Systems) industry standards.
- Delivers an **ATS Score (0–100)**, professional summary, highlighted strengths, areas for improvement, and missing keywords.
- Seamless one-click bridge directly from ATS analysis to Portfolio Generation.

### 4. 🌐 Public Portfolio Sharing
- Each published portfolio generates a shareable public link (`/p/:id`) accessible without login.
- Real-time Draft / Published status toggle with instant link copying.

### 5. ⚙️ Profile & Account Settings
- **Avatar Uploads**: Cloudinary-powered profile photo upload with automated facial-centering transformations.
- **Security**: In-app password updating with bcrypt encryption and JWT authentication.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Redux Toolkit, React Router v7, Tailwind CSS v4, Framer Motion, Lucide Icons, React Icons, React Hot Toast.
- **Backend**: Node.js, Express 5, MongoDB Atlas (Mongoose), JWT, Cloudinary SDK, OpenRouter AI, Multer, PDF.js.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance
- Cloudinary Account
- OpenRouter API Key

---

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/anushka1801garg/PortfolioAI.git
   cd PortfolioAI
   ```

2. **Configure Server Environment**:
   Navigate to `server/.env` and verify the following variables:
   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   OPENROUTER_API_KEY=your_openrouter_key
   ```

3. **Install Dependencies**:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Run Locally**:
   ```bash
   # Terminal 1: Start Backend (Port 8000)
   cd server
   npm run dev

   # Terminal 2: Start Frontend (Port 5173)
   cd client
   npm run dev
   ```

5. **Open Application**:
   Navigate to `http://localhost:5173` in your browser.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | User login | No |
| GET | `/api/v1/auth/me` | Fetch authenticated user | Yes (JWT) |
| GET | `/api/v1/users/profile` | Get user profile | Yes (JWT) |
| PUT | `/api/v1/users/profile` | Update user profile / password | Yes (JWT) |
| POST | `/api/v1/users/avatar` | Upload profile avatar to Cloudinary | Yes (JWT) |
| GET | `/api/v1/portfolios` | List user portfolios | Yes (JWT) |
| POST | `/api/v1/portfolios` | Create new portfolio | Yes (JWT) |
| GET | `/api/v1/portfolios/:id` | Get portfolio details | Yes (JWT) |
| GET | `/api/v1/portfolios/public/:id` | Public portfolio view | No |
| PUT | `/api/v1/portfolios/:id` | Update portfolio | Yes (JWT) |
| DELETE | `/api/v1/portfolios/:id` | Delete portfolio | Yes (JWT) |
| POST | `/api/v1/portfolio-generator/generate` | Generate portfolio from PDF resume | No |
| POST | `/api/v1/analyzer/analyze` | ATS resume analysis | No |
| GET | `/api/v1/resume` | List uploaded resumes | Yes (JWT) |
| POST | `/api/v1/resume` | Upload resume PDF to Cloudinary | Yes (JWT) |
| DELETE | `/api/v1/resume/:id` | Delete resume | Yes (JWT) |
