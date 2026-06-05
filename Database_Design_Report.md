# BÁO CÁO THIẾT KẾ CƠ SỞ DỮ LIỆU

## HỆ THỐNG QUẢN LÝ THƯ VIỆN (LIBRARY MANAGEMENT SYSTEM)

---

| | |
|---|---|
| **Môn học** | SE104 — Nhập môn Công nghệ Phần mềm |
| **Giảng viên** | Khoa Công nghệ Phần mềm — Trường Đại học Công nghệ Thông tin |
| **Nhóm thực hiện** | Nhóm 5 thành viên (T1–T5) |
| **Ngày báo cáo** | Tháng 05/2026 |
| **Công nghệ** | Node.js / Express / React / Prisma / Microsoft SQL Server |

---

## MỤC LỤC

1. Giới thiệu hệ thống
2. Tổng quan thiết kế cơ sở dữ liệu
3. Sơ đồ cơ sở dữ liệu (ERD)
4. Phân tích chi tiết từng bảng
    - 4.1. Bảng User
    - 4.2. Bảng Book
    - 4.3. Bảng BookMetadata
    - 4.4. Bảng BorrowRecord
    - 4.5. Bảng BorrowItem
    - 4.6. Bảng Fine
    - 4.7. Bảng FinePayment
    - 4.8. Bảng Wallet
    - 4.9. Bảng WalletTransaction
    - 4.10. Bảng Notification
    - 4.11. Bảng Reservation
    - 4.12. Bảng CrawlLog
5. Phân tích các mối quan hệ giữa bảng
6. Chuẩn hóa dữ liệu (Normalization)
7. Ràng buộc dữ liệu và tính toàn vẹn
8. Luồng dữ liệu nghiệp vụ
9. Phân tích hiệu năng cơ sở dữ liệu
10. Đánh giá thiết kế cơ sở dữ liệu
11. Kết luận

---

## 1. GIỚI THIỆU HỆ THỐNG

### 1.1. Mục đích của hệ thống

Hệ thống Quản lý Thư viện (Library Management System — LMS) là một ứng dụng web được xây dựng nhằm số hóa các quy trình nghiệp vụ cốt lõi của một thư viện quy mô nhỏ. Hệ thống cho phép quản lý tài khoản người dùng với phân quyền dựa trên vai trò, quản lý danh mục sách, thực hiện các giao dịch mượn/trả sách, tính tiền phạt tự động và cung cấp bảng điều khiển tổng quan cho thủ thư và quản trị viên.

### 1.2. Chức năng chính

| ID | Chức năng | Mô tả | Người dùng |
|---|---|---|---|
| FR01 | Đăng ký tài khoản | Tạo tài khoản với họ tên, email, mật khẩu | Sinh viên |
| FR02 | Đăng nhập | Xác thực email/mật khẩu, trả về JWT | Tất cả |
| FR03 | Quản lý sách | Thêm, xem, sửa, xóa mềm, tìm kiếm sách | Thủ thư, Admin |
| FR04 | Quản lý người dùng | Xem, thêm, sửa, khóa/mở khóa tài khoản | Admin |
| FR05 | Tạo phiếu mượn | Chọn người mượn + sách khả dụng, đặt hạn trả | Thủ thư |
| FR06 | Trả sách | Xác nhận trả, cập nhật trạng thái | Thủ thư |
| FR07 | Tính tiền phạt | Tự động tính phạt = số ngày quá hạn × 2,000 VND/ngày | Hệ thống |
| FR08 | Xem lịch sử mượn | Sinh viên xem lịch sử mượn và tiền phạt | Sinh viên |
| FR09 | Dashboard | Thống kê tổng quan: sách, người dùng, mượn, quá hạn, phí phạt | Admin, Thủ thư |
| FR10 | Ví điện tử | Nạp tiền, thanh toán phạt trực tuyến | Sinh viên |
| FR11 | Đặt trước sách | Đặt trước sách khi hết khả dụng, xếp hàng chờ | Sinh viên |
| FR12 | Thông báo | Nhận thông báo về hạn trả, quá hạn, phạt | Sinh viên |
| FR13 | Crawl metadata | Tự động lấy thông tin sách từ Open Library, Google Books | Thủ thư |

### 1.3. Vai trò của cơ sở dữ liệu trong hệ thống

Cơ sở dữ liệu là thành phần trung tâm của hệ thống, chịu trách nhiệm lưu trữ toàn bộ trạng thái của ứng dụng bao gồm:

- **Dữ liệu người dùng**: tài khoản, vai trò, trạng thái hoạt động
- **Dữ liệu danh mục**: sách, thông tin mở rộng (metadata), tình trạng khả dụng
- **Dữ liệu giao dịch**: phiếu mượn, chi tiết mượn, lịch sử trả
- **Dữ liệu tài chính**: tiền phạt, ví điện tử, giao dịch thanh toán
- **Dữ liệu đặt trước**: hàng chờ sách, trạng thái thông báo
- **Dữ liệu nhật ký**: log crawl sách, thông báo hệ thống

### 1.4. Kiến trúc tổng thể

Hệ thống sử dụng kiến trúc monolithic ba tầng (three-tier monolithic):

```
[Browser / React SPA]  ──REST/JSON──>  [Express.js API Server]  ──Prisma ORM──>  [Microsoft SQL Server]
```

- **Tầng Presentation**: React 18 + Vite + TailwindCSS — giao diện người dùng
- **Tầng Application**: Express.js — routes, controllers, services, middlewares
- **Tầng Data Access**: Prisma ORM — ánh xạ model JavaScript sang bảng SQL
- **Tầng Database**: Microsoft SQL Server — lưu trữ dữ liệu quan hệ

### 1.5. Công nghệ cơ sở dữ liệu

**Lựa chọn: Microsoft SQL Server (MSSQL)**

| Tiêu chí | Đánh giá |
|---|---|
| **Loại CSDL** | Quan hệ (Relational) — SQL Server |
| **ORM** | Prisma 6.x |
| **Kết nối** | `sqlserver://...` qua Prisma driver |

**Lý do lựa chọn:**

1. **Tính phù hợp với môi trường học thuật**: SQL Server được giảng dạy rộng rãi trong các trường đại học, đặc biệt trong môi trường Windows, giúp sinh viên dễ dàng tiếp cận và triển khai.
2. **Tính toàn vẹn dữ liệu cao**: Hỗ trợ đầy đủ các ràng buộc (PK, FK, UNIQUE, CHECK), transaction ACID, isolation level — phù hợp với nghiệp vụ thư viện yêu cầu tính nhất quán cao (ví dụ: cập nhật số lượng sách khả dụng trong transaction mượn/trả).
3. **Hỗ trợ tốt qua Prisma ORM**: Prisma cung cấp type-safe client, migration tự động, và hỗ trợ chính thức cho SQL Server.
4. **Quen thuộc với nhóm phát triển**: Giúp giảm thời gian học tập và tăng tốc độ phát triển trong vòng 2 tuần.

**Ưu điểm:**
- Hỗ trợ transaction với các isolation level mạnh (Serializable được sử dụng trong borrow/return)
- Index clustering và non-clustering linh hoạt
- Khả năng mở rộng đọc nhờ Read Replica
- Tích hợp tốt với hệ sinh thái Windows/.NET

**Hạn chế:**
- Chi phí bản quyền cho môi trường production (có thể dùng SQL Server Express miễn phí)
- Tiêu tốn nhiều bộ nhớ hơn so với SQLite hoặc PostgreSQL ở quy mô nhỏ
- Không hỗ trợ FULLTEXT search trong phiên bản Express (hạn chế tìm kiếm nâng cao)

---

## 2. TỔNG QUAN THIẾT KẾ CƠ SỞ DỮ LIỆU

### 2.1. Mô hình dữ liệu tổng thể

Hệ thống gồm **12 bảng** được tổ chức thành 5 nhóm chính:

| Nhóm | Bảng | Mục đích |
|---|---|---|
| **Người dùng** | User, Wallet | Tài khoản và ví điện tử |
| **Danh mục sách** | Book, BookMetadata | Sách và thông tin mở rộng |
| **Giao dịch mượn/trả** | BorrowRecord, BorrowItem, Fine, FinePayment | Quy trình mượn, trả và phạt |
| **Đặt trước & Thông báo** | Reservation, Notification | Hàng chờ và thông báo |
| **Nhật ký hệ thống** | CrawlLog | Vết crawl dữ liệu |

### 2.2. Các nguyên tắc thiết kế được áp dụng

1. **Third Normal Form (3NF)**: Hầu hết các bảng đạt chuẩn 3NF, giảm thiểu dư thừa dữ liệu.
2. **Chuẩn hóa có chọn lọc**: Một số trường được denormalize có chủ đích để tối ưu truy vấn (ví dụ: `user_id` trong bảng `Fine`).
3. **Soft-delete**: Sách sử dụng cờ `is_deleted` thay vì xóa vật lý, bảo toàn toàn vẹn tham chiếu lịch sử.
4. **Transaction isolation**: Sử dụng `Serializable` isolation level cho các giao dịch quan trọng (mượn/trả) để tránh race condition.
5. **Index chiến lược**: Đánh index trên các cột thường xuyên truy vấn và filter.
6. **Audit trail**: Ghi lại lịch sử các tác vụ nền (crawl) qua bảng `CrawlLog`.

### 2.3. Luồng dữ liệu giữa các thành phần

```
Người dùng (User)
  │
  ├── Mượn sách ──> BorrowRecord (đầu) ──> BorrowItem (chi tiết) ──> Book (giảm available)
  │                     │
  │                     └──> Quá hạn? ──> Fine (tạo phạt)
  │                                             │
  │                                             └──> Wallet (thanh toán) ──> WalletTransaction
  │                                                                        ──> FinePayment
  │
  ├── Sách hết? ──> Reservation (xếp hàng chờ)
  │                     │
  │                     └──> Sách được trả? ──> Thông báo (Notification)
  │
  ├── Thanh toán ──> Wallet (ví) ──> WalletTransaction (lịch sử)
  │
  └── Nhận thông báo ──> Notification

Sách (Book) ──> BookMetadata (thông tin mở rộng, crawl từ Internet)

CrawlLog (ghi nhật ký mỗi lần crawl)
```

