-- Mark non-CPNS packages as Under Maintenance
UPDATE packages SET maintenance_mode = true WHERE category != 'CPNS';

SELECT id, name, category, maintenance_mode FROM packages ORDER BY id;
