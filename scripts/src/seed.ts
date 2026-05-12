import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import {
  db,
  usersTable,
  packagesTable,
  questionsTable,
  quizzesTable,
  tryoutsTable,
  materialsTable,
  bankAccountsTable,
  ordersTable,
  enrollmentsTable,
  quizQuestionsTable,
  tryoutQuestionsTable,
} from "@workspace/db";

type QuestionCategory = "TWK" | "TIU" | "TKP";

type SeedQuestion = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: string;
  explanation: string;
  category: QuestionCategory;
  difficulty: "easy" | "medium" | "hard";
};

function loadCpnsQuestions(): SeedQuestion[] {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const xlsxPath = path.resolve(here, "../../attached_assets/Soal_CPNS_2024_TWK_TIU_TKP.xlsx");
  const wb = XLSX.read(readFileSync(xlsxPath), { type: "buffer" });
  const out: SeedQuestion[] = [];

  for (const category of ["TWK", "TIU", "TKP"] as const) {
    const ws = wb.Sheets[category];
    if (!ws) throw new Error(`Sheet not found: ${category}`);
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
    // Header at row index 3, data from row index 4 onward
    for (let i = 4; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r[1] == null) continue;
      const [, questionText, optA, optB, optC, optD, optE, jawaban, keterangan] = r as (string | number | null)[];
      if (!questionText || !jawaban) continue;
      out.push({
        questionText: String(questionText).trim(),
        optionA: String(optA ?? "").trim(),
        optionB: String(optB ?? "").trim(),
        optionC: String(optC ?? "").trim(),
        optionD: String(optD ?? "").trim(),
        optionE: String(optE ?? "").trim(),
        correctAnswer: String(jawaban).trim().toUpperCase().charAt(0),
        explanation: keterangan ? String(keterangan).trim() : "",
        category,
        difficulty: "medium",
      });
    }
  }

  return out;
}

