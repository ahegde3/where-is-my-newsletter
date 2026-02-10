# Where Is My Newsletter?

A minimal MVP Next.js 14 app that authenticates with Google, fetches newsletter emails via the Gmail API, processes them with a LangGraph pipeline (clean/summarize/classify), and displays them in a dashboard.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js v5 (Google Provider)
- **Database**: Supabase Postgres with Drizzle ORM
- **AI/LLM**: Google Gemini 2.0 Flash via `@langchain/google-genai`
- **Orchestration**: LangGraph
- **Styling**: Tailwind CSS + Shadcn UI

## Prerequisites

- Node.js 18+
- Supabase project
- Google Cloud Console project with Gmail API enabled

## Setup

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd where-is-my-newsletter2
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Copy `.env.local.example` to `.env.local` and fill in the values:
    ```bash
    cp .env.local.example .env.local
    ```
    - `DATABASE_URL`: Your Supabase connection string.
    - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console.
    - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`.
    - `GOOGLE_GEMINI_API_KEY`: From Google AI Studio.
    - `NEWSLETTER_SENDERS`: Comma-separated list of email addresses to fetch from.

4.  **Database Migration**:
    Push the schema to your Supabase database:
    ```bash
    npm run db:push
    ```

## Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

1.  **Auth**: User signs in with Google. We request `gmail.readonly` scope.
2.  **Sync**: User clicks "Sync".
    - `src/actions/sync.ts` fetches emails from configured senders using Gmail API.
    - It checks for duplicates in the DB.
    - New emails are passed to the LangGraph pipeline (`src/lib/pipeline`).
3.  **Pipeline**:
    - **Centralized Prompts**: `src/lib/pipeline/prompts.ts` contains all LLM prompts to ensure consistency and easy iteration.
    - **Clean Node**: Uses Cheerio to extract text and "View in Browser" link.
    - **Summarize Node**: Uses Gemini Flash to generate a 50-word summary.
    - **Classify Node**: Uses Gemini Flash to tag the newsletter (Tech, AI, etc.).
4.  **Storage**: Processed newsletters are stored in `newsletters` table in Supabase.
5.  **Dashboard**: Displays newsletters with summaries, tags, and links.

## License

MIT
