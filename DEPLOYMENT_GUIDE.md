# 🚀 Full Step-by-Step Deployment Guide for Render

This guide will help you host both your **Frontend (React)** and **Backend (Flask + MongoDB)** on **Render.com** for free.

---

## 🛠️ Prerequisites (Already Done for You)
I have updated your code to be "Deployment Ready":
1. **Frontend**: Now uses `VITE_API_URL` so it can automatically talk to your live backend.
2. **Backend**: Added `gunicorn` and `wsgi.py` for production-ready server running.
3. **Connectivity**: Configured MongoDB connection reliability.

---

## 1️⃣ Deploying the Backend (Do this First)
The frontend needs the backend URL to work, so we deploy the backend first.

1. **Log in to Render**
   - Go to [dashboard.render.com](https://dashboard.render.com/)
   - Login with your GitHub account.

2. **Create New Web Service**
   - Click **New +** button -> **Web Service**.
   - Select your repository (`Pramod-Bengal/FORM-TECH`).
   - Click **Connect**.

3. **Configure Settings**
   - **Name**: `form-tech-backend` (or similar)
   - **Region**: Singapore (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend` (⚠️ Important)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app` (I created this file for you)

4. **Add Environment Variables**
   Scroll down to "Environment Variables" and add these:
   
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | `mongodb+srv://...` (Copy this from your local .env file) |
   | `JWT_SECRET_KEY` | `super-secret-key-change-this` (Or copy from local .env) |
   | `PYTHON_VERSION` | `3.10.0` |

5. **Deploy**
   - Click **Create Web Service**.
   - Wait for it to finish building.
   - Once live, you will see a URL at the top left (e.g., `https://form-tech-backend.onrender.com`).
   - **COPY THIS URL**. You need it for the frontend.

---

## 2️⃣ Deploying the Frontend

1. **Create New Static Site**
   - Go back to Render Dashboard.
   - Click **New +** -> **Static Site**.
   - Select the same repository.

2. **Configure Settings**
   - **Name**: `form-tech-frontend`
   - **Root Directory**: `frontend` (⚠️ Important)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Add Environment Variables**
   - Go to "Environment Variables" tab.
   - Add the following:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | The Backend URL you copied earlier **WITHOUT** the trailing slash `/` (e.g., `https://form-tech-backend.onrender.com`) |

4. **Deploy**
   - Click **Create Static Site**.
   - Render will build your React app.

---

## ✅ Final Check
1. Open your new **Frontend URL** (provided by Render).
2. Try to **Register** or **Login**.
3. If it works, congratulations! Your full stack app is live.

### ⚠️ Troubleshooting
- **Build Fail?** Check the logs in Render.
- **Login Failing?**
  - Check if `VITE_API_URL` is correct in Frontend settings.
  - Check if `MONGO_URI` is correct in Backend settings.
  - Ensure you **Re-deployed** the frontend after adding the Environment Variable (New deploy is needed to bake in the variable).