async function seed() {
  console.log("Seeding database...");

  await db.execute(sql`TRUNCATE users, bank_accounts, packages, questions, quizzes, tryouts, materials, orders, enrollments, quiz_questions, tryout_questions, material_progress, attempts RESTART IDENTITY CASCADE`);

  const adminPass = bcrypt.hashSync("admin123", 12);
  const tutorPass = bcrypt.hashSync("tutor123", 12);
  const studentPass = bcrypt.hashSync("student123", 12);

  await db.insert(usersTable).values([
    { name: "Admin Utama", email: "admin@lulusin.id", password: adminPass, role: "admin", phone: "081234567890" },
    { name: "Budi Santoso", email: "tutor@lulusin.id", password: tutorPass, role: "tutor", phone: "082345678901" },
    { name: "Andi Pratama", email: "andi@student.id", password: studentPass, role: "student", phone: "083456789012", targetInstitution: "BPS Pusat" },
    { name: "Siti Rahma", email: "siti@student.id", password: studentPass, role: "student", phone: "084567890123", targetInstitution: "Kemenkes" },
    { name: "Reza Kurniawan", email: "reza@student.id", password: studentPass, role: "student", phone: "085678901234", targetInstitution: "Kemenkeu" },
  ]);
  console.log("Users seeded");

  await db.insert(bankAccountsTable).values([
    { bankName: "BCA", accountNumber: "1234567890", accountHolder: "PT Lulusin Indonesia", isActive: true },
    { bankName: "Mandiri", accountNumber: "0987654321", accountHolder: "PT Lulusin Indonesia", isActive: true },
    { bankName: "BRI", accountNumber: "1122334455", accountHolder: "PT Lulusin Indonesia", isActive: true },
  ]);
  console.log("Bank accounts seeded");

  await db.insert(packagesTable).values([
    { name: "Paket CPNS Lengkap 2026", description: "Persiapan CPNS terlengkap mencakup TWK, TIU, dan TKP dengan ratusan soal dan tryout simulasi SKD. Dipandu tutor berpengalaman CPNS.", price: 499000, durationDays: 90, category: "CPNS", isActive: true },
    { name: "Bimbel UTBK SMA Kelas 12", description: "Persiapan UTBK lengkap untuk siswa SMA kelas 12. Mencakup TPS, Matematika, dan mata pelajaran pilihan. Tryout mingguan.", price: 350000, durationDays: 60, category: "SMA", isActive: true },
    { name: "Bimbel Matematika SMP", description: "Modul matematika SMP lengkap dari bilangan hingga statistika. Cocok untuk persiapan ujian akhir dan olimpiade.", price: 199000, durationDays: 45, category: "SMP", isActive: true },
    { name: "Calistung dan Matematika SD", description: "Program belajar membaca, menulis, berhitung untuk SD kelas 1-6. Metode fun learning.", price: 149000, durationDays: 30, category: "SD", isActive: true },
    { name: "Paket TWK Intensif CPNS", description: "Fokus pada Tes Wawasan Kebangsaan dengan pembahasan mendalam Pancasila, UUD 1945, NKRI, dan Bhineka Tunggal Ika.", price: 249000, durationDays: 45, category: "CPNS", isActive: true },
  ]);
  console.log("Packages seeded");

  const cpnsQuestions = loadCpnsQuestions();
  const twkCount = cpnsQuestions.filter(q => q.category === "TWK").length;
  const tiuCount = cpnsQuestions.filter(q => q.category === "TIU").length;
  const tkpCount = cpnsQuestions.filter(q => q.category === "TKP").length;

  const insertedQuestions = await db.insert(questionsTable).values(cpnsQuestions).returning();
  console.log(`Questions seeded: ${insertedQuestions.length} (TWK ${twkCount}, TIU ${tiuCount}, TKP ${tkpCount})`);

  const twkIds = insertedQuestions.filter(q => q.category === "TWK").map(q => q.id);
  const tiuIds = insertedQuestions.filter(q => q.category === "TIU").map(q => q.id);
  const tkpIds = insertedQuestions.filter(q => q.category === "TKP").map(q => q.id);
  const skdIds = [...twkIds, ...tiuIds, ...tkpIds];

  await db.insert(materialsTable).values([
    { packageId: 1, title: "Pengantar CPNS dan SKD", description: "Mengenal sistem seleksi CPNS dan komponen SKD (TWK, TIU, TKP).", fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf", orderIndex: 1 },
    { packageId: 1, title: "TWK - Wawasan Kebangsaan", description: "Materi Pancasila, UUD 1945, NKRI, dan Bhineka Tunggal Ika.", fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf", orderIndex: 2 },
    { packageId: 1, title: "TIU - Kemampuan Verbal", description: "Sinonim, antonim, analogi, dan pemahaman bacaan.", fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf", orderIndex: 3 },
    { packageId: 1, title: "TIU - Kemampuan Numerik", description: "Deret angka, aritmatika, dan soal cerita matematika.", fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf", orderIndex: 4 },
    { packageId: 1, title: "TKP - Karakteristik Pribadi", description: "Integritas, semangat berprestasi, pelayanan publik, dan kerjasama.", fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf", orderIndex: 5 },
    { packageId: 2, title: "Pengantar UTBK dan TPS", description: "Mengenal format dan strategi mengerjakan soal UTBK dan TPS.", fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf", orderIndex: 1 },
    { packageId: 3, title: "Aljabar SMP Dasar", description: "Persamaan linear dan sistem persamaan linear dua variabel.", fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf", orderIndex: 1 },
  ]);

  const insertedQuizzes = await db.insert(quizzesTable).values([
    { packageId: 1, title: "Latihan TWK Dasar", description: "Latihan 10 soal Tes Wawasan Kebangsaan", timeLimit: 20, passingScore: 60 },
    { packageId: 1, title: "Latihan TIU Verbal dan Numerik", description: "Latihan 10 soal Tes Intelegensi Umum", timeLimit: 15, passingScore: 70 },
    { packageId: 1, title: "Latihan TKP Situasional", description: "Latihan 10 soal Tes Karakteristik Pribadi", timeLimit: 20, passingScore: 70 },
  ]).returning();

  const insertedTryouts = await db.insert(tryoutsTable).values([
    { title: "Grand Tryout CPNS SKD #1", description: `Simulasi lengkap SKD CPNS: ${twkCount} TWK + ${tiuCount} TIU + ${tkpCount} TKP selama 100 menit.`, type: "CPNS_SKD", durationMinutes: 100, packageId: 1 },
    { title: "Tryout Nasional Mei 2026", description: "Tryout serentak untuk persiapan CPNS 2026. Tersedia ranking nasional.", type: "CPNS_SKD", durationMinutes: 100, packageId: 1 },
  ]).returning();

  await db.insert(quizQuestionsTable).values(twkIds.slice(0, 10).map((qId, i) => ({ quizId: insertedQuizzes[0].id, questionId: qId, orderIndex: i + 1 })));
  await db.insert(quizQuestionsTable).values(tiuIds.slice(0, 10).map((qId, i) => ({ quizId: insertedQuizzes[1].id, questionId: qId, orderIndex: i + 1 })));
  await db.insert(quizQuestionsTable).values(tkpIds.slice(0, 10).map((qId, i) => ({ quizId: insertedQuizzes[2].id, questionId: qId, orderIndex: i + 1 })));

  await db.insert(tryoutQuestionsTable).values(skdIds.map((qId, i) => ({ tryoutId: insertedTryouts[0].id, questionId: qId, orderIndex: i + 1 })));
  await db.insert(tryoutQuestionsTable).values(skdIds.map((qId, i) => ({ tryoutId: insertedTryouts[1].id, questionId: qId, orderIndex: i + 1 })));
  console.log("Quizzes & tryouts wired");

  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const [order] = await db.insert(ordersTable).values({
    userId: 3, packageId: 1, orderCode: "INV-20260509-00001", amount: 499000, uniqueAmount: 123, status: "PAID", expiredAt,
  }).returning();
  await db.insert(enrollmentsTable).values({ userId: 3, packageId: 1, expiredAt: expiresAt });
  void order;

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