---

## 3. SƠ ĐỒ CƠ SỞ DỮ LIỆU (ERD)

### 3.1. Sơ đồ tổng thể (Full ERD)

![Full ERD Diagram](erd_full.png)

*Hình 3.1: Sơ đồ thực thể - quan hệ tổng thể của hệ thống Quản lý Thư viện*

### 3.2. Sơ đồ nghiệp vụ mượn/trả (Core Business Flow)

![Core Business ERD](erd_core_business.png)

*Hình 3.2: Sơ đồ ERD cho luồng nghiệp vụ mượn sách, trả sách và xử lý phạt*

### 3.3. Sơ đồ đặt trước và thông báo (Reservation & Notification)

![Reservation ERD](erd_reservation.png)

*Hình 3.3: Sơ đồ ERD cho luồng đặt trước sách và thông báo*

### 3.4. Sơ đồ ví điện tử và thanh toán (Wallet & Payment)

![Wallet ERD](erd_wallet.png)

*Hình 3.4: Sơ đồ ERD cho luồng ví điện tử và thanh toán phạt*

### 3.5. Ký hiệu sử dụng trong sơ đồ

| Ký hiệu | Ý nghĩa |
|---|---|
| PK | Primary Key — Khóa chính |
| FK | Foreign Key — Khóa ngoại |
| UK | Unique Key — Khóa duy nhất |
| `||--o{` | One-to-Many (1:N) — Một bản ghi bên trái tương ứng nhiều bản ghi bên phải |
| `||--||` | One-to-One (1:1) — Một bản ghi bên trái tương ứng một bản ghi bên phải |

### 3.6. Phân tích các mối quan hệ chính

| Quan hệ | Bảng A | Bảng B | Kiểu | Ý nghĩa nghiệp vụ |
|---|---|---|---|---|
| User → BorrowRecord | User (1) | BorrowRecord (N) | 1:N | Một người dùng có thể mượn nhiều sách, mỗi phiếu mượn thuộc về một người dùng |
| User → Fine | User (1) | Fine (N) | 1:N | Một người dùng có thể bị nhiều khoản phạt |
| User → Wallet | User (1) | Wallet (1) | 1:1 | Mỗi người dùng tối đa một ví điện tử |
| User → Reservation | User (1) | Reservation (N) | 1:N | Một người dùng có thể đặt trước nhiều sách |
| User → Notification | User (1) | Notification (N) | 1:N | Một người dùng có thể nhận nhiều thông báo |
| BorrowRecord → BorrowItem | BorrowRecord (1) | BorrowItem (N) | 1:N | Một phiếu mượn có thể chứa nhiều đầu sách |
| BorrowRecord → Fine | BorrowRecord (1) | Fine (N) | 1:N | Một phiếu mượn có thể bị phạt (nếu quá hạn) |
| Book → BorrowItem | Book (1) | BorrowItem (N) | 1:N | Một đầu sách có thể xuất hiện trong nhiều phiếu mượn |
| Book → BookMetadata | Book (1) | BookMetadata (1) | 1:1 | Mỗi sách có tối đa một bản ghi metadata mở rộng |
| Book → Reservation | Book (1) | Reservation (N) | 1:N | Một đầu sách có thể có nhiều lượt đặt trước |
| Wallet → WalletTransaction | Wallet (1) | WalletTransaction (N) | 1:N | Một ví có nhiều giao dịch |
| Wallet → FinePayment | Wallet (1) | FinePayment (N) | 1:N | Một ví có thể thanh toán nhiều khoản phạt |
| Fine → FinePayment | Fine (1) | FinePayment (N) | 1:N | Một khoản phạt có thể được thanh toán nhiều lần (từng phần) |

### 3.6. Giải thích các quyết định thiết kế quan hệ

**User → Wallet (1:1):**
Mỗi người dùng chỉ có một ví điện tử duy nhất. Thiết kế này đơn giản hóa quy trình thanh toán và đảm bảo mỗi người dùng chỉ có một số dư duy nhất cần quản lý.

**BorrowRecord ↔ Book (N:N qua bảng trung gian BorrowItem):**
Đây là quan hệ nhiều-nhiều giữa phiếu mượn và sách. Thay vì dùng bảng trung gian đơn thuần, chúng ta sử dụng `BorrowItem` với trường `quantity` để hỗ trợ mượn nhiều bản sao của cùng một đầu sách trong một lần mượn.

**Fine chứa user_id (denormalization):**
Bảng `Fine` chứa cả `borrow_record_id` và `user_id` mặc dù có thể lấy `user_id` từ `BorrowRecord`. Đây là một denormalization có chủ đích nhằm:
- Tăng tốc truy vấn dashboard tổng hợp tiền phạt theo người dùng
- Giảm số lượng JOIN cần thiết khi hiển thị danh sách phạt
- Cho phép truy vấn phạt độc lập với phiếu mượn

**Book có reserved_for_user_id:**
Trường này cho phép khóa sách cho một người dùng cụ thể khi họ được thông báo sách đã có sẵn (từ hàng chờ đặt trước). Điều này ngăn người dùng khác mượn sách trước trong thời gian chờ xác nhận (48 giờ).

---

## 4. PHÂN TÍCH CHI TIẾT TỪNG BẢNG

### 4.1. Bảng User

#### Chức năng

Bảng `User` là bảng trung tâm của hệ thống, lưu trữ thông tin tất cả tài khoản người dùng bao gồm sinh viên (student/user), thủ thư (librarian) và quản trị viên (admin). Bảng này đóng vai trò là điểm xác thực và phân quyền cho toàn bộ hệ thống.

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã người dùng duy nhất |
| full_name | NVARCHAR(1000) | NOT NULL | Họ và tên đầy đủ |
| email | NVARCHAR(1000) | UNIQUE, NOT NULL | Địa chỉ email (dùng để đăng nhập) |
| password_hash | NVARCHAR(1000) | NOT NULL | Mật khẩu đã được băm bằng bcrypt |
| role | NVARCHAR(1000) | DEFAULT 'student', NOT NULL | Vai trò: 'student' | 'librarian' | 'admin' |
| is_active | BIT | DEFAULT 1, NOT NULL | Trạng thái hoạt động (1: active, 0: locked) |
| created_at | DATETIME2 | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Thời điểm tạo tài khoản |

#### Phân tích thiết kế

**Tại sao cần bảng này?**
Bảng `User` là nền tảng của toàn bộ hệ thống phân quyền. Không có bảng này, hệ thống không thể xác thực người dùng, phân biệt vai trò, hay thiết lập mối quan hệ với các bảng nghiệp vụ khác (mượn sách, phạt, ví...).

**Lý do tồn tại của từng trường quan trọng:**
- **password_hash**: Lưu hash bcrypt thay vì plaintext — đây là yêu cầu bảo mật bắt buộc. Bcrypt với cost factor 10 đảm bảo an toàn ngay cả khi database bị lộ.
- **role**: Phân quyền dựa trên string đơn giản thay vì bảng roles riêng biệt — phù hợp với quy mô nhỏ (3 vai trò). Nếu hệ thống mở rộng với nhiều quyền chi tiết hơn, nên tách thành bảng `Role` và `Permission`.
- **is_active**: Cho phép admin khóa/mở khóa tài khoản mà không cần xóa — một hình thức soft-delete cho người dùng.
- **email được đánh UNIQUE index**: Đảm bảo mỗi email chỉ được đăng ký một lần, đồng thời tối ưu truy vấn login (tìm user bằng email).

#### Quan hệ với các bảng khác

| Bảng tham chiếu đến User | Kiểu | Ý nghĩa |
|---|---|---|
| BorrowRecord.user_id → User.id | 1:N | Người dùng có nhiều phiếu mượn |
| Fine.user_id → User.id | 1:N | Người dùng có nhiều khoản phạt |
| Wallet.user_id → User.id | 1:1 | Mỗi người dùng có một ví |
| Reservation.user_id → User.id | 1:N | Người dùng có nhiều lượt đặt trước |
| Notification.user_id → User.id | 1:N | Người dùng nhận nhiều thông báo |

#### Ví dụ dữ liệu

| id | full_name | email | password_hash | role | is_active | created_at |
|---|---|---|---|---|---|---|
| 1 | Hoàng Nguyễn | nvhoang050506@demo.com | $2b$10$Z9/...FmG | student | 1 | 2026-05-24 08:00:00 |
| 2 | Thanh Như | ktnhu2006@demo.com | $2b$10$Mtr...YwC | student | 1 | 2026-05-24 08:00:00 |
| 3 | Librarian | librarian@demo.com | $2b$10$mtX...9y | librarian | 1 | 2026-05-24 08:00:00 |

---

### 4.2. Bảng Book

#### Chức năng

Bảng `Book` lưu trữ danh mục sách của thư viện, bao gồm thông tin cơ bản (tiêu đề, tác giả, ISBN) và thông tin quản lý kho (số lượng tổng, số lượng khả dụng). Đây là bảng trung tâm cho chức năng tra cứu và mượn sách.

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã sách duy nhất |
| title | NVARCHAR(1000) | NOT NULL, INDEX | Tiêu đề sách |
| author | NVARCHAR(1000) | NOT NULL | Tác giả |
| isbn | NVARCHAR(1000) | UNIQUE, NOT NULL | Mã ISBN (chuẩn quốc tế) |
| category | NVARCHAR(1000) | NOT NULL, INDEX | Thể loại sách |
| total_quantity | INT | DEFAULT 1, NOT NULL | Tổng số bản sao trong thư viện |
| available_quantity | INT | DEFAULT 1, NOT NULL | Số bản sao hiện có sẵn để mượn |
| reserved_for_user_id | INT | NULLABLE | Người dùng được ưu tiên mượn (từ đặt trước) |
| reservation_expires_at | DATETIME2 | NULLABLE | Thời điểm hết hạn ưu tiên mượn |
| is_deleted | BIT | DEFAULT 0, NOT NULL, INDEX | Cờ xóa mềm |
| created_at | DATETIME2 | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Thời điểm tạo |
| updated_at | DATETIME2 | NOT NULL | Thời điểm cập nhật (tự động) |

