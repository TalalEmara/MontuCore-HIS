# MontuCore-HIS
***

# MontuCore HIS (Sports Health Information System)

> ### ⏱️ When Seconds Count and Careers are on the Line.
> In the high-stakes world of elite sports, generic healthcare systems fail to keep pace. An athlete's recovery doesn't follow a standard 9-to-5 schedule, and a missed diagnosis—like early-stage bone fatigue—can end a season. The gap between generic care and elite performance is where championships are lost.

## 💡 Concept Statement
**MontuCore HIS** is specifically engineered to close that gap. Inspired by the ARMS Health System, it is an athlete-centered Electronic Health Record (EHR) designed for the unique, high-frequency workflows of sports medicine. By integrating specialized injury tracking, rapid scheduling, and multi-disciplinary team coordination, MontuCore ensures medical staff have the tools to get athletes back to peak performance safely and efficiently.

---

## 📏 Development Guidelines
To maintain code quality and consistency across the MontuCore HIS project, all contributors must adhere to the following guidelines.

### General Rules
* **Naming:** Use meaningful and descriptive names for all variables and functions.
* **Comments:** Write clear comments for complex business logic.
* **Functions:** Keep functions small, focused, and pure where possible.
* **Error Handling:** Handle errors gracefully using `try-catch` blocks.
* **DRY Principle:** Avoid code duplication.

### Naming Conventions
| Entity | Convention | Example |
| :--- | :--- | :--- |
| Variables/Functions | `camelCase` | `athleteData`, `getAppointment` |
| Classes/Components | `PascalCase` | `AthleteProfile`, `AppointmentScheduler` |
| Constants | `UPPER_SNAKE_CASE` | `API_URL`, `MAX_ATTEMPTS` |
| Database Tables | `snake_case` | `athletes`, `medical_records` |

### Git Commit Messages
We follow established conventional commit formats: `type: brief description`
* `feat`: New feature (e.g., `feat: add athlete appointment scheduling`)
* `fix`: Bug fix
* `docs`: Documentation update
* `style`: Code formatting (whitespace, semi-colons, etc.)
* `refactor`: Code improvement without adding features or fixing bugs

### Code Organization
* Organize files by feature or module rather than file type.
* Keep related code together to improve maintainability.
* Maintain strict separation of concerns (Frontend UI vs Backend Logic vs Database access).

---

## ✨ Features

### 🏃 Athlete-Centered EHR
* **Specialized Profiling:** Focuses on performance metrics, recurring injuries, and fatigue levels rather than just standard vitals.
* **EMR Integration:** Consolidates records from external hospitals and specialized procedure centers into a unified view.
  
| Player Dashboard |
|:---:|
| ![Player Dashboard](MontuCore%20Front/src/assets/images/web%20screenshots/player%20dashboard.png)|

| Patient Portal |
|:---:|
| ![Patient Portal](MontuCore%20Front/src/assets/images/web%20screenshots/patient%20portal.png)|

---

### 👥 Multi-Disciplinary Team Management
* **Role-Based Access:** Customized interfaces specifically for physicians, nutritionists, and physiotherapists.
* **Administrative Oversight:** Dedicated views for coordination and team management.

| Admin Dashboard | Physio Dashboard |
|:---:|:---:|
| ![Admin Dashboard](MontuCore%20Front/src/assets/images/web%20screenshots/admin.jpeg) | ![Physio Dashboard](MontuCore%20Front/src/assets/images/web%20screenshots/physio%20dashboard.jpeg) |
| *Administrative insights & team coordination* | *Physiotherapist's dashboard* |

---

### 📅 Advanced Scheduling
* **Rapid Booking:** Efficient management for rehabilitation, physiotherapy, recovery sessions, and fitness evaluations to minimize athlete downtime.

| Rehab Active Cases | Receipt |
|:---:|:---:|
| ![Rehab Active Cases](MontuCore%20Front/src/assets/images/web%20screenshots/rehab%20active%20cases%20for%20physio.jpeg) | ![Receipt](MontuCore%20Front/src/assets/images/web%20screenshots/recipt.png) |
| *Active rehabilitation case tracking for physios* | *Appointment & session receipt* |

---

### 📊 Analytics & Imaging
* **Injury & Recovery Tracking:** Advanced reporting on injury trends and team health metrics.
* **Integrated DICOM Viewer:** Seamless access to X-ray, CT, and MRI images using Cornerstone.js.
* **CDSS Integration:** Clinical Decision Support System for evidence-based recommendations.

| Report Filling — Step 1 | Report Filling — Step 2 | Report Filling — Step 3 |
|:---:|:---:|:---:|
| ![Report Filling Step 1](MontuCore%20Front/src/assets/images/web%20screenshots/report%20filling%201.png) | ![Report Filling Step 2](MontuCore%20Front/src/assets/images/web%20screenshots/report%20filling%203.png) | ![Report Filling Step 3](MontuCore%20Front/src/assets/images/web%20screenshots/report%20filling%202.png) |
| *Step 1: case status and symptoms* | *Step 2: Assesment* | *Step 3: Imaging Exam* |

---

### 🔐 Registration & Onboarding

| Register | Risk Entry Upon Register |
|:---:|:---:|
| ![Register](MontuCore%20Front/src/assets/images/web%20screenshots/register.jpeg) | ![Risk Entry](MontuCore%20Front/src/assets/images/web%20screenshots/risk%20entery%20upon%20register.jpeg) |
| *New athlete registration flow* | *Risk assessment during onboarding* |

---

## 🧪 DICOM Testing Guide

### Quick Start
1. **Start Backend:** `cd server && pnpm dev`
2. **Start Frontend:** `cd MontuCore Front && pnpm dev`
3. **Test Upload:** Navigate to `/dicom-test` in your browser

### Testing Workflows

#### 1. Upload DICOMs to New Exam
- Select "Create New Exam" mode
- Enter Case ID (e.g., 7)
- Choose multiple .dcm files
- Upload and view automatically

#### 2. Load Existing Exam
- Enter Exam ID in test page
- Click "Load Exam"
- View DICOM series in Cornerstone.js viewer

#### 3. Add to Existing Exam
- Select "Add to Existing Exam" mode
- Enter existing Exam ID
- Upload additional DICOM files

### API Testing
Use Bruno collection in `server/api-collection/` or the test script `server/test-dicom.js` for backend verification.

### Troubleshooting
- Check Supabase credentials and bucket permissions
- Verify DICOM files are valid .dcm format
- Ensure backend runs on port 3000
- Check browser console for Cornerstone.js errors

---

## 👨‍💻 Developers

> **Frontend Team**
> <br>
> [`Talal Emara`](https://github.com/TalalEmara) &nbsp; • &nbsp; [`Maya Mohammed`](https://github.com/Mayamohamed207)

> **Backend Team**
> <br>
> [`Mohamed Hisham`](https://github.com/MohamedHisham20) &nbsp; • &nbsp; [`Abd El Rahman Sayed`](https://github.com/Abdelrahman0Sayed) &nbsp; • &nbsp; [`Omar Khaled`](https://github.com/omarkhaled235)
