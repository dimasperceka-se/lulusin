-- Strip "Kategori / Sumber / Diambil" metadata blockquote from material content
-- Pattern: 3 blockquote lines + blank line + horizontal rule + blank line

UPDATE materials
SET content = regexp_replace(
  content,
  '> \*\*Kategori\*\*:[^\n]*\r?\n> \*\*Sumber\*\*:[^\n]*\r?\n> \*\*Diambil\*\*:[^\n]*\r?\n\r?\n---\r?\n\r?\n',
  '',
  'g'
)
WHERE content LIKE '%**Kategori**%' AND content LIKE '%**Sumber**%' AND content LIKE '%**Diambil**%';

SELECT id, title, LEFT(content, 100) AS preview FROM materials WHERE content IS NOT NULL ORDER BY id LIMIT 3;
