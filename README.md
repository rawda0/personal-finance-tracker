# 💰 Personal Finance Tracker

A full-stack web application for managing personal finances — track income and expenses, monitor savings goals, and visualize spending habits in real time.

Built with a **Python FastAPI** backend and a **vanilla JavaScript + Firebase** frontend.

---

## 🚀 Features

- 🔐 User authentication (register / login) via Firebase Auth
- 💸 Add, view, and delete income & expense transactions
- 🎯 Create and track savings goals
- 📊 Dashboard with financial overview
- ☁️ Real-time data sync with Firebase Firestore

---

## 🗂️ Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # App configuration
│   ├── firebase_config.py   # Firebase Admin SDK setup
│   ├── requirements.txt
│   ├── routes/              # API route handlers
│   ├── models/              # Data models
│   └── middleware/          # Auth middleware
├── scripts/                 # Frontend JavaScript
├── styles/                  # CSS stylesheets
├── dashboard.html
├── login.html
├── register.html
├── savings.html
├── transactions.html
└── *.drawio                 # UML & architecture diagrams
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.9+
- A Firebase project ([create one here](https://console.firebase.google.com))

### 1. Clone the repo
```bash
git clone https://github.com/your-username/personal-finance-tracker.git
cd personal-finance-tracker
```

### 2. Set up the backend
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Then edit `.env` and fill in your Firebase credentials.

### 4. Add your Firebase credentials
- Go to Firebase Console → Project Settings → Service Accounts
- Generate a new private key and save the JSON file somewhere safe (outside the project folder)
- Set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env` to point to that file

### 5. Configure the frontend
In `scripts/firebase-config.js`, replace the config object with your own Firebase project config (found in Firebase Console → Project Settings → General).

### 6. Run the backend
```bash
python main.py
```

### 7. Open the frontend
Open `login.html` in a browser, or use a local server like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

---

## 🔒 Security Notes

- **Never** commit your Firebase Admin SDK JSON key to GitHub
- **Never** commit your `.env` file
- Make sure your Firebase Firestore Security Rules are properly configured before going to production

---

## 🧩 Tech Stack

| Layer     | Technology              |
|-----------|------------------------|
| Frontend  | HTML, CSS, JavaScript  |
| Auth      | Firebase Authentication |
| Database  | Firebase Firestore      |
| Backend   | Python, FastAPI         |
| Diagrams  | draw.io                 |