#### Phân tích thiết kế

**Soft-delete (is_deleted):**
Sách không bị xóa vật lý khi thủ thư "xóa" — thay vào đó, cờ `is_deleted` được đặt thành `true`. Quyết định này bảo vệ:
- Tính toàn vẹn tham chiếu với lịch sử mượn (BorrowItem không bị mất dữ liệu)
- Khả năng khôi phục sách nếu xóa nhầm
- CrawlLog vẫn giữ được thông tin sách đã crawl

**available_quantity và total_quantity:**
Đây là hai trường riêng biệt phục vụ các mục đích khác nhau:
- `total_quantity`: Số bản sao thư viện sở hữu — không thay đổi trừ khi thủ thư cập nhật
- `available_quantity`: Số bản đang có trên kệ — giảm khi mượn, tăng khi trả

Thiết kế này cho phép:
- Kiểm tra nhanh tình trạng khả dụng mà không cần JOIN hay COUNT phức tạp
- Cho người dùng biết tổng số bản sao và số còn trống

**reserved_for_user_id và reservation_expires_at:**
Hai trường này hỗ trợ cơ chế đặt trước sách. Khi sách được trả và có người đang chờ trong hàng đợi reservation, sách sẽ được "khóa" cho người đó trong 48 giờ. Người dùng khác không thể mượn sách trong thời gian này.

#### Quan hệ với các bảng khác

| Bảng tham chiếu đến Book | Kiểu | Ý nghĩa |
|---|---|---|
| BorrowItem.book_id → Book.id | 1:N | Một sách xuất hiện trong nhiều phiếu mượn |
| BookMetadata.book_id → Book.id | 1:1 | Mỗi sách có một bản ghi metadata |
| Reservation.book_id → Book.id | 1:N | Một sách có nhiều lượt đặt trước |

#### Ví dụ dữ liệu

| id | title | author | isbn | category | total_qty | avail_qty | is_deleted |
|---|---|---|---|---|---|---|---|
| 1 | Clean Code | Robert C. Martin | 9780132350884 | Engineering | 3 | 2 | 0 |
| 2 | The Pragmatic Programmer | Hunt & Thomas | 9780135957059 | Engineering | 2 | 2 | 0 |
| 3 | Design Patterns | Gang of Four | 9780201633610 | Engineering | 2 | 0 | 0 |

---

### 4.3. Bảng BookMetadata

#### Chức năng

Bảng `BookMetadata` lưu trữ thông tin mở rộng của sách được tự động thu thập từ các nguồn dữ liệu bên ngoài (Open Library, Google Books). Bảng này tách biệt khỏi bảng `Book` để giữ cho bảng chính gọn nhẹ và dễ bảo trì.

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã metadata duy nhất |
| book_id | INT | UNIQUE, NOT NULL, FK → Book.id | Mã sách |
| cover_image_url | NVARCHAR(1000) | NULLABLE | URL ảnh bìa sách |
| description | NTEXT | NULLABLE | Mô tả nội dung sách |
| publisher | NVARCHAR(1000) | NULLABLE | Nhà xuất bản |
| publish_year | INT | NULLABLE | Năm xuất bản |
| language | NVARCHAR(1000) | DEFAULT 'vi', NULLABLE | Ngôn ngữ |
| subjects | NVARCHAR(1000) | NULLABLE | Chủ đề (JSON array dạng string) |
| page_count | INT | NULLABLE | Số trang |
| rating | FLOAT(53) | NULLABLE | Đánh giá (từ Google Books) |
| source_url | NVARCHAR(1000) | NULLABLE | URL nguồn dữ liệu |
| crawled_at | DATETIME2 | NULLABLE | Thời điểm crawl dữ liệu |

#### Phân tích thiết kế

**Tách metadata khỏi bảng Book:**
Quyết định tách metadata thành bảng riêng xuất phát từ các lý do sau:
1. **Giảm kích thước hàng (row width)**: Bảng `Book` chứa các trường ngắn gọn, trong khi metadata có thể chứa mô tả dài (NTEXT) và URL ảnh.
2. **Tách biệt trách nhiệm**: Dữ liệu crawl từ bên ngoài có độ tin cậy thấp hơn dữ liệu do thủ thư nhập — việc tách riêng giúp dễ dàng cập nhật, xóa, hoặc bỏ qua dữ liệu crawl mà không ảnh hưởng đến thông tin gốc.
3. **Hiệu năng truy vấn**: Các truy vấn danh sách sách (cần title, author, available_quantity) không phải load các trường nặng như description.
4. **Crawl pipeline độc lập**: Hệ thống crawl có thể upsert metadata mà không lo can thiệp vào dữ liệu quản lý kho.

**Trường subjects dạng JSON string:**
Chủ đề được lưu dưới dạng JSON array (`["Fiction", "Drama"]`) trong `NVARCHAR(1000)` thay vì tạo bảng `Subject` riêng. Lý do:
- Đơn giản hóa cho quy mô nhỏ
- Không cần JOIN phức tạp khi hiển thị
- Crawl pipeline trả về dữ liệu dạng mảng, dễ lưu trực tiếp

Hạn chế: Không thể truy vấn SQL thuần theo chủ đề một cách hiệu quả (cần dùng LIKE hoặc JSON functions).

#### Quan hệ với các bảng khác

| Bảng tham chiếu | Kiểu | Ý nghĩa |
|---|---|---|
| BookMetadata.book_id → Book.id | 1:1 (phía Book có metadata) | Mỗi metadata thuộc về một sách duy nhất |

#### Ví dụ dữ liệu

| id | book_id | publisher | publish_year | language | page_count | rating |
|---|---|---|---|---|---|---|
| 1 | 1 | Prentice Hall | 2008 | en | 464 | 4.8 |
| 2 | 2 | Addison-Wesley | 2019 | en | 352 | 4.7 |

---

### 4.4. Bảng BorrowRecord

#### Chức năng

Bảng `BorrowRecord` lưu trữ thông tin phiếu mượn — đây là bảng "đầu" (header) của giao dịch mượn sách. Mỗi phiếu mượn ghi nhận người mượn, ngày mượn, hạn trả, ngày trả thực tế và trạng thái hiện tại.

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã phiếu mượn |
| user_id | INT | FK → User.id, NOT NULL, INDEX | Người mượn |
| borrow_date | DATETIME2 | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Ngày mượn |
| due_date | DATETIME2 | NOT NULL, INDEX | Hạn trả |
| return_date | DATETIME2 | NULLABLE | Ngày trả thực tế |
| return_requested_at | DATETIME2 | NULLABLE | Thời điểm yêu cầu trả |
| confirmed_by | INT | NULLABLE | Thủ thư xác nhận trả |
| status | NVARCHAR(1000) | DEFAULT 'active', NOT NULL, INDEX | Trạng thái |
| reminder_sent | BIT | DEFAULT 0, NOT NULL | Đã gửi nhắc nhở? |
| reminder_sent_at | DATETIME2 | NULLABLE | Thời điểm gửi nhắc nhở |

**Các giá trị status:**
| Giá trị | Ý nghĩa |
|---|---|
| active | Đang mượn (chưa trả) |
| return_pending | Sinh viên đã yêu cầu trả, chờ thủ thư xác nhận |
| returned | Đã trả |

#### Phân tích thiết kế

**Tách BorrowRecord và BorrowItem:**
Đây là mô hình header-detail (master-detail) chuẩn — một phiếu mượn có thể chứa nhiều sách (tối đa 3). Mô hình này giúp:
- Nhóm các sách mượn cùng lúc thành một giao dịch duy nhất
- Quản lý hạn trả chung cho tất cả sách trong phiếu
- Tính phạt theo phiếu mượn (dựa trên due_date chung)

**Quy trình hai bước khi trả sách (return_pending → returned):**
Sinh viên yêu cầu trả (request return), thủ thư xác nhận (confirm return). Quy trình này:
- Cho phép sinh viên chủ động yêu cầu trả từ tài khoản
- Cho thủ thư kiểm tra sách trước khi xác nhận
- Tạo audit trail rõ ràng (ai xác nhận, khi nào)

**reminder_sent:**
Đây là trạng thái được scheduler cập nhật khi gửi nhắc nhở sắp đến hạn. Dùng để tránh gửi nhắc nhở nhiều lần.

**Cascade rules:**
- `ON DELETE NO ACTION` — không cho phép xóa user nếu còn borrow record
- `ON UPDATE CASCADE` — cập nhật user_id nếu user thay đổi

#### Quan hệ với các bảng khác

| Bảng tham chiếu | Kiểu | Ý nghĩa |
|---|---|---|
| BorrowItem.borrow_record_id → BorrowRecord.id | 1:N | Một phiếu mượn có nhiều dòng sách |
| Fine.borrow_record_id → BorrowRecord.id | 1:N | Một phiếu mượn có thể bị phạt |

#### Ví dụ dữ liệu

| id | user_id | borrow_date | due_date | return_date | status |
|---|---|---|---|---|---|
| 1 | 1 | 2026-05-24 | 2026-06-23 | NULL | active |
| 2 | 2 | 2026-05-20 | 2026-06-19 | 2026-05-28 | returned |

---

### 4.5. Bảng BorrowItem

#### Chức năng

Bảng `BorrowItem` là bảng chi tiết (detail) của phiếu mượn, lưu từng đầu sách được mượn trong một phiếu. Đây là bảng trung gian giải quyết quan hệ nhiều-nhiều giữa `BorrowRecord` và `Book`.

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã dòng mượn |
| borrow_record_id | INT | FK → BorrowRecord.id, NOT NULL | Mã phiếu mượn |
| book_id | INT | FK → Book.id, NOT NULL | Mã sách |
| quantity | INT | DEFAULT 1, NOT NULL | Số bản sao mượn |

#### Phân tích thiết kế

