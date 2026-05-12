-- Runs after `pnpm seed`. Reapplies all post-seed customizations idempotently.
-- Order: thumbnails, maintenance, bank accounts. (Belajarbro import is run via TS script before this.)

-- 1. Thumbnails
UPDATE packages SET thumbnail = '/covers/sampul_cpns.png'         WHERE name = 'Paket CPNS Lengkap 2026';
UPDATE packages SET thumbnail = '/covers/sampul_cpns_2.png'       WHERE name = 'Paket TWK Intensif CPNS';
UPDATE packages SET thumbnail = '/covers/sampul_utbk_sma.png'     WHERE name = 'Bimbel UTBK SMA Kelas 12';
UPDATE packages SET thumbnail = '/covers/sampul_utbk_smp.png'     WHERE name = 'Bimbel Matematika SMP';
UPDATE packages SET thumbnail = '/covers/sampul_calistung_sd.png' WHERE name = 'Calistung dan Matematika SD';

-- 2. Maintenance mode for non-CPNS + Paket TWK Intensif (still under construction)
UPDATE packages SET maintenance_mode = true WHERE category != 'CPNS';
UPDATE packages SET maintenance_mode = true WHERE name = 'Paket TWK Intensif CPNS';

-- 3. Bank accounts: deactivate demo, add CIMB Niaga
UPDATE bank_accounts SET is_active = false WHERE bank_name IN ('BCA', 'Mandiri', 'BRI');
INSERT INTO bank_accounts (bank_name, account_number, account_holder, is_active)
SELECT 'CIMB Niaga', '800204000500', 'Hemitech Karya Indonesia', true
WHERE NOT EXISTS (SELECT 1 FROM bank_accounts WHERE bank_name = 'CIMB Niaga' AND account_number = '800204000500');

-- 4. Drop placeholder PDF materials (w3.org sample)
DELETE FROM material_progress WHERE material_id IN (
  SELECT id FROM materials WHERE file_url LIKE 'https://www.w3.org/%'
);
DELETE FROM materials WHERE file_url LIKE 'https://www.w3.org/%';

-- 5. Backfill material categories (works for belajarbro import + any survivors)
UPDATE materials SET category = 'TWK' WHERE order_index BETWEEN 100 AND 199 AND category IS NULL;
UPDATE materials SET category = 'TIU' WHERE order_index BETWEEN 200 AND 299 AND category IS NULL;
UPDATE materials SET category = 'TKP' WHERE order_index BETWEEN 300 AND 399 AND category IS NULL;

SELECT 'Restored. Package state:' AS info;
SELECT id, name, category, maintenance_mode, thumbnail FROM packages ORDER BY id;
