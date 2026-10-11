# LeadPilot

**A Lead Prioritization and Data Quality Dashboard**

LeadPilot is a full-stack web application that helps users prioritize business leads based on their potential value and identify data-quality issues that may affect lead management.

## Features

- **Lead Scoring:** Assigns scores using industry, revenue, employee count, email, and website information.
- **Explainable Scores:** Shows a breakdown of the points awarded for each scoring category.
- **Data Quality Checks:** Identifies duplicate company records and missing or invalid contact details.
- **Lead Explorer:** Browse, search, filter, and sort leads.
- **Quality Center:** Review records that need attention.
- **CSV Export:** Export lead data for further analysis.
- **Dashboard Overview:** View lead statistics, score distribution, and data-quality insights.

## Tech Stack

- **Frontend:** React, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Data Storage:** JSON-based sample lead data
- **Tools:** Git, GitHub, Visual Studio Code

## Project Structure

```text
LeadPilot/
├── backend/
│   ├── data/
│   │   └── leads.json
│   └── server.js
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── index.css
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm installed
- Visual Studio Code

### 1. Clone the repository

```bash
git clone https://github.com/Deepika-Sisodia/LeadPilot
cd LeadPilot
```

If you already have the project locally, open its folder in VS Code instead.

### 2. Start the backend

Open a VS Code terminal:

```bash
cd backend
npm install
node server.js
```

The backend runs on `http://localhost:5000`.

### 3. Start the frontend

Open a second VS Code terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal.

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Checks backend health |
| `GET /api/leads` | Returns lead records |
| `GET /api/leads/score` | Returns leads with calculated scores |
| `GET /api/leads/quality` | Returns data-quality information |

## Lead Scoring

Lead scores are calculated using five factors:

- **Industry:** Up to 30 points
- **Revenue:** Up to 30 points
- **Employee Count:** Up to 20 points
- **Email:** Up to 10 points
- **Website:** Up to 10 points

The maximum score is 100. The dashboard provides a category-wise breakdown to make the result easier to understand.

## Data Quality

The application checks for duplicate company names, missing or invalid email addresses, and missing websites. Records with detected issues can be reviewed in the Quality Center.

The current dataset contains sample records. Email addresses and websites using the `.example` domain are placeholders, not verified business contacts.

## Future Improvements

- Integrate a real CRM or lead data source.
- Add persistent database storage.
- Support configurable scoring weights.
- Add authentication and role-based access.
- Introduce automated tests and more data validation rules.

## Author

Built as a full-stack project focused on lead prioritization, explainable scoring, and data quality.