**Trường quantity:**
Cho phép mượn nhiều bản sao của cùng một đầu sách trong cùng một phiếu. Đây là tình huống thực tế (ví dụ: thư viện có 3 bản "Clean Code" và sinh viên mượn 2 bản).

**Ý nghĩa của bảng BorrowItem:**
Nếu chỉ dùng một bảng `BorrowRecord` với các trường book_id, mỗi phiếu mượn chỉ có thể mượn một sách. Bảng `BorrowItem` cho phép linh hoạt trong nghiệp vụ mượn nhiều sách.

#### Quan hệ với các bảng khác

| Bảng tham chiếu | Kiểu | Ý nghĩa |
|---|---|---|
| BorrowItem.borrow_record_id → BorrowRecord.id | N:1 | Nhiều dòng thuộc về một phiếu mượn |
| BorrowItem.book_id → Book.id | N:1 | Nhiều dòng tham chiếu đến cùng một sách |

#### Ví dụ dữ liệu

| id | borrow_record_id | book_id | quantity |
|---|---|---|---|
| 1 | 1 | 1 | 1 |
| 2 | 1 | 3 | 2 |
| 3 | 2 | 2 | 1 |

---

### 4.6. Bảng Fine

#### Chức năng

Bảng `Fine` lưu trữ các khoản tiền phạt phát sinh khi người dùng trả sách quá hạn. Mỗi khoản phạt gắn với một phiếu mượn cụ thể và một người dùng cụ thể.

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã phạt |
| borrow_record_id | INT | FK → BorrowRecord.id, NOT NULL | Phiếu mượn vi phạm |
| user_id | INT | FK → User.id, NOT NULL, INDEX | Người bị phạt |
| amount | INT | NOT NULL | Số tiền phạt (VND) |
| reason | NVARCHAR(1000) | DEFAULT 'Overdue return', NOT NULL | Lý do phạt |
| is_paid | BIT | DEFAULT 0, NOT NULL, INDEX | Đã thanh toán? |
| paid_at | DATETIME2 | NULLABLE | Thời điểm thanh toán |
| paid_by | INT | NULLABLE | Người/ID thanh toán |
| payment_method | NVARCHAR(1000) | NULLABLE | Phương thức thanh toán |
| overdue_days | INT | NULLABLE | Số ngày quá hạn |
| created_at | DATETIME2 | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Thời điểm tạo phạt |

#### Phân tích thiết kế

**Denormalization user_id:**
Bảng `Fine` chứa `user_id` mặc dù có thể suy ra từ `BorrowRecord.user_id`. Lý do:
- Dashboard cần tổng hợp phạt theo người dùng — tránh JOIN qua BorrowRecord
- Truy vấn danh sách phạt (list fines) thường xuyên filter theo user_id
- Khi scheduler tự động tính phạt, việc có sẵn user_id giảm số truy vấn

**Auto-recalculate fine:**
Trong `fineService.js`, khi đọc danh sách phạt, hệ thống kiểm tra nếu fine chưa thanh toán và quá hạn, sẽ tính lại số tiền dựa trên ngày hiện tại. Điều này đảm bảo:
- Số tiền phạt luôn được cập nhật theo thời gian thực
- Người dùng thấy đúng số tiền cần thanh toán tại thời điểm xem
- Không cần cron job cập nhật liên tục

**Scheduler cập nhật định kỳ:**
Hàm `processOverdueFines` trong `schedulerService.js` chạy mỗi ngày lúc 0:00 để:
- Tạo phạt mới cho các phiếu mượn quá hạn chưa có phạt
- Cập nhật số tiền phạt cho các phiếu đã có phạt nhưng chưa thanh toán

#### Quan hệ với các bảng khác

| Bảng tham chiếu | Kiểu | Ý nghĩa |
|---|---|---|
| Fine.borrow_record_id → BorrowRecord.id | N:1 | Một phiếu mượn có thể bị nhiều phạt |
| Fine.user_id → User.id | N:1 | Một người dùng có thể có nhiều phạt |
| FinePayment.fine_id → Fine.id | 1:N | Một khoản phạt có thể thanh toán từng phần |

#### Ví dụ dữ liệu

| id | borrow_record_id | user_id | amount | reason | is_paid |
|---|---|---|---|---|---|
| 1 | 1 | 1 | 12000 | Overdue — 6 days late | 0 |
| 2 | 2 | 2 | 8000 | Overdue — 4 days late | 1 |

---

### 4.7. Bảng FinePayment

#### Chức năng

Bảng `FinePayment` lưu chi tiết từng lần thanh toán phạt từ ví điện tử. Cho phép theo dõi lịch sử đóng phạt và hỗ trợ thanh toán từng phần (một khoản phạt có thể được trả nhiều lần).

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã thanh toán |
| fine_id | INT | FK → Fine.id, NOT NULL, INDEX | Mã phạt |
| wallet_id | INT | FK → Wallet.id, NOT NULL, INDEX | Mã ví thanh toán |
| amount | INT | NOT NULL | Số tiền thanh toán |
| created_at | DATETIME2 | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Thời điểm thanh toán |

#### Phân tích thiết kế

**Hỗ trợ thanh toán từng phần:**
Một khoản phạt có thể được thanh toán nhiều lần (partial payment) — đặc biệt hữu ích khi:
- Hệ thống auto-deduct trích từng phần từ số dư ví
- Người dùng nạp tiền nhiều lần và hệ thống tự động trừ nợ dần
- Cần audit trail chi tiết cho mỗi lần thanh toán

**Index trên cả fine_id và wallet_id:**
Đánh index trên cả hai cột để tối ưu:
- Truy vấn lịch sử thanh toán theo fine_id
- Truy vấn tổng tiền đã thanh toán theo wallet_id

#### Quan hệ với các bảng khác

| Bảng tham chiếu | Kiểu | Ý nghĩa |
|---|---|---|
| FinePayment.fine_id → Fine.id | N:1 | Nhiều thanh toán cho một khoản phạt |
| FinePayment.wallet_id → Wallet.id | N:1 | Nhiều thanh toán từ một ví |

#### Ví dụ dữ liệu

| id | fine_id | wallet_id | amount |
|---|---|---|---|
| 1 | 2 | 1 | 5000 |
| 2 | 2 | 1 | 3000 |

---

### 4.8. Bảng Wallet

#### Chức năng

Bảng `Wallet` lưu trữ ví điện tử của người dùng — một tài khoản ảo cho phép nạp tiền và thanh toán tiền phạt trực tuyến mà không cần tiền mặt.

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã ví |
| user_id | INT | UNIQUE, FK → User.id, NOT NULL | Người sở hữu |
| balance | INT | DEFAULT 0, NOT NULL | Số dư hiện tại (VND) |
| created_at | DATETIME2 | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Ngày tạo |
| updated_at | DATETIME2 | NOT NULL | Ngày cập nhật |

#### Phân tích thiết kế

**Quan hệ 1:1 với User:**
Mỗi người dùng chỉ có một ví — đơn giản hóa quản lý và đảm bảo tính nhất quán.

**Số dư dùng INT (VND):**
Tiền tệ được lưu bằng số nguyên (VND) — tránh vấn đề floating-point, dễ tính toán và dễ hiểu. Số dư tối đa bị giới hạn ở mức 100 triệu VND (qua validation trong service).

**Auto-deduct từ scheduler:**
Hệ thống có cơ chế tự động trừ tiền phạt từ ví (nếu có đủ số dư) thông qua scheduler chạy lúc 2:30 hàng ngày (hàm `autoDeductFines`).

#### Quan hệ với các bảng khác

| Bảng tham chiếu | Kiểu | Ý nghĩa |
|---|---|---|
| Wallet.user_id → User.id | 1:1 | Một user có một ví |
| WalletTransaction.wallet_id → Wallet.id | 1:N | Một ví có nhiều giao dịch |
| FinePayment.wallet_id → Wallet.id | 1:N | Một ví thanh toán nhiều phạt |

#### Ví dụ dữ liệu

| id | user_id | balance |
|---|---|---|
| 1 | 1 | 100000 |
| 2 | 2 | 50000 |

---

### 4.9. Bảng WalletTransaction

#### Chức năng

Bảng `WalletTransaction` ghi lại tất cả các giao dịch liên quan đến ví điện tử — nạp tiền, trừ tiền thanh toán, hoàn tiền. Đây là bảng audit trail cho dòng tiền trong hệ thống.

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã giao dịch |
| wallet_id | INT | FK → Wallet.id, NOT NULL, INDEX | Ví thực hiện giao dịch |
| amount | INT | NOT NULL | Số tiền (dương hoặc âm) |
| balance_before | INT | NULLABLE | Số dư trước giao dịch |
| balance_after | INT | NULLABLE | Số dư sau giao dịch |
| type | NVARCHAR(1000) | NOT NULL, INDEX | Loại: 'topup', 'deduction', 'refund', 'fine_payment' |
| status | NVARCHAR(1000) | DEFAULT 'completed', NOT NULL | Trạng thái: 'pending', 'completed', 'failed' |
| payment_method | NVARCHAR(1000) | NULLABLE | Phương thức: 'visa', 'mastercard', 'momo', 'banking', 'system' |
| reference | NVARCHAR(1000) | NULLABLE | Tham chiếu đến đối tượng liên quan (fine ID, borrow ID) |
| description | NVARCHAR(1000) | NULLABLE | Mô tả chi tiết giao dịch |
| created_at | DATETIME2 | DEFAULT CURRENT_TIMESTAMP, NOT NULL, INDEX | Thời điểm giao dịch |

#### Phân tích thiết kế

**Balance tracking (balance_before, balance_after):**
Lưu số dư trước và sau giao dịch giúp:
- Dễ dàng kiểm tra tính nhất quán của số dư
- Hỗ trợ debug khi có sai lệch số dư
- Cung cấp thông tin chi tiết cho người dùng

**Type categorization:**
Phân loại giao dịch giúp:
- Lọc và hiển thị theo loại trên UI
- Thống kê doanh thu theo loại
- Dễ dàng mở rộng các loại giao dịch mới

