UPDATE bank_accounts SET is_active = false WHERE bank_name IN ('BCA', 'Mandiri', 'BRI');
INSERT INTO bank_accounts (bank_name, account_number, account_holder, is_active)
VALUES ('CIMB Niaga', '800204000500', 'Hemitech Karya Indonesia', true);
SELECT id, bank_name, account_number, account_holder, is_active FROM bank_accounts ORDER BY is_active DESC, id;
