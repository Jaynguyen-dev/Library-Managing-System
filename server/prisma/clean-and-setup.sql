-- =============================================================
-- SQL SERVER (SSMS) SCRIPT
-- Library Management System — User Cleanup & Setup
-- =============================================================
-- Instructions: Run this entire script in SSMS in one execution.
-- =============================================================

-- =============================================================
-- PART 1: DELETE ALL USERS
-- Must delete child records first due to FK constraints.
-- =============================================================

BEGIN TRANSACTION;

-- 1. Delete notifications
DELETE FROM Notification;

-- 2. Delete fine payments
DELETE FROM FinePayment;

-- 3. Delete wallet transactions
DELETE FROM WalletTransaction;

-- 4. Delete wallets
DELETE FROM Wallet;

-- 5. Delete reservations
DELETE FROM Reservation;

-- 6. Delete fines
DELETE FROM Fine;

-- 7. Delete borrow items
DELETE FROM BorrowItem;

-- 8. Delete borrow records
DELETE FROM BorrowRecord;

-- 9. Finally, delete all users
DELETE FROM [User];

COMMIT TRANSACTION;

PRINT '=== PART 1 COMPLETE: All existing users deleted ===';


-- =============================================================
-- PART 2: INSERT new accounts
-- =============================================================

-- Insert Hoàng Nguyễn (user)
INSERT INTO [User] (full_name, email, password_hash, role, is_active, created_at)
VALUES (
  N'Hoàng Nguyễn',
  N'nvhoang050506@demo.com',
  N'$2b$10$Z9/stv9FabX.RkgOz7nrFui13SEE/PMTuhWaLYNyXZNzoHXHACFmG',
  N'user',
  1,
  GETDATE()
);

PRINT 'Inserted: Hoàng Nguyễn (nvhoang050506@demo.com / hoang123)';

-- Insert Thanh Như (user)
INSERT INTO [User] (full_name, email, password_hash, role, is_active, created_at)
VALUES (
  N'Thanh Như',
  N'ktnhu2006@demo.com',
  N'$2b$10$MtrPBCiBj4ZoCNEe.Wt5S..vZxHx3wsE5V.XIRIXNu/3BevEzCYwC',
  N'user',
  1,
  GETDATE()
);

PRINT 'Inserted: Thanh Như (ktnhu2006@demo.com / nhu123)';

-- Insert Librarian
INSERT INTO [User] (full_name, email, password_hash, role, is_active, created_at)
VALUES (
  N'Librarian',
  N'librarian@demo.com',
  N'$2b$10$mtXXvVqMC.UgiTSaYof6beQjoVuf4iBvSHWoMINBqtKrSEDGvuR9y',
  N'librarian',
  1,
  GETDATE()
);

PRINT 'Inserted: Librarian (librarian@demo.com / librarian123)';

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