**Reference field:**
Trường tham chiếu (reference) cho phép liên kết giao dịch với đối tượng nghiệp vụ cụ thể — ví dụ: `fine_1`, `borrow_5`. Điều này giúp trace ngược từ giao dịch đến nghiệp vụ gốc.

#### Ví dụ dữ liệu

| id | wallet_id | amount | balance_before | balance_after | type | payment_method | reference |
|---|---|---|---|---|---|---|---|
| 1 | 1 | 100000 | 0 | 100000 | topup | momo | NULL |
| 2 | 1 | -12000 | 100000 | 88000 | fine_payment | system | fine_1 |

---

### 4.10. Bảng Notification

#### Chức năng

Bảng `Notification` lưu trữ các thông báo gửi đến người dùng: nhắc nhở hạn trả, thông báo quá hạn, thông báo phạt, thông báo thanh toán, thông báo thông tin chung.

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã thông báo |
| user_id | INT | NOT NULL, INDEX | Người nhận |
| title | NVARCHAR(1000) | NOT NULL | Tiêu đề |
| message | NVARCHAR(1000) | NOT NULL | Nội dung |
| type | NVARCHAR(1000) | DEFAULT 'info', NOT NULL | Loại: 'reminder', 'overdue', 'fine', 'payment', 'info' |
| is_read | BIT | DEFAULT 0, NOT NULL, INDEX | Đã đọc? |
| reference | NVARCHAR(1000) | NULLABLE | Tham chiếu đến đối tượng |
| created_at | DATETIME2 | DEFAULT CURRENT_TIMESTAMP, NOT NULL, INDEX | Thời điểm tạo |

#### Phân tích thiết kế

**In-app notification (không email):**
Hệ thống sử dụng thông báo nội bộ thay vì email do:
- Đơn giản hóa kiến trúc (không cần SendGrid, SMTP)
- Thông báo được lưu trong database nên dễ dàng truy vấn và hiển thị
- Người dùng xem thông báo ngay trong ứng dụng

**Reference field:**
Cho phép liên kết thông báo với đối tượng cụ thể (borrow ID, fine ID, reservation ID) để UI có thể tạo link điều hướng trực tiếp.

**Index strategy:**
- user_id: lọc thông báo theo người dùng
- is_read: đếm số thông báo chưa đọc nhanh
- created_at: sắp xếp theo thời gian

#### Ví dụ dữ liệu

| id | user_id | title | message | type | is_read |
|---|---|---|---|---|---|
| 1 | 1 | Book Due Soon | Your borrowed book "Clean Code" is due in 3 days... | reminder | 0 |
| 2 | 1 | Overdue Book | "Design Patterns" is overdue by 2 days... | overdue | 0 |

---

### 4.11. Bảng Reservation

#### Chức năng

Bảng `Reservation` quản lý hàng đợi đặt trước sách. Khi sách không có sẵn (available_quantity = 0), sinh viên có thể đặt trước và được xếp vào hàng chờ. Khi sách được trả, người đầu tiên trong hàng được thông báo.

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã đặt trước |
| user_id | INT | FK → User.id, NOT NULL, INDEX | Người đặt |
| book_id | INT | FK → Book.id, NOT NULL, INDEX | Sách được đặt |
| status | NVARCHAR(1000) | DEFAULT 'waiting', NOT NULL, INDEX | Trạng thái |
| queue_position | INT | NULLABLE | Vị trí trong hàng chờ |
| reserved_at | DATETIME2 | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Thời điểm đặt |
| notified_at | DATETIME2 | NULLABLE | Thời điểm thông báo |
| expires_at | DATETIME2 | NULLABLE | Hạn sử dụng ưu tiên |
| completed_at | DATETIME2 | NULLABLE | Thời điểm hoàn thành |
| cancelled_at | DATETIME2 | NULLABLE | Thời điểm hủy |

**Các giá trị status:**
| Giá trị | Ý nghĩa |
|---|---|
| waiting | Đang chờ — sách chưa có sẵn |
| notified | Đã thông báo — sách đã có, đang chờ người dùng mượn trong 48h |
| expired | Hết hạn — người dùng không mượn trong 48h |
| completed | Hoàn thành — người dùng đã mượn sách |
| cancelled | Đã hủy — người dùng hủy đặt trước |

#### Phân tích thiết kế

**Cơ chế queue:**
Khi sách không có sẵn, người dùng được xếp vào hàng chờ. Vị trí được tính dựa trên thời gian đặt trước (`reserved_at`). Khi sách được trả:
1. Hệ thống kiểm tra hàng chờ (status = 'waiting' sắp xếp theo reserved_at)
2. Người đầu tiên được chuyển sang 'notified'
3. Sách được khóa cho người đó (48 giờ qua `reserved_for_user_id` trong Book)
4. Nếu hết 48 giờ mà không mượn, reservation chuyển 'expired' và chuyển sang người tiếp theo

**Không cần bảng trung gian:**
Reservation là quan hệ trực tiếp giữa User và Book với các trường trạng thái bổ sung. Không cần bảng trung gian vì mỗi user chỉ có một reservation active cho một book tại một thời điểm.

**Composite index (book_id, status):**
Được tạo để tối ưu truy vấn tìm người đầu tiên trong hàng chờ của một sách cụ thể:
```sql
WHERE book_id = ? AND status = 'waiting' ORDER BY reserved_at ASC
```

#### Ví dụ dữ liệu

| id | user_id | book_id | status | queue_position | reserved_at |
|---|---|---|---|---|---|
| 1 | 1 | 3 | waiting | 1 | 2026-05-24 10:00:00 |
| 2 | 2 | 3 | waiting | 2 | 2026-05-24 11:30:00 |

---

### 4.12. Bảng CrawlLog

#### Chức năng

Bảng `CrawlLog` ghi nhật ký tất cả các tác vụ crawl dữ liệu sách từ các nguồn bên ngoài (Open Library, Google Books). Bảng này độc lập với các bảng nghiệp vụ chính — có thể xóa, archive mà không ảnh hưởng đến hoạt động thư viện.

#### Cấu trúc bảng

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | INT | PK, IDENTITY(1,1), NOT NULL | Mã log |
| job_type | NVARCHAR(1000) | NOT NULL | Loại tác vụ ('isbn_lookup', 'batch_enrich', 'category_sync') |
| isbn | NVARCHAR(1000) | NULLABLE | ISBN đang crawl |
| status | NVARCHAR(1000) | DEFAULT 'pending', NOT NULL, INDEX | Trạng thái |
| source | NVARCHAR(1000) | NULLABLE | Nguồn dữ liệu ('open_library', 'google_books', 'multi') |
| books_found | INT | DEFAULT 0, NOT NULL | Số sách tìm thấy |
| books_updated | INT | DEFAULT 0, NOT NULL | Số sách được cập nhật |
| error_msg | NVARCHAR(1000) | NULLABLE | Thông báo lỗi (nếu thất bại) |
| started_at | DATETIME2 | DEFAULT CURRENT_TIMESTAMP, NOT NULL, INDEX | Thời điểm bắt đầu |
| finished_at | DATETIME2 | NULLABLE | Thời điểm kết thúc |

#### Phân tích thiết kế

**Bảng độc lập (standalone audit table):**
CrawlLog không có foreign key đến bảng nào — đây là bảng audit thuần túy. Lý do:
- Không ảnh hưởng đến hoạt động thư viện nếu bảng này bị xóa hoặc hư hỏng
- Dễ dàng truncate hoặc archive logs cũ
- Không làm chậm các truy vấn nghiệp vụ chính

**Các trạng thái:**
- pending: Chờ xử lý
- running: Đang crawl
- success: Hoàn thành
- failed: Thất bại

**Tách biệt source và job_type:**
- `job_type`: Mô tả loại tác vụ (tra ISBN, batch, đồng bộ danh mục)
- `source`: Ghi lại nguồn dữ liệu đã crawl (cho phép so sánh chất lượng giữa các nguồn)

#### Ví dụ dữ liệu

| id | job_type | isbn | status | source | books_found | books_updated | error_msg |
|---|---|---|---|---|---|---|---|
| 1 | isbn_lookup | 9780132350884 | success | multi | 1 | 1 | NULL |
| 2 | isbn_lookup | 9780000000000 | failed | multi | 0 | 0 | No data found |

---

## 5. PHÂN TÍCH CÁC MỐI QUAN HỆ GIỮA BẢNG

### 5.1. Quan hệ One-to-One

| Bảng A | Bảng B | Trường FK | Mục đích |
|---|---|---|---|
| User | Wallet | Wallet.user_id → User.id | Mỗi người dùng có một ví điện tử duy nhất |
| Book | BookMetadata | BookMetadata.book_id → Book.id | Mỗi sách có một bản ghi metadata mở rộng duy nhất |

**Phân tích:**

**User ↔ Wallet (1:1):**
Thiết kế 1:1 được chọn vì mỗi người dùng chỉ cần một ví để quản lý số dư và thanh toán phạt. Nếu cho phép nhiều ví, sẽ phát sinh độ phức tạp không cần thiết trong việc chọn ví nào để thanh toán. Trường `user_id` trong Wallet được đánh UNIQUE index để đảm bảo ràng buộc này ở mức database.

**Book ↔ BookMetadata (1:1):**
Quan hệ 1:1 cho phép tách dữ liệu "cốt lõi" (title, author, isbn, quantity) khỏi dữ liệu "mở rộng" (description, cover, publisher). Lợi ích:
- Bảng Book nhỏ gọn, truy vấn danh sách nhanh
- Metadata có thể được cập nhật độc lập (bởi crawl pipeline)
- Có thể lazy-load metadata chỉ khi cần (trang chi tiết sách)

### 5.2. Quan hệ One-to-Many

