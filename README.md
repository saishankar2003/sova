# NextX — EHCP Journey Companion

NextX is an intelligent companion application designed to help parents and caretakers manage the Education, Health and Care Plan (EHCP) journey. It provides a secure document vault, an AI-powered conversational assistant for guidance, and milestone tracking.

## Technology Stack

This is a full-stack modern JavaScript monorepo managed with **TurboRepo** and **pnpm**.

* **Frontend**: React, Vite, React Router, Zustand (state management), React Query (data fetching)
* **Backend**: Node.js, Express, Mongoose (MongoDB)
* **Authentication**: JWT & Google OAuth 2.0
* **Storage**: Firebase Storage (with local filesystem fallback for development)

---

## 🚀 Setup & Installation

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
* **Node.js** (v18 or higher recommended)
* **pnpm** (`npm install -g pnpm`)
* **MongoDB** (Running locally on `mongodb://localhost:27017` or an Atlas URI)

### 1. Install Dependencies
Run the following command from the root of the repository to install dependencies for all workspaces (frontend, backend, and shared packages):

```bash
pnpm install
```

### 2. Configure Environment Variables
You need to set up your local environment variables before running the application. 

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and review the variables. By default, the application is configured to run smoothly in local development:
   - **MongoDB**: Defaults to `mongodb://localhost:27017/nextx`. Change this if you are using MongoDB Atlas.
   - **File Storage**: The backend will gracefully fall back to storing document uploads in the local filesystem (`apps/api/uploads`) if you don't configure Firebase keys.
   - **Auth**: Default JWT secrets are provided for local development.

### 3. Run the Development Servers
With TurboRepo, you can start all development servers simultaneously from the root directory:

```bash
pnpm run dev
```

This single command will spin up:
* **Backend API**: http://localhost:4000
* **Frontend Web App**: http://localhost:5173

---

## 📂 Project Structure

```
nextx/
├── apps/
│   ├── api/            # Express.js Backend Server
│   └── web/            # React.js Frontend Application
├── packages/
│   ├── eslint-config/  # Shared ESLint configuration
│   ├── shared/         # Shared TypeScript interfaces & utilities
│   └── tsconfig/       # Shared TypeScript configuration
├── package.json        # Root workspace configuration
└── turbo.json          # TurboRepo build pipeline
```

## ⚙️ Additional Features Configuration (Optional)

To enable advanced features, you can add the corresponding API keys to your `.env` file:
* **Firebase**: Required for production cloud document storage (`FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_SERVICE_ACCOUNT_KEY`).
* **Stripe**: Required for subscription tier payments.
* **Resend**: Required for sending email verifications and password reset links.
* **Google OAuth**: Required to enable "Log in with Google" functionality.
