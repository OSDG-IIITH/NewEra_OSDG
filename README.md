
# OSDG Web (NewEra_OSDG)

The official website for OSDG IIIT Hyderabad, built with Next.js 16, Tailwind CSS, and Supabase.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **AI Integration:** Google Generative AI (Gemini 2.0 Flash)
- **Animations:** Framer Motion
- **Authentication:** CAS (Central Authentication Service)

## 🛠️ Installation & Setup

### Option 1: Docker (Recommended)

Run the application using the provided shell script which handles the Docker steps.

```bash
./run.sh
```

This will spin up the `web` service as defined in `docker-compose.yml`.

### Option 2: Manual Installation

1.  **Install Dependencies:**

    ```bash
    npm install
    # or
    pnpm install
    ```

2.  **Run Development Server:**

    ```bash
    npm run dev
    # or
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

    To run on your local network (LAN):
    
    ```bash
    npm run dev:lan
    ```

## 📂 Project Structure

- **`src/app`**: Main application routes (App Router).
- **`src/app/api`**: Backend API routes.
- **`src/components`**: Reusable React components.
- **`scripts`**: Utility scripts (e.g., LAN server).
- **`public`**: Static assets.

## 🔌 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/cas/login` | `GET` | Initiates the CAS authentication flow. |
| `/api/auth/cas/callback` | `GET` | Handles the callback from CAS and creates a session. |
| `/api/auth/logout` | `POST` | Logs out the current user and clears the session. |
| `/api/auth/user` | `GET` | Returns details of the currently authenticated user. |

### 🤖 Vetal AI Assistant (`/api/chat`)

A sassy, quirkly AI assistant powered by Gemini 2.0 Flash to help students with VPN setup and general queries.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/chat/vetal` | `POST` | Main chat endpoint. Streamed response. Accepts text + images (error screenshots). |
| `/api/chat/vetal-forms` | `POST` | Specialized chat endpoint for OSDG forms assistance. |
| `/api/chat/vetal-general` | `POST` | General purpose chat endpoint. |

### 💻 Projects (`/api/projects`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/projects` | `GET` | Fetches a list of all projects from Supabase. |
| `/api/projects` | `POST` | Creates a new project. Required fields: `title`, `description`, `siteLink`, `dateInitiated`. |
| `/api/projects/[id]` | `GET/PUT/DELETE` | _(Draft/In-progress)_ Operations on specific projects. |

### 📝 Forms Proxy (`/api/forms-proxy`)

Proxies requests to the OSDG Forms backend service, handling authentication headers.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/forms-proxy/[...path]` | `ALL` | Proxies all requests to the configured `FORMS_BACKEND_URL`. Requires OSDG Auth headers. |

### 🔒 VPN Utilities (`/api/vpn`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/vpn/gemini` | `POST` | diagnosing VPN setup errors. Action: `diagnose-error`. Accepts OS info, command run, and error text. |

## 📄 Key Pages

- **`/`**: Home page.
- **`/hackiiit`**: HackIIIT event page.
- **`/vpn-setup`**: Interactive guide for setting up the IIITH VPN.
- **`/projects`**: Showcase of OSDG projects.
- **`/team`**: Meet the team.
- **`/events`**: Upcoming and past events.
- **`/forms`**: Internal forms portal.

## 📝 Environment Variables

Make sure to configure the following in your `.env` file (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `FORMS_BACKEND_URL`
- `FORMS_OSDG_AUTH_SECRET`