| Bảng cha (1) | Bảng con (N) | Trường FK | Ý nghĩa |
|---|---|---|---|
| User | BorrowRecord | BorrowRecord.user_id → User.id | Một người có thể mượn nhiều sách (nhiều phiếu) |
| User | Fine | Fine.user_id → User.id | Một người có thể bị nhiều khoản phạt |
| User | Reservation | Reservation.user_id → User.id | Một người có thể đặt trước nhiều sách |
| User | Notification | Notification.user_id → User.id | Một người có thể nhận nhiều thông báo |
| Book | BorrowItem | BorrowItem.book_id → Book.id | Một sách có thể xuất hiện trong nhiều phiếu mượn |
| Book | Reservation | Reservation.book_id → Book.id | Một sách có thể được nhiều người đặt trước |
| BorrowRecord | BorrowItem | BorrowItem.borrow_record_id → BorrowRecord.id | Một phiếu mượn có nhiều dòng sách |
| BorrowRecord | Fine | Fine.borrow_record_id → BorrowRecord.id | Một phiếu mượn có thể bị phạt |
| Wallet | WalletTransaction | WalletTransaction.wallet_id → Wallet.id | Một ví có nhiều giao dịch |
| Wallet | FinePayment | FinePayment.wallet_id → Wallet.id | Một ví thanh toán nhiều khoản phạt |
| Fine | FinePayment | FinePayment.fine_id → Fine.id | Một khoản phạt được thanh toán nhiều lần |

**Phân tích tác động:**

**Tác động đến truy vấn:**
- Các quan hệ 1:N yêu cầu JOIN khi truy vấn dữ liệu tổng hợp (ví dụ: lấy thông tin người mượn kèm danh sách phiếu mượn)
- Được tối ưu bằng index trên foreign keys của bảng con

**Tác động đến hiệu năng:**
- Khi số lượng bản ghi trong bảng con lớn (ví dụ: hàng nghìn giao dịch cho một ví), truy vấn JOIN có thể chậm
- Giải pháp: pagination, index, hoặc denormalization có chọn lọc

**Tính toàn vẹn dữ liệu:**
- Foreign key constraints đảm bảo mỗi bản ghi con luôn tham chiếu đến bản ghi cha tồn tại
- `ON DELETE NO ACTION` ngăn xóa bản ghi cha nếu còn bản ghi con (bảo vệ dữ liệu lịch sử)
- `ON UPDATE CASCADE` cho phép cập nhật ID cha nếu cần

### 5.3. Quan hệ Many-to-Many (thông qua bảng trung gian)

Hệ thống có một quan hệ N:N chính: **BorrowRecord ↔ Book** (Một phiếu mượn có thể chứa nhiều sách, một sách có thể xuất hiện trong nhiều phiếu mượn).

Quan hệ này được giải quyết thông qua bảng trung gian **BorrowItem** với cấu trúc:

```
BorrowRecord (1) ──< BorrowItem >── (1) Book
```

**Tại sao cần bảng trung gian mà không dùng trực tiếp?**
- Một phiếu mượn cần chứa nhiều sách (lên đến 3)
- Một sách cần xuất hiện trong nhiều phiếu mượn (theo thời gian)
- Cần lưu thêm thông tin quantity (số bản sao mượn) cho mỗi cặp (phiếu mượn, sách)

---

## 6. CHUẨN HÓA DỮ LIỆU (NORMALIZATION)

### 6.1. First Normal Form (1NF)

Tất cả các bảng trong hệ thống đều đạt 1NF:
- Mỗi cột chứa giá trị nguyên tử (atomic) — không có mảng hoặc tập hợp lồng nhau
- Mỗi hàng là duy nhất (có primary key)
- Các cột trong cùng một bảng có tên riêng biệt

Ngoại lệ: Trường `subjects` trong `BookMetadata` lưu JSON array dạng string, tuy nhiên đây là lựa chọn có chủ đích (đã giải thích ở phần phân tích bảng BookMetadata) và không làm mất tính 1NF vì giá trị vẫn là atomic string.

### 6.2. Second Normal Form (2NF)

Tất cả các bảng đều đạt 2NF:
- Đã đạt 1NF
- Không có phụ thuộc bán phần (partial dependency) — mọi cột không phải khóa đều phụ thuộc hoàn toàn vào toàn bộ primary key

Do tất cả các bảng đều có primary key là một cột duy nhất (single-column PK), nên tự động đạt 2NF.

### 6.3. Third Normal Form (3NF)

Hầu hết các bảng đạt 3NF:
- Đã đạt 2NF
- Không có phụ thuộc bắc cầu (transitive dependency) — mọi cột không phải khóa đều phụ thuộc trực tiếp vào primary key

**Ngoại lệ có chủ đích:**

1. **Fine.user_id**: Phụ thuộc bắc cầu qua `BorrowRecord.user_id` (Fine → BorrowRecord → User). Đây là denormalization có chủ đích để tối ưu truy vấn dashboard và danh sách phạt.

2. **Book.total_quantity và available_quantity**: Có thể tính available_quantity = total_quantity - SUM(quantity của các phiếu đang active). Việc lưu riêng available_quantity là denormalization để tránh tính toán phức tạp mỗi lần truy vấn.

3. **Book.reserved_for_user_id**: Có thể suy ra từ Reservation (status = 'notified'). Việc lưu riêng trong Book giúp kiểm tra nhanh khi tạo phiếu mượn mà không cần JOIN.

### 6.4. Đánh giá chuẩn hóa

| Mức chuẩn | Đạt? | Ghi chú |
|---|---|---|
| 1NF | ✅ | Tất cả bảng |
| 2NF | ✅ | Tất cả bảng (single-column PKs) |
| 3NF | ✅ (phần lớn) | 3 trường hợp denormalization có chủ đích |
| BCNF | ✅ (phần lớn) | Không có phụ thuộc hàm không tầm thường |

**Điểm mạnh:**
- Cấu trúc rõ ràng, dễ hiểu
- Giảm thiểu dư thừa dữ liệu
- Dễ dàng bảo trì và mở rộng

**Điểm có thể cải thiện:**
- Tách `subjects` trong BookMetadata thành bảng `BookSubject` riêng nếu cần truy vấn theo chủ đề
- Tách `role` trong User thành bảng `Role` riêng nếu cần phân quyền chi tiết

---

## 7. RÀNG BUỘC DỮ LIỆU VÀ TÍNH TOÀN VẸN

### 7.1. Primary Keys

Tất cả các bảng đều sử dụng khóa chính dạng `INT IDENTITY(1,1)` — tự động tăng, đảm bảo mỗi hàng là duy nhất. Lựa chọn INT (thay vì UUID hay GUID) phù hợp với quy mô nhỏ của hệ thống:
- Kích thước nhỏ (4 bytes), tối ưu cho index
- Tự động tăng, không cần xử lý phía ứng dụng
- Dễ đọc và debug

Hạn chế: Giới hạn ~2 tỷ bản ghi mỗi bảng — đủ cho hầu hết hệ thống quy mô nhỏ.

### 7.2. Foreign Keys

| Ràng buộc | Bảng con → Bảng cha | Cascade Rule | Mục đích |
|---|---|---|---|
| FK_BookMetadata_Book | BookMetadata.book_id → Book.id | ON DELETE NO ACTION, ON UPDATE CASCADE | Không xóa sách nếu còn metadata |
| FK_BorrowRecord_User | BorrowRecord.user_id → User.id | ON DELETE NO ACTION, ON UPDATE CASCADE | Không xóa user nếu còn phiếu mượn |
| FK_BorrowItem_BorrowRecord | BorrowItem.borrow_record_id → BorrowRecord.id | ON DELETE NO ACTION, ON UPDATE CASCADE | Không xóa phiếu mượn nếu còn chi tiết |
| FK_BorrowItem_Book | BorrowItem.book_id → Book.id | ON DELETE NO ACTION, ON UPDATE CASCADE | Không xóa sách nếu còn trong phiếu mượn |
| FK_Fine_BorrowRecord | Fine.borrow_record_id → BorrowRecord.id | ON DELETE NO ACTION, ON UPDATE NO ACTION | Không tự động cập nhật khi phiếu mượn thay đổi |
| FK_Fine_User | Fine.user_id → User.id | ON DELETE NO ACTION, ON UPDATE NO ACTION | Bảo vệ toàn vẹn dữ liệu phạt |

**Giải thích cascade rules:**
- `ON DELETE NO ACTION`: Ngăn xóa bản ghi cha nếu còn bản ghi con — bảo vệ dữ liệu lịch sử
- `ON UPDATE CASCADE`: Tự động cập nhật FK khi PK cha thay đổi — hữu ích trong một số tình huống
- `ON UPDATE NO ACTION` cho Fine: Ràng buộc chặt chẽ hơn, tránh thay đổi không mong muốn

### 7.3. Unique Constraints

| Bảng | Cột(s) | Mục đích |
|---|---|---|
| User | email | Mỗi email chỉ được đăng ký một tài khoản |
| Book | isbn | Mỗi ISBN chỉ được nhập một lần (tránh trùng sách) |
| BookMetadata | book_id | Mỗi sách chỉ có một bản ghi metadata (1:1) |
| Wallet | user_id | Mỗi người dùng chỉ có một ví (1:1) |

### 7.4. Check Constraints (qua application layer)

Hiện tại, hệ thống không sử dụng CHECK constraints ở cấp database mà kiểm tra ở application layer (service layer). Các ràng buộc quan trọng:

| Ràng buộc | Nơi kiểm tra | Mô tả |
|---|---|---|
| available_quantity >= 0 | borrowService.createBorrow | Không cho mượn khi sách hết |
| items.length <= 3 | borrowService.createBorrow | Tối đa 3 sách mỗi phiếu |
| balance >= 0 | walletService.deductFromWallet | Không cho số dư âm |
| amount > 0 và <= 100M | walletService.addCredits | Giới hạn nạp tiền |

**Khuyến nghị:** Nên thêm CHECK constraints ở database cho các ràng buộc quan trọng (đảm bảo toàn vẹn ngay cả khi có bug ở application layer):
```sql
ALTER TABLE Book ADD CONSTRAINT CK_Book_available_quantity CHECK (available_quantity >= 0 AND available_quantity <= total_quantity);
ALTER TABLE Wallet ADD CONSTRAINT CK_Wallet_balance CHECK (balance >= 0);
```

### 7.5. Ràng buộc mặc định (Default Constraints)

