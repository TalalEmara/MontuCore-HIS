
-----

# 🏥 Sports HIS (Health Information System)

A specialized Electronic Health Record (EHR) system tailored for sports teams. It manages athlete injuries, treatments, wellness logs, and connects medical staff (Physios, Nutritionists) with athletes.

## 🚀 Tech Stack

  * **Frontend:** React (Vite)
  * **Backend:** Node.js + Express
  * **Database:** PostgreSQL (via Supabase)
  * **ORM:** Prisma (v5.22.0)
  * **Package Manager:** **pnpm** (Required)

-----

## 🛠️ Prerequisites

Before you start, make sure you have:

1.  **Node.js:** Installed (v18 or higher recommended).
2.  **pnpm:** We use `pnpm` instead of `npm` to save disk space and avoid conflicts.
      * *Install command:* `npm install -g pnpm`
3.  **Database URL:** Get the `DATABASE_URL` string from the team leader (Mohamed).

-----

## 📦 Installation & Setup

### 1\. Clone the Repository

```bash
git clone <your-repo-url>
cd sports-his-project
```

### 2\. Install Backend Dependencies

```bash
cd server
pnpm install
```

### 3\. Configure Environment Variables

Create a `.env` file inside the `/server` folder:

```bash
# /server/.env
PORT=3000
# Ask Mohamed for this connection string
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true"
```

### 4\. Setup Database (Prisma)

Since we use Supabase, we need to sync your local client with the remote database schema.

```bash
# Make sure you are inside /server
pnpm exec prisma generate
```

*(Note: You do NOT need to run `migrate dev` unless you are changing the schema. The database is already live online.)*

### 5\. Install Frontend Dependencies

```bash
cd ../client
pnpm install
```

-----

## ▶️ How to Run

You need **two terminals** open to run the full stack.

### Terminal 1: Backend

```bash
cd server
pnpm run dev
```

*You should see:* `🚀 Server running on http://localhost:3000` and `✅ Connected to Database`.

### Terminal 2: Frontend

```bash
cd client
pnpm run dev
```

*You should see:* `Local: http://localhost:5173/`

-----

## ⚠️ Important Developer Rules

1.  **Do NOT use `npm install`**: Always use `pnpm install`.
2.  **Do NOT update Prisma**: We are locked to version `5.22.0` to avoid breaking changes. Do not run updates that change the `package.json` version.
3.  **Database Changes**:
      * If you change `schema.prisma`, you must run: `pnpm exec prisma migrate dev --name <description>`
      * This will apply changes to the **shared online database**, so be careful\!
4.  **Seeding Data**:
      * To reset/fill the DB with test users (Admin, Physio): `pnpm exec prisma db seed`

-----

## 🧪 Default Login Credentials (Seed Data)

  * **Admin:** `admin@sportshis.com` / `secure_password_123`
  * **Clinician:** `doc@sportshis.com` / `123456`

-----

### 📝 Next Steps for the Team

  * **Frontend:** Start building the Login Page in `/client/src/pages/Login.jsx`.
  * **Backend:** Start building the Auth Routes in `/server/src/routes/auth.js`.