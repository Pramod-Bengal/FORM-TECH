# Deployment Guide for AgriMarket (Render)

This project allows you to deploy both the Frontend and Backend to [Render.com](https://render.com) for free.

## Prerequisites
1.  **GitHub Repository**: Ensure your code is pushed to a GitHub repository.
2.  **Render Account**: Create an account on Render.

---

## Part 1: Deploy Backend (Python/Flask)

1.  Click **New +** -> **Web Service**.
2.  Connect your GitHub repository.
3.  **Name**: `agrimarket-backend` (or similar).
4.  **Root Directory**: `backend` (Important!).
5.  **Runtime**: `Python 3`.
6.  **Build Command**: `pip install -r requirements.txt`.
7.  **Start Command**: `gunicorn app:app`.
8.  **Environment Variables** (Scroll down to "Advanced" or "Environment"):
    *   `MONGO_URI`: (Copy this from your local `.env` file)
    *   `JWT_SECRET_KEY`: (Copy from `.env` or create a new secret)
    *   `PYTHON_VERSION`: `3.9.0` (Optional, ensures compatibility)
9.  Click **Create Web Service**.
10. Wait for the deployment to finish. **Copy the Backend URL** (e.g., `https://agrimarket-backend.onrender.com`).

**Note:** On Render's free tier, uploaded images will be deleted if the server restarts (ephemeral storage). For permanent storage, you would typically use a service like Cloudinary or AWS S3.

---

## Part 2: Deploy Frontend (React/Vite)

1.  Click **New +** -> **Static Site**.
2.  Connect the **same** GitHub repository.
3.  **Name**: `agrimarket-frontend`.
4.  **Root Directory**: `frontend`.
5.  **Build Command**: `npm run build`.
6.  **Publish Directory**: `dist`.
7.  **Environment Variables**:
    *   `VITE_API_URL`: Paste the **Backend URL** from Part 1 (e.g., `https://agrimarket-backend.onrender.com`).
    *   *Note: Do NOT add a trailing slash `/` at the end of the URL.*
8.  Click **Create Static Site**.

---

## Final Step
Once both are deployed, open your **Frontend URL**. It should connect to your Backend API and work exactly like it does locally!
