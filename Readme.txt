# AtYourService

An AI-powered IT support assistant for employees. One chat box that can:

| Intent | What the employee says | What happens |
|---|---|---|
| **Incident** | "My Outlook keeps crashing", or a screenshot of the error | Asks for details, gives troubleshooting steps from the IT knowledge base, and raises a support ticket if nothing works. Tracks the ticket and closes it when the employee confirms the fix. |
| **Request** | "I need a new laptop" | Shows the matching service-catalog item as a card with a (dummy) portal link. |
| **Info enquiry** | "What is the notice period?" | Answers only from the company policy documents (PDF / Word) that admins upload and shows the source file. |

**Screenshots.** Employees can attach (or paste with Ctrl+V) a screenshot of their problem in the chat. Claude reads it, extracts the app and the exact error text, and the normal incident flow gives the fix. Images are not stored: only the AI's text description is kept. Visible passwords and personal data are redacted in that description.

**Admin-only controls.** Ticket priority and company policy documents are managed by admins (the `agent` role) only. Employees never see a ticket's priority and cannot change it (so they cannot mark everything "High"). Employees cannot upload or delete documents. They get a read-only list of company policies.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4, React Router |
| Backend | NestJS 11, TypeScript, TypeORM, class-validator, Zod, Passport JWT |
| Database | PostgreSQL 16 (Docker) with built-in full-text search |
| AI | Anthropic Claude (official SDK), Haiku 5.5 by default, switchable with one env variable |

## Architecture

```
Browser (React + Tailwind)
        |  /api/*  (Vite proxy in dev)
        v
NestJS REST API --- JWT auth + roles (employee / agent = admin)
        |
        +--> ChatService: (screenshot -> text) -> save -> classify -> handler -> save reply
        |        handlers: Incident | Request | Info (RAG)
        |
        +--> PostgreSQL  (conversations, messages, tickets, documents, chunks, catalog, KB, users)
        +--> Claude API  (only LlmService talks to it)
```

Key design ideas:
- **Grounded answers (RAG).** Claude answers from the knowledge base, the service catalog and the company policies, never from memory. Policy answers list their sources.
- **Structured output.** Claude returns Zod-validated JSON (intent, status, ticket draft). **The AI decides a status; our code decides the action** (create or resolve a ticket).
- **Strategy pattern.** One handler class per intent. A new use case is a new class.
- **Role-based access.** Employees see only their own chats and tickets, and never a ticket's priority. IT agents (admins) see all tickets, change status and priority, and upload or delete the shared company policies. This is enforced on the server (`@Roles` guards and a response filter), not just hidden in the UI.
- **Screenshots become text once.** A single vision call turns the image into a description that is added to the message, so the classifier, knowledge-base search, handlers and ticket drafting all keep working on plain text.

## Run it locally

Prerequisites: Node 20+, Docker Desktop, an [Anthropic API key](https://console.anthropic.com).

```bash
# 1. Database
docker compose up -d

# 2. Backend (http://localhost:3000)
cd backend
cp .env.example .env        # then edit .env: set ANTHROPIC_API_KEY and JWT_SECRET
npm install
npm run start:dev

# 3. Frontend (http://localhost:5173), in a second terminal
cd frontend
npm install
npm run dev
```

Tables and starter data (6 catalog items, 8 knowledge-base articles, one IT agent account) are created automatically on first start.

Generate a JWT secret with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Accounts
- **IT agent:** created from `SEED_AGENT_EMAIL` / `SEED_AGENT_PASSWORD` in `backend/.env` (defaults: `agent@atyourservice.local` / `ChangeMe123!`). Change the password.
- **Employee:** use the **Register** page.

## Demo script (5 minutes)

1. **As an agent (admin):** open **Company policies** and drop in the policy files from [`sample-documents/`](sample-documents/). They become shared company policies.
2. **As an employee** (a second browser profile or a private window): register, then in **Chat**:
   - "My Outlook keeps crashing" → troubleshooting steps → "still crashing" → click **Create a support ticket**.
   - Attach `1-outlook-error.png` (or paste a screenshot) with no text → the assistant reads the error and gives fix steps.
   - Ask to make the ticket high priority → the assistant explains that the IT team sets priorities (the employee never sees one).
   - "I need a new laptop" → catalog card.
   - "How many days of notice period do I have?" → answer with its source file.
   - "The VPN is connected now" in the ticket's chat → the ticket is marked Resolved.
3. Open **History** to reopen past chats and **Tickets** to see the employee's own tickets (no priority column) and **Company policies** to read the policies (no upload or delete).
4. **As the agent:** open **Tickets** to see everyone's tickets and change a status or priority.

## API overview

All routes are under `/api` and need a Bearer token except `auth/register`, `auth/login` and `health`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Chat | `POST /chat` (JSON, or multipart with an optional `image` field, max 5 MB), `POST /chat/:conversationId/ticket` |
| Conversations | `GET /conversations`, `GET /conversations/:id`, `DELETE /conversations/:id` |
| Tickets | `POST /tickets`, `GET /tickets`, `GET /tickets/:id`, `PATCH /tickets/:id/status` and `PATCH /tickets/:id/priority` (agents only). Employees get tickets without a `priority` field. |
| Documents | `GET /documents`, `GET /documents/search?q=`, `POST /documents` and `DELETE /documents/:id` (agents only) |
| Other | `GET /catalog`, `GET /knowledge-base`, `POST /classify`, `GET /health` |

## Known limitations and next steps

- Search is keyword-based (Postgres full-text), not semantic. Next step: embeddings with pgvector.
- Reloaded conversations show text only (catalog cards, ticket cards and sources appear live but not in History).
- Scanned PDFs (images) and old `.doc` files are not supported.
- Screenshots are not stored, so History and tickets show the AI's text description, not the picture. Redaction of sensitive data in that description relies on the model's instructions, not a server-side filter.
- Chat tickets get an AI-suggested initial priority that only admins can see and change.
- Tables use TypeORM `synchronize` for the demo. Production would use migrations.
- Authentication is email and password with JWT. Production would use company SSO.
- No automated unit tests yet. The system was verified manually and with live API calls.
- Next steps: streamed replies, notifications (email / Teams), integration with a real ITSM tool, analytics.
