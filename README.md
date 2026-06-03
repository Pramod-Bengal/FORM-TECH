 AgriMarket
 
AgriMarket is a modern, end-to-end B2B and B2C agricultural marketplace that connects local farmers directly with buyers. By bypassing middlemen, AgriMarket ensures farmers earn fair prices for their produce while buyers receive fresh, verified goods with transparent pricing.
The platform includes a simulated **AI Crop Quality Assessment** tool, helping automate the verification process and grade produce transparently.
---
Key Features

  Farmer Portal
*   **Produce Listing:** List crops with vegetable name, quantity, market price, and images (automatically converted to Base64 for database storage).
*   **Transparent Pricing:** Automated calculation of platform fees (15%) and transport deductions to show real-time projected earnings.
*   **AI Quality Analysis:** Upload an image of the produce to run a simulated AI quality check. The system generates a quality score, assigns a grade (e.g., Premium Export Quality, Grade A/B/C), and automatically approves listings with scores > 60 (under 60 goes to pending admin review).
*   **Order Notifications:** Receive live dashboard alerts when buyers place orders for your products.
*   **Manage Listings:** Full control to delete or manage active listings.
  Buyer Portal
    
*   **Fresh Produce Catalog:** Browse verified listings with real-time availability, quality scores, grades, and farmer details.
*   **Integrated Checkout:** Seamless order placement with Google Pay (GPay) support.
*   **Order Tracking:** Provide delivery addresses, input UPI transaction IDs, and upload payment confirmation.

 Admin Control Panel
*   **Analytics Dashboard:** Monitor system-wide KPIs: total users (farmers/buyers), products listed, orders completed, platform revenue, and logistics savings.
*   **Product Moderation:** Review, approve, or reject pending listings that fell below the auto-approval threshold.
*   **User Management:** View list of users, roles, registration dates, and individual metrics (e.g., total orders placed, listings active, total spend).
*   **Transaction Ledger:** Track all checkout transactions with proof of payment, UPI reference numbers, and status.

 Tech Stack

  frontend
*   **Framework:** React 18 (Vite)
*   **Styling:** Tailwind CSS, PostCSS
*   **Animations:** Framer Motion (for smooth transitions)
*   **Icons:** Lucide React
*   **HTTP Client:** Axios
*   **Routing:** React Router DOM v6
  Backend
*   **Framework:** Python Flask
*   **Database:** MongoDB Atlas (via Mongoengine ODM)
*   **Authentication:** Flask-JWT-Extended (JSON Web Tokens)
*   **File Uploads:** Base64 encoding for database storage, ensuring deployment stability on ephemeral filesystems.
---
 Project Structure
```text
FORM-TECH/
├── backend/
│   ├── app.py                  # Flask application entry point
│   ├── routes.py               # API Blueprint and route handlers
│   ├── models.py               # MongoDB schemas (User, Product, Order)
│   ├── extensions.py           # Flask-JWT-Extended initialization
│   ├── create_admin_user.py    # Admin bootstrapping script
│   ├── migrate_db.py           # Database migration & validation script
│   ├── requirements.txt        # Python backend dependencies
│   └── .env                    # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/         # Shared UI components
│   │   ├── pages/              # Dashboards (Admin, Buyer, Farmer, Auth)
│   │   ├── App.jsx             # Main router and app shell
│   │   └── main.jsx            # React entry point
│   ├── package.json            # Frontend script & dependencies
│   ├── tailwind.config.js      # Tailwind configurations
│   ├── vite.config.js          # Vite build config
│   └── .env                    # Frontend environment variables
├── DEPLOYMENT.md               # Guide to deploy backend and frontend to Render
└── package.json                # Root package.json
```
 ⚙️ Local Setup and Installation
 Prerequisites
*   [Node.js](https://nodejs.org/) (v16+ recommended)
*   [Python](https://www.python.org/) (v3.8+ recommended)
*   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database cluster
     Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate
    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create a `.env` file in the `backend/` directory:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET_KEY=your_jwt_secret_key
    PORT=5000
    ```
5.  *(Optional)* Seed or Bootstrap the Admin User:
    ```bash
    python create_admin_user.py
    ```
    *This will create/update the administrator login (`pramodbenagal@gmail.com` / `Pramod@2004`).*
6.  Start the development server:
    ```bash
    python app.py
    ```
    *The backend server will run on `http://127.0.0.1:5000`.*
---
2. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend/` directory:
    ```env
    VITE_API_URL=http://127.0.0.1:5000
    ```
4.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    *The web application will run on `http://localhost:5173`.*

 �️ Utility Scripts (Backend)
*   **`create_admin_user.py`**: Boots/updates the administrative user in the database. Handy for setting up the initial admin account for testing.
*   **`migrate_db.py`**: Ensures database schema compatibility (e.g. populates missing default values like product status) and prints database counts and statistics. Run it with:
    ```bash
    python migrate_db.py
    ```
---
☁️ Production Deployment
AgriMarket is configured to be deployed easily to **Render**.
*   Frontend: Deployed as a **Static Site** pointing to the `frontend` root.
*   Backend: Deployed as a **Web Service** pointing to the `backend` root.
