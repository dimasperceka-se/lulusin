# Replit Prompt: CPNS Course & School Tutoring Platform

Build me a full-stack web application for a paid online course platform with the following specifications:

## 🎯 Application Goal
An e-learning platform for **CPNS exam preparation** (Indonesian civil servant test: TWK, TIU, TKP) and **school tutoring** (Elementary, Junior High, Senior High) with **manual bank transfer payment** system. Students pay first, admin verifies the payment, then students get access to the materials.

## 🛠️ Tech Stack
- **Frontend**: React (Vite) + TailwindCSS + React Router + Axios
- **Backend**: Node.js + Express.js + JWT Authentication
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Local storage in `/uploads` folder (for PDFs & payment proofs)
- **State Management**: React Context API or Zustand

## 👥 User Roles (3 levels)
1. **Admin** — manages all data, verifies payments, uploads materials
2. **Tutor/Teacher** — creates questions, uploads PDFs, monitors student progress
3. **Student** — buys packages, accesses materials, takes tryouts/quizzes

## 📋 Complete Features

### A. Authentication & User Management
- Register/Login with email + password (bcrypt hashing)
- JWT token for sessions
- Forgot password (simulate via email log first)
- Student profile: name, email, phone, target school/institution, profile photo
- Different dashboards per role

### B. Course Package Catalog
- Landing page with list of course packages
- Each package has: name, description, price, access duration (e.g. 3 months), category (CPNS/Elementary/JHS/SHS), thumbnail
- Package detail: syllabus, number of PDF materials, number of tryouts, number of quizzes
- Filter & search packages
- Example packages:
  - "Complete CPNS 2026 Package" - Rp 499,000
  - "UTBK High School Grade 12 Tutoring" - Rp 350,000
  - "Junior High Math Tutoring" - Rp 199,000

### C. Manual Bank Transfer Payment System ⭐ (CRITICAL)
- When a student clicks "Buy Package":
  1. Generate **unique Order ID** (format: `INV-YYYYMMDD-XXXXX`)
  2. Show payment instruction page with:
     - Bank account numbers (BCA, Mandiri, BRI — manageable by admin)
     - **Unique amount** (price + 3 random digits, e.g. Rp 499,347) to make verification easier
     - Payment deadline (24 hours) with countdown timer
     - Order ID to be included in transfer notes
  3. Form to upload payment proof (JPG/PNG image, max 2MB)
  4. Order status: `PENDING` → `WAITING_VERIFICATION` → `PAID` / `EXPIRED` / `REJECTED`
- **"My Orders" page** for students: see all orders & their statuses
- **Admin Payment Verification page**:
  - List all orders with `WAITING_VERIFICATION` status
  - Preview payment proof
  - "Approve" button (activate package access) or "Reject" (with reason)
  - Auto email notification to student (simulate via log first)
- After approval, automatically enroll student in package with expiry date

### D. PDF Material Management
- Admin/Tutor uploads PDFs per package with title, description, order
- Enrolled students can view PDFs (use `react-pdf` or iframe viewer)
- **Anti-download protection**: disable right-click, watermark student email on the PDF viewer
- Track progress: which materials have been read

### E. Quiz System (Short Practice Questions)
- Quiz per chapter/topic (5–20 questions)
- Question type: multiple choice (A–E)
- After submission: instantly show score + explanation per question
- Can be retaken multiple times
- Quiz history saved

### F. CBT Tryout System (Computer-Based Test) ⭐
- Mirrors actual CPNS exam / UTBK tryout
- Features:
  - **Countdown timer** (e.g. 100 minutes for CPNS SKD)
  - Auto-submit when time runs out
  - Question navigation: answered / doubtful / unanswered (different colors)
  - Can flag "doubtful" questions
  - Randomized questions per student
  - Anti-cheat: warning when tab is switched, optional fullscreen mode
