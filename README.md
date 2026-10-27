# DUI - Digital Union Initiative

A social-impact platform designed to empower informal waste pickers in Chennai, Tamil Nadu.

## Features

- **Dashboard**: Real-time metrics on workers, transactions, and grievances
- **Digital Worker Identity**: Member profiles with QR code membership cards
- **FairPrice**: Compare recyclable material prices against market data
- **Transaction Records**: Track sales with buyer prices and market comparison
- **Grievance Management**: Submit and track workplace issues
- **Collective Bargaining Reports**: Aggregate data for NGO/cooperative advocacy

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Recharts
- **Backend**: FastAPI (Python)
- **Database**: SQLite (local), PostgreSQL (production)

## Setup & Installation

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn main:app --reload
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Demo Login

**Worker Account:**
- Email: `worker@demo.com`
- Password: `worker123`

**Admin Account:**
- Email: `admin@demo.com`
- Password: `admin123`

## Project Structure

```
DUI/
├── frontend/          # Next.js app
│   ├── app/
│   │   ├── page.tsx   # Dashboard
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── tsconfig.json
├── backend/           # FastAPI
│   ├── main.py        # App entry
│   ├── models.py      # Database models
│   ├── database.py    # DB config
│   ├── routes/        # API endpoints
│   └── requirements.txt
├── README.md
└── .gitignore
```

## API Endpoints

- `GET /` - Health check
- `POST /api/auth/login` - Demo login
- `GET/POST /api/workers` - Worker management
- `GET/POST /api/transactions` - Transaction records
- `POST /api/prices/compare` - Price comparison
- `GET/POST /api/grievances` - Grievance management
- `GET /api/reports/*` - Collective reports

## Data

All price comparison data is **synthetic** for demonstration purposes and does not represent actual Chennai market prices.

## Disclaimer

This is an organization-issued membership card prototype, not an official government ID.

## Development Notes

- Database initializes automatically on first backend run
- Demo credentials are hardcoded for prototype testing
- Sample data can be added via API endpoints

## Future Enhancements

- Real payment integration
- Multi-language UI (Tamil/English)
- Mobile app
- Advanced analytics
- Integration with buyer databases

---

Built with care for Chennai's waste picker community.
