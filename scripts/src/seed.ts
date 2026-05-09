import { db, usersTable, packagesTable, questionsTable, quizzesTable, tryoutsTable, materialsTable, bankAccountsTable, ordersTable, enrollmentsTable, quizQuestionsTable, tryoutQuestionsTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  await db.execute(sql`TRUNCATE users, bank_accounts, packages, questions, quizzes, tryouts, materials, orders, enrollments, quiz_questions, tryout_questions, material_progress, attempts RESTART IDENTITY CASCADE`);

  const adminPass = bcrypt.hashSync("admin123", 12);
  const tutorPass = bcrypt.hashSync("tutor123", 12);
  const studentPass = bcrypt.hashSync("student123", 12);

  await db.insert(usersTable).values([
    { name: "Admin Utama", email: "admin@siaplulus.id", password: adminPass, role: "admin", phone: "081234567890" },
    { name: "Budi Santoso", email: "tutor@siaplulus.id", password: tutorPass, role: "tutor", phone: "082345678901" },
    { name: "Andi Pratama", email: "andi@student.id", password: studentPass, role: "student", phone: "083456789012", targetInstitution: "BPS Pusat" },
    { name: "Siti Rahma", email: "siti@student.id", password: studentPass, role: "student", phone: "084567890123", targetInstitution: "Kemenkes" },
    { name: "Reza Kurniawan", email: "reza@student.id", password: studentPass, role: "student", phone: "085678901234", targetInstitution: "Kemenkeu" },
  ]);
  console.log("Users seeded");

  await db.insert(bankAccountsTable).values([
    { bankName: "BCA", accountNumber: "1234567890", accountHolder: "PT SiapLulus Indonesia", isActive: true },
    { bankName: "Mandiri", accountNumber: "0987654321", accountHolder: "PT SiapLulus Indonesia", isActive: true },
    { bankName: "BRI", accountNumber: "1122334455", accountHolder: "PT SiapLulus Indonesia", isActive: true },
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

  const insertedQuestions = await db.insert(questionsTable).values([
    { questionText: "Pancasila sebagai dasar negara pertama kali diusulkan oleh...", optionA: "Moh. Hatta", optionB: "Soekarno", optionC: "Moh. Yamin", optionD: "Soepomo", optionE: "Ahmad Subarjo", correctAnswer: "B", explanation: "Soekarno mengusulkan Pancasila pada tanggal 1 Juni 1945 dalam sidang BPUPKI.", category: "TWK", difficulty: "easy" },
    { questionText: "UUD 1945 terdiri dari berapa pasal setelah amandemen?", optionA: "36 pasal", optionB: "37 pasal", optionC: "73 pasal", optionD: "62 pasal", optionE: "43 pasal", correctAnswer: "C", explanation: "Setelah 4 kali amandemen, UUD 1945 terdiri dari 73 pasal.", category: "TWK", difficulty: "medium" },
    { questionText: "Bhineka Tunggal Ika berasal dari bahasa...", optionA: "Jawa", optionB: "Sansekerta", optionC: "Melayu", optionD: "Kawi", optionE: "Bali", correctAnswer: "D", explanation: "Bhineka Tunggal Ika berasal dari bahasa Kawi yang terdapat dalam Kakawin Sutasoma.", category: "TWK", difficulty: "medium" },
    { questionText: "Sidang BPUPKI pertama berlangsung pada tanggal...", optionA: "29 Mei - 1 Juni 1945", optionB: "10 Juli - 17 Juli 1945", optionC: "17 Agustus 1945", optionD: "18 Agustus 1945", optionE: "22 Juni 1945", correctAnswer: "A", explanation: "Sidang pertama BPUPKI berlangsung 29 Mei hingga 1 Juni 1945.", category: "TWK", difficulty: "easy" },
    { questionText: "Lembaga tinggi negara yang bertugas mengubah dan menetapkan UUD adalah...", optionA: "DPR", optionB: "MA", optionC: "MPR", optionD: "MK", optionE: "BPK", correctAnswer: "C", explanation: "MPR (Majelis Permusyawaratan Rakyat) bertugas mengubah dan menetapkan UUD.", category: "TWK", difficulty: "easy" },
    { questionText: "Jika 2x + 5 = 15, maka nilai x adalah...", optionA: "3", optionB: "4", optionC: "5", optionD: "6", optionE: "7", correctAnswer: "C", explanation: "2x + 5 = 15, 2x = 10, x = 5.", category: "TIU", difficulty: "easy" },
    { questionText: "Deret berikut: 2, 6, 18, 54, ... Angka berikutnya adalah...", optionA: "108", optionB: "144", optionC: "162", optionD: "216", optionE: "324", correctAnswer: "C", explanation: "Pola: dikali 3. 54 x 3 = 162.", category: "TIU", difficulty: "easy" },
    { questionText: "Jika harga barang naik 20%, kemudian turun 10%, perubahan harga total adalah...", optionA: "Naik 8%", optionB: "Naik 10%", optionC: "Naik 12%", optionD: "Turun 2%", optionE: "Turun 8%", correctAnswer: "A", explanation: "120% x 90% = 108% dari harga asal, naik 8%.", category: "TIU", difficulty: "medium" },
    { questionText: "Sinonim dari kata \"urgen\" adalah...", optionA: "Biasa", optionB: "Mendesak", optionC: "Lambat", optionD: "Penting sekali", optionE: "Darurat", correctAnswer: "B", explanation: "Urgen berarti mendesak atau segera harus diselesaikan.", category: "TIU", difficulty: "easy" },
    { questionText: "Analogi: DOKTER : PASIEN = GURU : ...", optionA: "Sekolah", optionB: "Buku", optionC: "Murid", optionD: "Pelajaran", optionE: "Kurikulum", correctAnswer: "C", explanation: "Dokter melayani pasien, Guru melayani murid.", category: "TIU", difficulty: "easy" },
    { questionText: "Saat rekan kerja melakukan kesalahan yang berdampak pada proyek tim, apa yang sebaiknya Anda lakukan?", optionA: "Melaporkan ke atasan tanpa memberitahu rekan kerja", optionB: "Mengabaikan dan menyelesaikan sendiri", optionC: "Mendiskusikan dengan rekan kerja dan mencari solusi bersama", optionD: "Memarahi rekan kerja di depan umum", optionE: "Menginformasikan ke seluruh tim agar semua tahu kesalahannya", correctAnswer: "C", explanation: "Pendekatan kolaboratif dan profesional adalah tindakan terbaik dalam situasi tim.", category: "TKP", difficulty: "medium" },
    { questionText: "Ketika Anda mendapat tugas baru dari atasan sementara tugas lama belum selesai, Anda akan...", optionA: "Menolak tugas baru karena belum selesai yang lama", optionB: "Menerima tugas baru dan menunda tugas lama", optionC: "Menentukan prioritas dan mengkomunikasikan ke atasan", optionD: "Diam saja dan berusaha menyelesaikan keduanya", optionE: "Meminta rekan kerja mengerjakan salah satu", correctAnswer: "C", explanation: "Manajemen prioritas dan komunikasi yang baik adalah kunci penyelesaian tugas yang efektif.", category: "TKP", difficulty: "medium" },
    { questionText: "Hasil dari 3^4 adalah...", optionA: "27", optionB: "64", optionC: "81", optionD: "100", optionE: "12", correctAnswer: "C", explanation: "3^4 = 3 x 3 x 3 x 3 = 81", category: "Matematika", difficulty: "easy" },
    { questionText: "Luas lingkaran dengan jari-jari 7 cm adalah... (π = 22/7)", optionA: "44 cm²", optionB: "154 cm²", optionC: "124 cm²", optionD: "144 cm²", optionE: "164 cm²", correctAnswer: "B", explanation: "L = π r² = 22/7 x 7² = 22/7 x 49 = 154 cm²", category: "Matematika", difficulty: "easy" },
    { questionText: "Nilai x yang memenuhi 3x - 6 = 9 adalah...", optionA: "3", optionB: "4", optionC: "5", optionD: "6", optionE: "7", correctAnswer: "C", explanation: "3x = 15, x = 5", category: "Matematika", difficulty: "easy" },
  ]).returning();
  console.log(`Questions seeded: ${insertedQuestions.length}`);

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
    { packageId: 1, title: "Latihan TWK Dasar", description: "Quiz pengenalan materi TWK - Pancasila dan UUD 1945", timeLimit: 20, passingScore: 60 },
    { packageId: 1, title: "Latihan TIU Verbal dan Numerik", description: "Quiz kemampuan verbal dan numerik TIU", timeLimit: 15, passingScore: 70 },
    { packageId: 2, title: "Latihan TPS UTBK", description: "Quiz Tes Potensi Skolastik untuk persiapan UTBK", timeLimit: 30, passingScore: 65 },
  ]).returning();

  const insertedTryouts = await db.insert(tryoutsTable).values([
    { title: "Grand Tryout CPNS SKD #1", description: "Simulasi lengkap SKD CPNS dengan 15 soal selama 100 menit (demo).", type: "CPNS_SKD", durationMinutes: 100, packageId: 1 },
    { title: "Tryout Nasional Mei 2026", description: "Tryout serentak untuk persiapan CPNS 2026. Tersedia ranking nasional.", type: "CPNS_SKD", durationMinutes: 100, packageId: 1 },
  ]).returning();

  const qIds = insertedQuestions.map(q => q.id);

  await db.insert(quizQuestionsTable).values(qIds.slice(0, 5).map((qId, i) => ({ quizId: insertedQuizzes[0].id, questionId: qId, orderIndex: i + 1 })));
  await db.insert(quizQuestionsTable).values(qIds.slice(5, 10).map((qId, i) => ({ quizId: insertedQuizzes[1].id, questionId: qId, orderIndex: i + 1 })));

  await db.insert(tryoutQuestionsTable).values(qIds.map((qId, i) => ({ tryoutId: insertedTryouts[0].id, questionId: qId, orderIndex: i + 1 })));
  await db.insert(tryoutQuestionsTable).values(qIds.map((qId, i) => ({ tryoutId: insertedTryouts[1].id, questionId: qId, orderIndex: i + 1 })));

  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const [order] = await db.insert(ordersTable).values({
    userId: 3, packageId: 1, orderCode: "INV-20260509-00001", amount: 499000, uniqueAmount: 499123, status: "PAID", expiredAt
  }).returning();
  await db.insert(enrollmentsTable).values({ userId: 3, packageId: 1, orderId: order.id, expiresAt });

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
