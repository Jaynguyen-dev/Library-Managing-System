-- =============================================================
-- SQL SERVER (SSMS) SCRIPT
-- Library Management System — User Cleanup & Setup
-- =============================================================
-- Instructions: Run this entire script in SSMS in one execution.
-- =============================================================

-- =============================================================
-- PART 1: DELETE all users EXCEPT Thanh Như (ktnhu2006@gmail.com)
-- Must delete child records first due to FK constraints.
-- =============================================================

BEGIN TRANSACTION;

-- 1. Delete notifications for users being removed
DELETE FROM Notification
WHERE user_id IN (
  SELECT id FROM [User]
  WHERE email != N'ktnhu2006@gmail.com'
);

-- 2. Delete fine payments linked to fines of users being removed
DELETE FROM FinePayment
WHERE fine_id IN (
  SELECT id FROM Fine
  WHERE user_id IN (
    SELECT id FROM [User]
    WHERE email != N'ktnhu2006@gmail.com'
  )
);

-- 3. Delete wallet transactions for wallets of users being removed
DELETE FROM WalletTransaction
WHERE wallet_id IN (
  SELECT id FROM Wallet
  WHERE user_id IN (
    SELECT id FROM [User]
    WHERE email != N'ktnhu2006@gmail.com'
  )
);

-- 4. Delete wallets of users being removed
DELETE FROM Wallet
WHERE user_id IN (
  SELECT id FROM [User]
  WHERE email != N'ktnhu2006@gmail.com'
);

-- 5. Delete fines of users being removed
DELETE FROM Fine
WHERE user_id IN (
  SELECT id FROM [User]
  WHERE email != N'ktnhu2006@gmail.com'
);

-- 6. Delete borrow items for borrows of users being removed
DELETE FROM BorrowItem
WHERE borrow_record_id IN (
  SELECT id FROM BorrowRecord
  WHERE user_id IN (
    SELECT id FROM [User]
    WHERE email != N'ktnhu2006@gmail.com'
  )
);

-- 7. Delete borrow records of users being removed
DELETE FROM BorrowRecord
WHERE user_id IN (
  SELECT id FROM [User]
  WHERE email != N'ktnhu2006@gmail.com'
);

-- 8. Finally, delete the users (except Thanh Nhu)
DELETE FROM [User]
WHERE email != N'ktnhu2006@gmail.com';

COMMIT TRANSACTION;

PRINT '=== PART 1 COMPLETE: All users except Thanh Như deleted ===';


-- =============================================================
-- PART 2: INSERT new accounts
-- =============================================================

-- Insert Librarian account
INSERT INTO [User] (full_name, email, password_hash, role, is_active, created_at)
VALUES (
  N'Librarian',
  N'librarian@demo.com',
  N'$2b$10$AJZFFyTXwuQ9IhlM2.VnteKWpVvpelKiw.xFUDYHLex/EHjPSox.K',
  N'librarian',
  1,
  GETDATE()
);

PRINT 'Inserted: Librarian (librarian@demo.com / librarian123)';

-- Insert Hoàng Nguyễn account
INSERT INTO [User] (full_name, email, password_hash, role, is_active, created_at)
VALUES (
  N'Hoàng Nguyễn',
  N'hoang@demo.com',
  N'$2b$10$3GvlmoNWxKwjaq3nvGtkIOnl2Pn7f1dRc4WUC6l8XEhpBONQ6xlx6',
  N'student',
  1,
  GETDATE()
);

PRINT 'Inserted: Hoàng Nguyễn (hoang@demo.com / hoang123)';

PRINT '=== PART 2 COMPLETE: New accounts inserted ===';


-- =============================================================
-- PART 3: CREATE LIBRARIAN VIEW
-- =============================================================

-- Drop existing view if present
IF OBJECT_ID('librarian_user_status', 'V') IS NOT NULL
  DROP VIEW librarian_user_status;
GO

CREATE VIEW librarian_user_status AS
SELECT
  u.id                              AS user_id,
  u.full_name,
  u.email,
  ISNULL(COUNT(DISTINCT br.id), 0)               AS total_borrowed,
  ISNULL(COUNT(DISTINCT CASE
    WHEN br.status = N'active' AND br.due_date < GETDATE()
    THEN br.id END), 0)                           AS overdue_books,
  ISNULL(SUM(CASE WHEN f.is_paid = 0 THEN f.amount ELSE 0 END), 0) AS total_fines,
  CASE
    WHEN SUM(CASE WHEN f.is_paid = 0 THEN 1 ELSE 0 END) > 0
      THEN N'Has Unpaid Fines'
    WHEN SUM(CASE WHEN f.is_paid = 1 THEN 1 ELSE 0 END) > 0
      THEN N'All Paid'
    ELSE N'No Fines'
  END                                            AS fine_status
FROM [User] u
LEFT JOIN BorrowRecord br ON br.user_id = u.id
LEFT JOIN Fine f ON f.user_id = u.id
GROUP BY u.id, u.full_name, u.email;
GO

PRINT '=== PART 3 COMPLETE: View librarian_user_status created ===';


-- =============================================================
-- PART 4: VERIFICATION QUERIES
-- =============================================================

PRINT '';
PRINT '=== VERIFICATION: Current users ===';
SELECT id, full_name, email, role, is_active, created_at
FROM [User]
ORDER BY id;

PRINT '';
PRINT '=== VERIFICATION: Librarian view ===';
SELECT * FROM librarian_user_status;

PRINT '';
PRINT '=== SCRIPT COMPLETED SUCCESSFULLY ===';
GO
