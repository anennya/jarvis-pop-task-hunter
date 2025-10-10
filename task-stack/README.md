# 15-Minute Task Stack

A web-based task management system that breaks down tasks into actionable 15-minute slices using deterministic templates. Built with Next.js and supports multiple storage backends (Mock, Google Sheets, Supabase).

## Features

- **Smart Task Breakdown**: Automatically breaks tasks into 15-minute actionable slices based on category templates
- **Auto-Classification**: Intelligently categorizes tasks using keyword matching
- **Multiple Storage Backends**: Switch between Mock, Google Sheets, and Supabase with one environment variable
- **Focused Workflow**: Shows one slice at a time to reduce overwhelm
- **Progress Tracking**: Visual progress indicators and task status management

## Quick Start

### 1. Run with Mock Backend (Default)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 2. Switch to Google Sheets

1. **Create a Google Cloud Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create service account credentials
   - Download the JSON key file

2. **Create a Google Spreadsheet**:
   - Create a new Google Sheet
   - Add two tabs: "Tasks" and "Slices"
   - Share the sheet with your service account email (Editor permission)
   - Copy the spreadsheet ID from the URL

3. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```bash
   DATA_BACKEND=sheets
   SHEETS_ID="your-spreadsheet-id-here"
   GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","token_uri":"https://oauth2.googleapis.com/token"}'
   ```

4. **Restart the application**:
   ```bash
   npm run dev
   ```

### 3. Switch to Supabase (Optional)

Set `DATA_BACKEND=supabase` and configure Supabase environment variables. (Implementation can be added as needed)

## How It Works

### Task Categories & Templates

The system uses 7 predefined categories, each with specific breakdown templates:

1. **Admin** (60min): Setup → Gather Info → Complete Action → Review → Archive
2. **Research – Travel** (90min): Define Scope → Gather Options → Compare → Coordinate → Book → Confirm
3. **Research – Shopping** (60min): Define Needs → Gather Options → Compare Features → Decide → Purchase → Review
4. **Reading/Learning** (45min): Setup → Preview → Read/Watch → Summarize → Apply
5. **Technical Execution** (60min): Setup → Explore → Implement → Test → Refactor → Commit
6. **Quick Chores** (15min): Decide → Take Action → Confirm
7. **Generic** (30min): Clarify → Take Step → Reflect

### Auto-Classification

Tasks are automatically classified based on keywords:
- "travel", "trip", "flight" → Research – Travel
- "buy", "purchase", "shop" → Research – Shopping
- "code", "build", "fix" → Technical Execution
- "read", "learn", "study" → Reading/Learning
- "admin", "form", "register" → Admin
- "clean", "call", "quick" → Quick Chores

### Scoring System

Slices are prioritized using:
- **Importance** (1-5): User-defined priority
- **Urgency** (0-3): Based on due date proximity
- **Skip Penalty** (0-3): Reduces priority for frequently skipped items

Score = Importance + Urgency - Skip Penalty

## API Endpoints

- `POST /api/capture` - Create new task with auto-breakdown
- `GET /api/next` - Get next slice to work on
- `POST /api/action` - Update slice status (done, skip, snooze, +15)
- `GET /api/tasks` - List all tasks with slices

## User Interface

### /now - Focus Mode
- Shows single 15-minute slice
- Action buttons: Done, +15 Min, Skip, Snooze
- Minimalist design to reduce overwhelm

### /inbox - Task Management
- View all tasks and their slices
- Expandable task cards with progress indicators
- Filter by status (All, In Progress, Completed)
- Add new tasks

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

```bash
# Backend selection
DATA_BACKEND=mock  # or "sheets" or "supabase"

# Google Sheets (if DATA_BACKEND=sheets)
SHEETS_ID="your-spreadsheet-id"
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Supabase (if DATA_BACKEND=supabase)
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE="service-role-key"
SUPABASE_ANON_KEY="anon-key"
```

## Architecture

```
Next.js App Router
├── UI Pages (/now, /inbox)
├── API Routes (/api/capture, /api/next, /api/action)
├── Breakdown Engine (templates, classifier, breakdown)
└── Data Adapters (mock, sheets, supabase)
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make changes
4. Test with mock backend
5. Submit pull request

## License

MIT License - see LICENSE file for details
