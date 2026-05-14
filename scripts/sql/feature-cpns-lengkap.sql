-- Feature "Paket CPNS Lengkap 2026" as the first package and set price to Rp 249.000.
-- Idempotent: re-running is safe.

UPDATE packages
SET price = 249000,
    sort_order = 100,
    updated_at = NOW()
WHERE name = 'Paket CPNS Lengkap 2026';

SELECT id, name, price, sort_order FROM packages ORDER BY sort_order DESC, id ASC;