- **Tryout Results**:
  - Total score + score per category (TWK, TIU, TKP for CPNS)
  - Passing grade (CPNS: TWK 65, TIU 80, TKP 166)
  - National ranking (all participants of the same tryout)
  - Explanation for each question
  - History of all tryouts taken
- Admin can create **Scheduled Tryouts** (e.g. "Grand Tryout May 15")

### G. Question Bank (Admin/Tutor)
- CRUD questions with fields: question text, image (optional), 5 answer choices, correct answer, explanation, category, difficulty level, tag
- Import questions from Excel/CSV (bonus)
- Questions can be used for both Quiz and Tryout

### H. Student Dashboard
- Active packages + remaining access days
- Learning progress (% of materials completed)
- Statistics: number of quizzes taken, average score, latest tryout
- Score progression chart (recharts)
- Recommendations on materials to review (low scores)

### I. Admin Dashboard
- Total students, monthly revenue total, pending verification orders
- Monthly revenue chart
- Student list & enrollment status
- CRUD for packages, materials, questions, tryouts, bank accounts
- Sales report (export to Excel)

## 🗄️ Database Schema (Prisma)

Create these tables:
- `users` (id, email, password, name, phone, role, avatar, created_at)
- `packages` (id, name, description, price, duration_days, category, thumbnail, is_active)
- `bank_accounts` (id, bank_name, account_number, account_holder, is_active)
- `orders` (id, user_id, package_id, order_code, amount, unique_amount, status, payment_proof, expired_at, paid_at, verified_by, rejection_reason)
- `enrollments` (id, user_id, package_id, started_at, expired_at, is_active)
- `materials` (id, package_id, title, description, file_url, order_index)
- `material_progress` (id, user_id, material_id, is_read, read_at)
- `questions` (id, question_text, image_url, option_a-e, correct_answer, explanation, category, difficulty, created_by)
- `quizzes` (id, package_id, title, description, time_limit, passing_score)
- `quiz_questions` (quiz_id, question_id, order)
- `tryouts` (id, title, description, type, duration_minutes, scheduled_at, package_id)
- `tryout_questions` (tryout_id, question_id, category)
- `attempts` (id, user_id, quiz_id/tryout_id, score, started_at, finished_at, answers_json)

## 🎨 UI/UX Requirements
- Modern, clean, mobile-responsive design
- Color scheme: blue (primary) + white + orange accent (for CTAs)
- Typography: Inter or Poppins
- Good loading states & error handling
- Toast notifications (react-hot-toast)
- Sidebar navigation for dashboards
- Logo & branding placeholder

## 📁 Folder Structure
```
/client (React frontend)
  /src
    /components
    /pages
    /contexts
    /utils
    /api
/server (Node.js backend)
  /routes
  /controllers
  /middleware
  /prisma
  /uploads
.env.example
README.md
```

## 🔐 Security
- Password hashing with bcrypt
- JWT with refresh token
- Input validation with Zod or Joi
- Rate limiting on login & register endpoints
- CORS configured
- File upload validation (type & size)
- SQL injection prevention via Prisma

## 🚀 Setup & Seeding
- Provide **seed data**:
  - 1 default admin (email: admin@kursus.id, password: admin123)
  - 1 demo tutor
  - 3 demo students
  - 5 sample course packages
  - 50 sample questions (CPNS & tutoring)
  - 2 ready-to-use tryouts
- Create a `README.md` with installation instructions & usage guide
- Create `.env.example` listing all required environment variables

## ✅ Deliverables
1. Complete frontend & backend source code
2. Database migrations & seed
3. README with setup tutorial
4. Demo accounts for testing all roles
5. Make sure the app runs **out of the box** on Replit

---

**Additional notes**:
- Prioritize the **manual transfer payment** and **CBT tryout** features — these are the core.
- Keep the code **modular & clean** so it's easy to extend later (e.g. adding Midtrans, video streaming, etc.).
- Add comments in important sections.
