-- Backfill `category` column on materials based on order_index ranges
-- Belajarbro import uses: TWK=100+, TIU=200+, TKP=300+
-- Seed materials use 1-5 (UMUM)

UPDATE materials SET category = 'TWK' WHERE order_index BETWEEN 100 AND 199 AND category IS NULL;
UPDATE materials SET category = 'TIU' WHERE order_index BETWEEN 200 AND 299 AND category IS NULL;
UPDATE materials SET category = 'TKP' WHERE order_index BETWEEN 300 AND 399 AND category IS NULL;

-- Seed materials by title pattern
UPDATE materials SET category = 'TWK' WHERE category IS NULL AND title LIKE 'TWK%';
UPDATE materials SET category = 'TIU' WHERE category IS NULL AND title LIKE 'TIU%';
UPDATE materials SET category = 'TKP' WHERE category IS NULL AND title LIKE 'TKP%';
UPDATE materials SET category = 'UMUM' WHERE category IS NULL;

SELECT category, COUNT(*) FROM materials GROUP BY category ORDER BY category;
