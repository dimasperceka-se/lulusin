-- Set thumbnail URLs for all 5 packages
UPDATE packages SET thumbnail = '/covers/sampul_cpns.png'         WHERE name = 'Paket CPNS Lengkap 2026';
UPDATE packages SET thumbnail = '/covers/sampul_cpns_2.png'       WHERE name = 'Paket TWK Intensif CPNS';
UPDATE packages SET thumbnail = '/covers/sampul_utbk_sma.png'     WHERE name = 'Bimbel UTBK SMA Kelas 12';
UPDATE packages SET thumbnail = '/covers/sampul_utbk_smp.png'     WHERE name = 'Bimbel Matematika SMP';
UPDATE packages SET thumbnail = '/covers/sampul_calistung_sd.png' WHERE name = 'Calistung dan Matematika SD';

SELECT id, name, thumbnail FROM packages ORDER BY id;
