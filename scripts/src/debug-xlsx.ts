import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const file = path.join(REPO_ROOT, "attached_assets/crawling_result/Soal_TWK_Belajarbro.xlsx");

const wb = XLSX.read(readFileSync(file), { type: "buffer" });
console.log("sheets:", wb.SheetNames);

const ws = wb.Sheets["Nasionalisme"]!;
console.log("!ref:", ws["!ref"]);
console.log("!merges:", JSON.stringify(ws["!merges"]?.slice(0, 3)));

const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
console.log("rows.length:", rows.length);
for (let i = 0; i < Math.min(8, rows.length); i++) {
  const r = rows[i];
  console.log(`row[${i}] (len=${r?.length}):`, JSON.stringify(r)?.slice(0, 220));
}
process.exit(0);