Bảng migration.sql định nghĩa 12 DEFAULT constraints cho các trường như:
- `User.role` → 'student'
- `User.is_active` → 1
- `Book.total_quantity` → 1
- `BorrowRecord.status` → 'active'
- v.v.

Các default constraints này đảm bảo dữ liệu luôn có giá trị hợp lệ ngay cả khi ứng dụng không cung cấp giá trị.

---

## 8. LUỒNG DỮ LIỆU NGHIỆP VỤ

### 8.1. Luồng Đăng ký tài khoản

```
Người dùng ──> POST /api/auth/register
  │
  ├── Kiểm tra email tồn tại? ──> User (findUnique by email)
  ├── Băm mật khẩu (bcrypt, cost=10)
  ├── Tạo user mới ──> User.create
  │
  └── Trả về thông tin user (không bao gồm password_hash)
```

**Bảng liên quan:** User (INSERT)

### 8.2. Luồng Đăng nhập

```
Người dùng ──> POST /api/auth/login
  │
  ├── Tìm user theo email ──> User (findUnique by email)
  ├── Kiểm tra is_active = true?
  ├── So sánh mật khẩu (bcrypt.compare)
  ├── Tạo JWT (24h)
  │
  └── Trả về token + thông tin user
```

**Bảng liên quan:** User (SELECT)

### 8.3. Luồng Mượn sách

```
Thủ thư ──> POST /api/borrows
  │
  ├── Kiểm tra user tồn tại và active ──> User.findById
  ├── Kiểm tra sách tồn tại, chưa xóa ──> Book.findById
  ├── TRANSACTION START (Serializable isolation)
  │   ├── Kiểm tra available_quantity >= quantity cho mỗi sách
  │   ├── Kiểm tra reserved_for_user_id (nếu có)
  │   ├── Tạo BorrowRecord (INSERT)
  │   ├── Tạo BorrowItem cho mỗi sách (INSERT)
  │   ├── Giảm available_quantity (UPDATE Book)
  │   ├── Xóa reserved_for_user_id nếu là người được ưu tiên
  │   ├── Nếu đến từ reservation, đánh dấu reservation = completed
  │   └── TRANSACTION COMMIT
  │
  └── Trả về thông tin phiếu mượn kèm chi tiết sách
```

**Bảng liên quan:** User (SELECT), Book (SELECT, UPDATE), BorrowRecord (INSERT), BorrowItem (INSERT), Reservation (SELECT, UPDATE)

### 8.4. Luồng Yêu cầu trả sách

```
Sinh viên ──> POST /api/borrows/:id/request-return
  │
  ├── Tìm BorrowRecord ──> BorrowRecord.findById
  ├── Kiểm tra quyền sở hữu (user_id == req.user.id)
  ├── Kiểm tra trạng thái chưa trả
  ├── Cập nhật status = 'return_pending', set return_requested_at
  │
  └── Trả về thông tin phiếu mượn
```

**Bảng liên quan:** BorrowRecord (SELECT, UPDATE)

### 8.5. Luồng Xác nhận trả sách

```
Thủ thư ──> PATCH /api/borrows/:id/confirm-return
  │
  ├── Tìm BorrowRecord (kèm items) ──> BorrowRecord.findById
  ├── Kiểm tra trạng thái 'return_pending'
  ├── Tính tiền phạt nếu quá hạn (fine = days_overdue × 2,000)
  │
  ├── TRANSACTION START
  │   ├── Cập nhật status = 'returned', return_date, confirmed_by
  │   ├── Tăng available_quantity cho mỗi sách (UPDATE Book)
  │   ├── Xử lý queue đặt trước (Reservation)
  │   │   └── Nếu có người chờ, chuyển sang 'notified', khóa sách 48h
  │   ├── Nếu quá hạn, tạo Fine (INSERT)
  │   └── TRANSACTION COMMIT
  │
  └── Trả về thông tin phiếu mượn (kèm fine nếu có)
```

**Bảng liên quan:** BorrowRecord (SELECT, UPDATE), Book (SELECT, UPDATE), BorrowItem (SELECT), Fine (INSERT), Reservation (SELECT, UPDATE), Notification (INSERT), WalletTransaction (INSERT — nếu auto-deduct)

### 8.6. Luồng Thanh toán phạt

```
Sinh viên ──> PATCH /api/fines/:id/self-pay
  │
  ├── Tìm Fine ──> Fine.findById
  ├── Kiểm tra quyền sở hữu và chưa thanh toán
  ├── Kiểm tra số dư ví ──> Wallet.findByUserId
  │
  ├── Transaction
  │   ├── Trừ tiền từ Wallet (UPDATE)
  │   ├── Tạo WalletTransaction (INSERT) với type='deduction'
  │   ├── Cập nhật Fine: is_paid=true, paid_at, paid_by
  │   └── Transaction commit
  │
  └── Trả về thông tin fine đã thanh toán
```

**Bảng liên quan:** Fine (SELECT, UPDATE), Wallet (SELECT, UPDATE), WalletTransaction (INSERT)

### 8.7. Luồng Đặt trước sách

```
Sinh viên ──> POST /api/reservations
  │
  ├── Kiểm tra sách tồn tại và available_quantity == 0
  ├── Kiểm tra chưa có reservation active cho sách này
  ├── Đếm số người đang chờ (waiting + notified)
  ├── Tạo Reservation (INSERT) với queue_position = count + 1
  │
  └── Trả về thông tin reservation
```

**Bảng liên quan:** Book (SELECT), Reservation (SELECT, INSERT)

### 8.8. Luồng Scheduler (tự động)

```
[Scheduler hàng ngày]

1. 08:00 — Gửi nhắc nhở sắp đến hạn
   ├── Tìm BorrowRecord: status='active', due_date trong 7 ngày tới, reminder_sent=false
   ├── Tạo Notification cho mỗi bản ghi
   └── Cập nhật reminder_sent = true

2. 00:00 — Tính phạt quá hạn
   ├── Tìm BorrowRecord: status='active', due_date < now
   ├── Nếu chưa có Fine: tạo mới
   ├── Nếu đã có Fine chưa thanh toán: cập nhật amount
   └── Tạo Notification

3. 02:30 — Tự động trừ phạt từ ví
   ├── Tìm Wallet có balance > 0 và user có unpaid fines
   ├── Trừ tiền (tối đa số dư hiện có)
   ├── Cập nhật Fine
   ├── Tạo WalletTransaction + FinePayment
   └── Tạo Notification

4. Mỗi 30 phút — Xử lý reservation hết hạn
   ├── Tìm Reservation: status='notified', expires_at < now
   ├── Chuyển status = 'expired'
   ├── Mở khóa sách (reserved_for_user_id = null)
   ├── Chuyển người tiếp theo trong hàng chờ thành 'notified'
   └── Tạo Notification
```

**Bảng liên quan:** BorrowRecord, Fine, Wallet, Reservation, Notification, WalletTransaction, FinePayment

---

## 9. PHÂN TÍCH HIỆU NĂNG CƠ SỞ DỮ LIỆU

### 9.1. Các chỉ mục (Indexes)

Hệ thống định nghĩa các chỉ mục sau trong migration.sql và schema.prisma:

| Bảng | Index | Cột | Loại | Mục đích |
|---|---|---|---|---|
| User | User_email_key | email | UNIQUE, NONCLUSTERED | Tra cứu đăng nhập, đảm bảo unique email |
| Book | Book_pkey | id | CLUSTERED | Primary key |
| Book | Book_isbn_key | isbn | UNIQUE, NONCLUSTERED | Tra cứu ISBN, đảm bảo unique |
| Book | Book_title_idx | title | NONCLUSTERED | Tìm kiếm theo tiêu đề |
| Book | Book_is_deleted_idx | is_deleted | NONCLUSTERED | Lọc sách đã xóa |
| Book | Book_category_idx | category | NONCLUSTERED | Lọc theo thể loại |
| BookMetadata | BookMetadata_book_id_key | book_id | UNIQUE, NONCLUSTERED | JOIN 1:1 với Book |
| BorrowRecord | BorrowRecord_user_id_idx | user_id | NONCLUSTERED | Lịch sử mượn theo user |
| BorrowRecord | BorrowRecord_status_idx | status | NONCLUSTERED | Lọc theo trạng thái |
| BorrowRecord | BorrowRecord_due_date_idx | due_date | NONCLUSTERED | Tìm phiếu quá hạn |
| Fine | Fine_user_id_idx | user_id | NONCLUSTERED | Tra cứu phạt theo user |
| Fine | Fine_is_paid_idx | is_paid | NONCLUSTERED | Lọc phạt chưa thanh toán |
| CrawlLog | CrawlLog_status_idx | status | NONCLUSTERED | Lọc log theo trạng thái |
| CrawlLog | CrawlLog_started_at_idx | started_at | NONCLUSTERED | Sắp xếp theo thời gian |
| WalletTransaction | wallet_id_idx | wallet_id | NONCLUSTERED | Lịch sử giao dịch theo ví |
| WalletTransaction | type_idx | type | NONCLUSTERED | Lọc theo loại giao dịch |
| WalletTransaction | created_at_idx | created_at | NONCLUSTERED | Sắp xếp thời gian |
| FinePayment | fine_id_idx | fine_id | NONCLUSTERED | Tra cứu thanh toán theo phạt |
| FinePayment | wallet_id_idx | wallet_id | NONCLUSTERED | Tra cứu thanh toán theo ví |
| Reservation | user_id_idx | user_id | NONCLUSTERED | DS đặt trước của user |
| Reservation | book_id_idx | book_id | NONCLUSTERED | DS đặt trước của sách |
| Reservation | status_idx | status | NONCLUSTERED | Lọc theo trạng thái |
| Reservation | book_id_status_idx | book_id, status | COMPOSITE | Tìm người chờ tiếp theo |
| Notification | user_id_idx | user_id | NONCLUSTERED | Thông báo của user |
| Notification | is_read_idx | is_read | NONCLUSTERED | Đếm chưa đọc |
| Notification | created_at_idx | created_at | NONCLUSTERED | Sắp xếp thời gian |

### 9.2. Phân tích hiệu năng

