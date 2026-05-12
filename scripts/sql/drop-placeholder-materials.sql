-- Drop seed placeholder materials (fileUrl pointing to w3.org sample PDF)
-- These never had real content; belajarbro markdown materi already covers TWK/TIU/TKP.

DELETE FROM material_progress WHERE material_id IN (
  SELECT id FROM materials WHERE file_url LIKE 'https://www.w3.org/%'
);

DELETE FROM materials WHERE file_url LIKE 'https://www.w3.org/%';

SELECT category, COUNT(*) FROM materials WHERE package_id = 1 GROUP BY category ORDER BY category;
