
### 🚀 Part 1: Step-by-Step Express Organization

Instead of putting everything in `index.js`, we will set up a **Routing System**.

#### Step 1: Update `package.json` scripts

Open `server/package.json` and make sure you have these scripts so you can run the server easily.

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "seed": "node prisma/seed.js"
},
"prisma": {
  "seed": "node prisma/seed.js"
}
```

#### Step 2: Create a Route File

Create a new file `server/src/routes/auth.js`. This is where you will handle Login/Register logic later. For now, we put a test route.

```javascript
// server/src/routes/auth.js
import express from 'express';
const router = express.Router();

// GET /api/auth/test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!', timestamp: new Date() });
});

module.exports = router;
```

#### Step 3: Connect Routes in `index.js`

Update your `server/src/index.js` to look like this. It now imports the routes and "uses" them.

```javascript
// server/src/index.js
require('dotenv').config();
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth'; // Import routes

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Mount auth routes at /api/auth

// Health Check
app.get('/', (req, res) => {
  res.send('Sports HIS Backend is Running!');
});

// Start Server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to Database (Supabase)');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database Connection Error:', error);
    process.exit(1);
  }
}

startServer();
```

-----

### 📄 Part 2: The Updated README.md

Here is the complete, updated `README.md`. It now includes the **Seeding** instructions and the **Express Development** guide so your team knows how to add new features.

Overwrite your `README.md` with this:

````markdown
# 🏥 Sports HIS (Health Information System)

A specialized Electronic Health Record (EHR) system tailored for sports teams. It manages athlete injuries, treatments, wellness logs, and connects medical staff (Physios, Nutritionists) with athletes.

## 🚀 Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Node.js + Express
* **Database:** PostgreSQL (via Supabase)
* **ORM:** Prisma (v5.22.0)
* **Package Manager:** **pnpm** (Required)

---

## 🛠️ Prerequisites

Before you start, make sure you have:

1.  **Node.js:** Installed (v18 or higher recommended).
2.  **pnpm:** We use `pnpm` instead of `npm` to save disk space.
    * *Install command:* `npm install -g pnpm`
3.  **Database URL:** Get the `DATABASE_URL` string from the team leader.

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd sports-his-project
````

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
# Ask Team Leader for this connection string
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true"
```

### 4\. Setup Database (Prisma)

Sync your local client with the remote database schema.

```bash
# Inside /server
pnpm exec prisma generate
```

### 5\. Install Frontend Dependencies

```bash
cd ../client
pnpm install
```

-----

## 🌱 Database Seeding (Important\!)

Since we are all sharing one database, we need standard users to test with.
**Run this command to create the default Admin and Clinician users:**

```bash
# Inside /server
pnpm exec prisma db seed
```

### Default Login Credentials

  * **Admin:** `admin@sportshis.com` / `secure_password_123`
  * **Clinician:** `doc@sportshis.com` / `123456`

-----

## 💻 Express Backend Development

We organize our code to keep it clean. Do not put everything in `index.js`.

### How to add a new API Route (e.g., for Injuries)

1.  **Create a file:** Create `server/src/routes/injuries.js`.
2.  **Add logic:**
    ```javascript
    import express from 'express';
    const router = express.Router();

    // GET /api/injuries
    router.get('/', async (req, res) => {
        // Your prisma logic here
        res.json({ message: "List of injuries" });
    });

    module.exports = router;
    ```
3.  **Register it:** Open `server/src/index.js` and add:
    ```javascript
    import injuryRoutes from './routes/injuries';
    app.use('/api/injuries', injuryRoutes);
    ```
4.  **Test it:** Go to `http://localhost:3000/api/injuries`.

-----

## ▶️ How to Run

You need **two terminals** open.

### Terminal 1: Backend

```bash
cd server
pnpm run dev
```

*You should see:* `🚀 Server running on http://localhost:3000`

### Terminal 2: Frontend

```bash
cd client
pnpm run dev
```

*You should see:* `Local: http://localhost:5173/`

-----

## ⚠️ Important Rules

1.  **Do NOT use `npm install`**: Always use `pnpm install`.
2.  **Prisma Version**: Do not update Prisma. We use `v5.22.0` to avoid conflicts.
3.  **Database Migrations**:
      * If you change `schema.prisma`, run: `pnpm exec prisma migrate dev --name <description>`
      * **Warning:** This changes the live database for everyone\!