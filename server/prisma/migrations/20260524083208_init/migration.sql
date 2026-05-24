BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [full_name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password_hash] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'student',
    [is_active] BIT NOT NULL CONSTRAINT [User_is_active_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [User_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Book] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [author] NVARCHAR(1000) NOT NULL,
    [isbn] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [total_quantity] INT NOT NULL CONSTRAINT [Book_total_quantity_df] DEFAULT 1,
    [available_quantity] INT NOT NULL CONSTRAINT [Book_available_quantity_df] DEFAULT 1,
    [is_deleted] BIT NOT NULL CONSTRAINT [Book_is_deleted_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Book_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [Book_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Book_isbn_key] UNIQUE NONCLUSTERED ([isbn])
);

-- CreateTable
CREATE TABLE [dbo].[BookMetadata] (
    [id] INT NOT NULL IDENTITY(1,1),
    [book_id] INT NOT NULL,
    [cover_image_url] NVARCHAR(1000),
    [description] NTEXT,
    [publisher] NVARCHAR(1000),
    [publish_year] INT,
    [language] NVARCHAR(1000) CONSTRAINT [BookMetadata_language_df] DEFAULT 'vi',
    [subjects] NVARCHAR(1000),
    [page_count] INT,
    [rating] FLOAT(53),
    [source_url] NVARCHAR(1000),
    [crawled_at] DATETIME2,
    CONSTRAINT [BookMetadata_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [BookMetadata_book_id_key] UNIQUE NONCLUSTERED ([book_id])
);

-- CreateTable
CREATE TABLE [dbo].[BorrowRecord] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [borrow_date] DATETIME2 NOT NULL CONSTRAINT [BorrowRecord_borrow_date_df] DEFAULT CURRENT_TIMESTAMP,
    [due_date] DATETIME2 NOT NULL,
    [return_date] DATETIME2,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [BorrowRecord_status_df] DEFAULT 'active',
    CONSTRAINT [BorrowRecord_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[BorrowItem] (
    [id] INT NOT NULL IDENTITY(1,1),
    [borrow_record_id] INT NOT NULL,
    [book_id] INT NOT NULL,
    [quantity] INT NOT NULL CONSTRAINT [BorrowItem_quantity_df] DEFAULT 1,
    CONSTRAINT [BorrowItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Fine] (
    [id] INT NOT NULL IDENTITY(1,1),
    [borrow_record_id] INT NOT NULL,
    [user_id] INT NOT NULL,
    [amount] INT NOT NULL,
    [reason] NVARCHAR(1000) NOT NULL CONSTRAINT [Fine_reason_df] DEFAULT 'Overdue return',
    [is_paid] BIT NOT NULL CONSTRAINT [Fine_is_paid_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Fine_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Fine_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CrawlLog] (
    [id] INT NOT NULL IDENTITY(1,1),
    [job_type] NVARCHAR(1000) NOT NULL,
    [isbn] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [CrawlLog_status_df] DEFAULT 'pending',
    [source] NVARCHAR(1000),
    [books_found] INT NOT NULL CONSTRAINT [CrawlLog_books_found_df] DEFAULT 0,
    [books_updated] INT NOT NULL CONSTRAINT [CrawlLog_books_updated_df] DEFAULT 0,
    [error_msg] NVARCHAR(1000),
    [started_at] DATETIME2 NOT NULL CONSTRAINT [CrawlLog_started_at_df] DEFAULT CURRENT_TIMESTAMP,
    [finished_at] DATETIME2,
    CONSTRAINT [CrawlLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Book_title_idx] ON [dbo].[Book]([title]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Book_is_deleted_idx] ON [dbo].[Book]([is_deleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Book_category_idx] ON [dbo].[Book]([category]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [BorrowRecord_user_id_idx] ON [dbo].[BorrowRecord]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [BorrowRecord_status_idx] ON [dbo].[BorrowRecord]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [BorrowRecord_due_date_idx] ON [dbo].[BorrowRecord]([due_date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Fine_user_id_idx] ON [dbo].[Fine]([user_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Fine_is_paid_idx] ON [dbo].[Fine]([is_paid]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CrawlLog_status_idx] ON [dbo].[CrawlLog]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CrawlLog_started_at_idx] ON [dbo].[CrawlLog]([started_at]);

-- AddForeignKey
ALTER TABLE [dbo].[BookMetadata] ADD CONSTRAINT [BookMetadata_book_id_fkey] FOREIGN KEY ([book_id]) REFERENCES [dbo].[Book]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[BorrowRecord] ADD CONSTRAINT [BorrowRecord_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[BorrowItem] ADD CONSTRAINT [BorrowItem_borrow_record_id_fkey] FOREIGN KEY ([borrow_record_id]) REFERENCES [dbo].[BorrowRecord]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[BorrowItem] ADD CONSTRAINT [BorrowItem_book_id_fkey] FOREIGN KEY ([book_id]) REFERENCES [dbo].[Book]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Fine] ADD CONSTRAINT [Fine_borrow_record_id_fkey] FOREIGN KEY ([borrow_record_id]) REFERENCES [dbo].[BorrowRecord]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Fine] ADD CONSTRAINT [Fine_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