**Điểm mạnh:**
1. **Index đầy đủ trên FK**: Tất cả foreign key đều được đánh index — tối ưu JOIN
2. **Composite index cho Reservation**: (book_id, status) tối ưu truy vấn tìm người kế tiếp trong queue
3. **Index trạng thái**: Các cột status, is_paid, is_deleted, is_read đều có index — hỗ trợ lọc hiệu quả
4. **Phân trang (pagination)**: Tất cả truy vấn danh sách đều có phân trang (skip/take) — tránh load toàn bộ dữ liệu

**Điểm nghẽn tiềm năng:**

1. **Dashboard queries**: Hàm `getSummary()` trong dashboardService.js thực hiện ~12-14 truy vấn đồng thời. Ở quy mô lớn (hàng ngàn bản ghi), các truy vấn aggregate (COUNT, SUM, GROUP BY) có thể chậm.
   - **Giải pháp**: Cache dashboard summary với Redis (TTL 60s), hoặc tạo materialized view.

2. **Fine auto-recalculate**: Mỗi lần liệt kê fines, hệ thống tính lại amount dựa trên ngày hiện tại. Với số lượng lớn fines chưa thanh toán, việc này có thể gây chậm.
   - **Giải pháp**: Chỉ recalculate khi cần (khi người dùng xem), không recalculate toàn bộ danh sách.

3. **Truy vấn tìm kiếm sách theo title/author/isbn**: Dùng `contains` của Prisma (tương đương `LIKE '%keyword%'`) không tận dụng được index hiệu quả.
   - **Giải pháp**: Khi hệ thống lớn, nên chuyển sang FULLTEXT index của SQL Server hoặc Elasticsearch.

4. **Transaction với Serializable isolation**: Mặc dù đảm bảo tính nhất quán, Serializable isolation level có thể gây contention và ảnh hưởng hiệu năng.
   - **Giải pháp**: Có thể hạ xuống `Read Committed` với các biện pháp kiểm soát optimistic locking nếu cần.

### 9.3. Khả năng mở rộng

**Horizontal scaling (Backend):**
- JWT stateless — có thể chạy nhiều instance Express.js
- Cần thêm Redis session store nếu cần rate limiting chính xác

**Vertical scaling (Database):**
- Index strategy sẵn sàng cho dữ liệu lớn
- Có thể thêm read replica cho dashboard queries
- Có thể partition các bảng lớn (WalletTransaction, Notification) theo thời gian

### 9.4. Đề xuất tối ưu

**Tối ưu truy vấn:**
1. Dashboard: Tạo stored procedure hoặc materialized view thay vì 14 truy vấn riêng lẻ
2. Repository pattern: Tránh N+1 queries bằng Prisma `include` và `select` có chọn lọc

**Tối ưu index:**
1. Bổ sung composite index cho Fine: `(user_id, is_paid)` — tối ưu dashboard và danh sách phạt
2. Bổ sung composite index cho BorrowRecord: `(user_id, status, due_date)` — tối ưu lịch sử mượn
3. Bổ sung index cho WalletTransaction.reference — tối ưu tra cứu giao dịch theo reference

**Tối ưu cấu trúc bảng:**
1. Cân nhắc thêm CHECK constraints ở database (đã đề cập ở phần 7.4)
2. Xem xét chuyển `subjects` trong BookMetadata thành bảng riêng nếu cần truy vấn theo chủ đề
3. Đánh giá việc thêm `updated_at` cho các bảng còn thiếu (Fine, Reservation, Notification)

---

## 10. ĐÁNH GIÁ THIẾT KẾ CƠ SỞ DỮ LIỆU

### 10.1. Ưu điểm

| Tiêu chí | Đánh giá |
|---|---|
| **Tính rõ ràng** | Cấu trúc bảng rõ ràng, tên bảng/cột có ý nghĩa, dễ hiểu. Mỗi bảng phục vụ một mục đích cụ thể. |
| **Tính nhất quán** | Sử dụng khóa ngoại, ràng buộc UNIQUE, và transaction để đảm bảo dữ liệu nhất quán. |
| **Khả năng mở rộng** | Thiết kế chuẩn 3NF cho phép mở rộng dễ dàng. Có thể thêm bảng mới mà không ảnh hưởng cấu trúc hiện tại. |
| **Khả năng bảo trì** | Schema qua Prisma migrations giúp dễ dàng quản lý thay đổi. Có thể rollback migration nếu cần. |
| **Hiệu năng truy vấn** | Index đầy đủ trên các cột thường xuyên truy vấn. |
| **Tính toàn vẹn** | Transaction với Serializable isolation cho các thao tác quan trọng (mượn/trả). |
| **Phân quyền rõ ràng** | Ba vai trò (student/librarian/admin) được phân biệt qua cột role. |

### 10.2. Hạn chế

| Hạn chế | Mô tả | Mức ảnh hưởng |
|---|---|---|
| **CHECK constraints thiếu** | Các ràng buộc như available_quantity >= 0 chỉ kiểm tra ở application layer | Trung bình — có thể dẫn đến dữ liệu không hợp lệ nếu có bug ở service layer |
| **Subjects dạng JSON string** | Không thể truy vấn SQL hiệu quả theo chủ đề | Thấp — hiện tại chỉ dùng để hiển thị |
| **Không có updated_at cho nhiều bảng** | Fine, Reservation, Notification, CrawlLog thiếu trường updated_at | Thấp — không ảnh hưởng nghiệp vụ chính |
| **Không có audit log tổng quát** | Chỉ có CrawlLog cho crawl, không có log cho các thay đổi dữ liệu khác | Trung bình — khó debug khi có lỗi dữ liệu |
| **Role dạng string** | Không linh hoạt để thêm quyền chi tiết | Thấp — phù hợp với quy mô hiện tại |
| **Phụ thuộc vào application cho validation** | Thiếu database-level validation cho các business rules | Trung bình |

### 10.3. Đề xuất cải tiến

**Ngắn hạn (dễ thực hiện):**

1. **Thêm CHECK constraints:**
   ```sql
   ALTER TABLE Book ADD CONSTRAINT CK_Book_quantity CHECK (available_quantity >= 0 AND available_quantity <= total_quantity);
   ALTER TABLE Wallet ADD CONSTRAINT CK_Wallet_balance CHECK (balance >= 0);
   ALTER TABLE BorrowItem ADD CONSTRAINT CK_BorrowItem_quantity CHECK (quantity > 0);
   ```

2. **Bổ sung index:**
   - Fine: composite index `(user_id, is_paid)`
   - BorrowRecord: composite index `(user_id, status, due_date)`
   - WalletTransaction: index on `reference`

3. **Thêm updated_at cho các bảng còn lại:**
   - Fine, Reservation, Notification, CrawlLog, BorrowRecord

**Trung hạn:**

4. **Tách Role thành bảng riêng:**
   - Bảng `Role`: id, name, description
   - Bảng `Permission`: id, name, resource, action
   - Bảng `RolePermission`: role_id, permission_id
   - Cho phép phân quyền chi tiết đến từng API endpoint

5. **Thêm AuditLog:**
   - Ghi lại mọi thay đổi dữ liệu quan trọng (INSERT/UPDATE/DELETE)
   - Hỗ trợ debug và compliance

**Dài hạn:**

6. **Full-text search cho Book:**
   - Sử dụng FULLTEXT index của SQL Server
   - Hoặc Elasticsearch cho khả năng mở rộng tốt hơn

7. **Partition cho bảng lớn:**
   - WalletTransaction: partition theo tháng
   - Notification: partition theo tháng
   - CrawlLog: archive sau 90 ngày

8. **Materialized View cho Dashboard:**
   - Tạo view tổng hợp số liệu dashboard
   - Refresh định kỳ thay vì truy vấn trực tiếp

---

## 11. KẾT LUẬN

Báo cáo này đã trình bày chi tiết thiết kế cơ sở dữ liệu cho Hệ thống Quản lý Thư viện (Library Management System) — một ứng dụng web monolithic sử dụng Microsoft SQL Server với Prisma ORM.

**Cấu trúc cơ sở dữ liệu hiện tại** bao gồm **12 bảng** được tổ chức thành 5 nhóm chức năng:

| Nhóm | Bảng | Vai trò |
|---|---|---|
| Người dùng & Tài chính | User, Wallet, WalletTransaction, FinePayment | Quản lý tài khoản, ví điện tử và thanh toán |
| Danh mục sách | Book, BookMetadata | Lưu trữ và mở rộng thông tin sách |
| Giao dịch mượn/trả | BorrowRecord, BorrowItem, Fine | Mượn sách, trả sách và xử lý phạt |
| Đặt trước & Thông báo | Reservation, Notification | Hàng chờ và thông báo người dùng |
| Nhật ký hệ thống | CrawlLog | Vết crawl dữ liệu từ nguồn ngoài |

**Các quyết định thiết kế quan trọng:**
1. **Denormalization có chủ đích** tại Fine.user_id và Book.available_quantity để tối ưu hiệu năng
2. **Soft-delete** cho Book để bảo toàn lịch sử tham chiếu
3. **Transaction Serializable isolation** cho các thao tác mượn/trả để tránh race condition
4. **Tách metadata riêng** để crawl pipeline hoạt động độc lập
5. **Cơ chế reservation queue** với thời gian khóa 48h
6. **Auto-deduct fine** từ ví qua scheduler

**Đánh giá mức độ phù hợp:**
Thiết kế cơ sở dữ liệu hiện tại hoàn toàn phù hợp với yêu cầu của hệ thống thư viện quy mô nhỏ. Nó đáp ứng đầy đủ các chức năng nghiệp vụ cốt lõi, đảm bảo tính toàn vẹn dữ liệu qua các ràng buộc và transaction, đồng thời có khả năng mở rộng cho các phiên bản tương lai.

Với kiến trúc chuẩn 3NF (có denormalization chọn lọc), index chiến lược, và các transaction isolation thích hợp, cơ sở dữ liệu này đáp ứng tốt các yêu cầu về hiệu năng, bảo mật và khả năng bảo trì cho một đồ án môn học kéo dài 2 tuần với 5 thành viên.
