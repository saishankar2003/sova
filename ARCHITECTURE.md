# NextX Project Architecture

This document breaks down the NextX project structure and explains how all the folders and components connect together.

Because NextX uses a modern **Turborepo Monorepo**, the entire project (frontend, backend, and shared code) lives in one repository but is neatly split into separate packages.

## 🏗️ The High-Level Monorepo Structure

At the root of the project, you have two main folders: `apps` and `packages`.

* **`apps/`**: Contains the actual applications that get deployed to the internet.
  * **`apps/web/`**: The React/Vite Frontend Application (deployed on Vercel).
  * **`apps/api/`**: The Node.js/Express Backend Server (deployed on Render).
* **`packages/`**: Contains code that is shared *between* your applications.
  * **`packages/shared/`**: The "single source of truth." This contains all your database schemas (Zod), TypeScript interfaces, and shared constants. Both the `web` and `api` import from here so they never go out of sync.

---

## 🌐 The Frontend: `apps/web/src/`

This is the React application. It uses a very clean, feature-based folder structure:

* **`components/`**: Reusable UI building blocks.
  * `ui/`: Dumb, purely visual components like `<Button>`, `<Input>`, `<Modal>`, and `<Card>`.
  * `layout/`: Structural components like the `<Navbar>`, `<Sidebar>`, and main page layout wrappers.
* **`pages/`**: The actual screens of the app (e.g., `DashboardPage.tsx`, `ProfilePage.tsx`, `ChildrenPage.tsx`). Each file here represents a URL route.
* **`services/`**: Code that talks to the outside world. This is where `api.ts` lives, which configures Axios to send HTTP requests to the backend.
* **`stores/`**: Global state management using `Zustand`. For example, `authStore.ts` remembers if a user is currently logged in across the entire app.
* **`router.tsx`**: The traffic cop. It connects a URL (like `/dashboard`) to a specific Page component and protects private routes from logged-out users.

---

## ⚙️ The Backend: `apps/api/src/`

This is the Node.js/Express server. It follows the standard "MVC" (Model-View-Controller) architectural pattern:

* **`models/`**: The structure of the MongoDB database. Files like `User.ts`, `Child.ts`, and `Document.ts` define exactly what data is allowed to be saved in the database.
* **`routes/`**: The traffic cops of the backend. They listen for specific HTTP requests (like `POST /api/auth/signup`) and pass them to the correct controller.
* **`controllers/`**: The "brains" of the backend. They receive requests from the routes, execute the business logic (e.g., checking passwords, saving files, generating tokens), and send the JSON response back to the frontend.
* **`middleware/`**: Security checkpoints. Functions like `requireAuth` sit between the route and the controller to verify JWT tokens and block unauthorized users.
* **`config/`**: Setup files for external services. This is where MongoDB (`database.ts`), Firebase (`firebase.ts`), and `.env` variables (`env.ts`) are configured.
* **`utils/`**: Small, reusable helper functions. For example, `email.ts` for sending Resend emails, or `logger.ts` for printing colored logs.

---

## 🔄 How It Works Together (The Flow)

Here is a step-by-step example of how the frontend and backend communicate when a user performs an action:

1. A user clicks "Add Child" on the **Frontend** (`apps/web/src/pages/ChildrenPage.tsx`).
2. The frontend calls the `api` **service** to send a `POST` request to the backend.
3. The request hits the **Backend** (`apps/api/src/routes/children.routes.ts`).
4. The **Middleware** intercepts it to verify the user's security token.
5. The route passes the request to the **Controller** (`child.controller.ts`).
6. The controller validates the data against the schemas in **`packages/shared`** and saves it to MongoDB using the **Model** (`Child.ts`).
7. The controller sends a success response back to the frontend, and the React UI updates instantly!
