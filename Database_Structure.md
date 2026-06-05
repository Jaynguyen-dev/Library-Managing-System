# Cấu trúc Cơ sở Dữ liệu (Database Structure)

Tài liệu này mô tả chi tiết cấu trúc của các bảng trong cơ sở dữ liệu hệ thống thư viện, được định nghĩa thông qua Prisma ORM và SQL Server.

## 1. Bảng `User` (Người dùng)
Lưu trữ thông tin tài khoản người dùng, bao gồm thủ thư (admin) và độc giả (student/user).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính |
| `full_name` | String | | Họ và tên người dùng |
| `email` | String | Unique | Địa chỉ email đăng nhập |
| `password_hash` | String | | Mật khẩu đã được băm (bcrypt) |
| `role` | String | Default: "user" | Vai trò ("user", "admin", "librarian") |
| `is_active` | Boolean | Default: true | Trạng thái tài khoản |
| `created_at` | DateTime | Default: now() | Thời gian tạo tài khoản |

## 2. Bảng `Book` (Sách)
Lưu trữ thông tin cơ bản về các đầu sách trong thư viện.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính |
| `title` | String | Index | Tên sách |
| `author` | String | | Tác giả |
| `isbn` | String | Unique | Mã số tiêu chuẩn quốc tế ISBN |
| `category` | String | Index | Thể loại sách |
| `total_quantity` | Int | Default: 1 | Tổng số lượng sách hiện có |
| `available_quantity` | Int | Default: 1 | Số lượng sách sẵn sàng cho mượn |
| `is_deleted` | Boolean | Default: false, Index | Trạng thái xóa mềm (Soft delete) |
| `reserved_for_user_id` | Int? | Nullable | ID người dùng đang được ưu tiên mượn do đặt trước |
| `reservation_expires_at`| DateTime?| Nullable | Thời gian hết hạn ưu tiên mượn |
| `created_at` | DateTime | Default: now() | Thời gian thêm sách vào hệ thống |
| `updated_at` | DateTime | Updated At | Thời gian cập nhật thông tin gần nhất |

## 3. Bảng `BookMetadata` (Siêu dữ liệu Sách)
Lưu trữ thông tin mở rộng của sách, thường được thu thập (crawl) từ internet.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính |
| `book_id` | Int | Unique, FK -> Book | Khóa ngoại liên kết tới bảng Book (Quan hệ 1-1) |
| `cover_image_url`| String? | Nullable | Đường dẫn tới ảnh bìa sách |
| `description` | String? | Nullable, NText | Tóm tắt nội dung sách |
| `publisher` | String? | Nullable | Nhà xuất bản |
| `publish_year` | Int? | Nullable | Năm xuất bản |
| `language` | String? | Default: "en" | Ngôn ngữ |
| `subjects` | String? | Nullable | Các chủ đề liên quan |
| `page_count` | Int? | Nullable | Số trang |
| `rating` | Float? | Nullable | Đánh giá sao |
| `source_url` | String? | Nullable | Đường dẫn gốc lấy dữ liệu |
| `crawled_at` | DateTime?| Nullable | Thời điểm crawl dữ liệu |

## 4. Bảng `BorrowRecord` (Phiếu mượn)
Đại diện cho một lượt mượn sách của độc giả.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính (Mã phiếu mượn) |
| `user_id` | Int | FK -> User | Khóa ngoại trỏ đến người mượn |
| `borrow_date` | DateTime | Default: now() | Ngày bắt đầu mượn |
| `due_date` | DateTime | | Ngày phải trả (hạn chót) |
| `return_date` | DateTime?| Nullable | Ngày thực trả |
| `return_requested_at` | DateTime?| Nullable | Ngày độc giả gửi yêu cầu trả online |
| `confirmed_by` | Int? | Nullable | ID thủ thư xác nhận trả sách |
| `status` | String | Default: "active" | Trạng thái (active, returned, return_requested) |
| `reminder_sent` | Boolean | Default: false | Đã gửi cảnh báo sắp đến hạn hay chưa |
| `reminder_sent_at`| DateTime?| Nullable | Thời gian gửi cảnh báo |

## 5. Bảng `BorrowItem` (Chi tiết mượn)
Danh sách các cuốn sách cụ thể trong một phiếu mượn.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính |
| `borrow_record_id`| Int | FK -> BorrowRecord | Khóa ngoại liên kết phiếu mượn |
| `book_id` | Int | FK -> Book | Khóa ngoại liên kết sách |
| `quantity` | Int | Default: 1 | Số lượng mượn của đầu sách này |

## 6. Bảng `Fine` (Tiền phạt)
Lưu trữ thông tin phạt khi độc giả trả sách trễ hạn.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính |
| `borrow_record_id`| Int | FK -> BorrowRecord | Khóa ngoại trỏ đến phiếu mượn trễ hạn |
| `user_id` | Int | FK -> User, Index | Khóa ngoại trỏ đến người bị phạt |
| `amount` | Int | | Số tiền phạt (VND) |
| `reason` | String | Default: "Overdue..."| Lý do phạt |
| `is_paid` | Boolean | Default: false, Index| Trạng thái thanh toán |
| `paid_at` | DateTime?| Nullable | Ngày hoàn thành thanh toán |
| `paid_by` | Int? | Nullable | ID người xử lý thu tiền |
| `payment_method`| String? | Nullable | Phương thức thanh toán (VD: wallet, cash) |
| `overdue_days` | Int? | Nullable | Số ngày trễ hạn |
| `created_at` | DateTime | Default: now() | Thời gian tạo biên lai phạt |

## 7. Bảng `Wallet` (Ví điện tử)
Mỗi độc giả sở hữu một ví điện tử dùng để nạp tiền và đóng phạt.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính |
| `user_id` | Int | Unique, FK -> User | ID người sở hữu ví (Quan hệ 1-1) |
| `balance` | Int | Default: 0 | Số dư hiện tại (VND) |
| `created_at` | DateTime | Default: now() | Ngày tạo ví |
| `updated_at` | DateTime | Updated At | Thời điểm cập nhật số dư cuối |

## 8. Bảng `WalletTransaction` (Giao dịch Ví)
Lịch sử biến động số dư (nạp tiền, trừ tiền phạt tự động).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính |
| `wallet_id` | Int | FK -> Wallet, Index | ID ví điện tử thực hiện |
| `amount` | Int | | Số tiền giao dịch (Có thể âm hoặc dương) |
| `balance_before`| Int? | Nullable | Số dư trước khi thực hiện giao dịch |
| `balance_after` | Int? | Nullable | Số dư sau khi hoàn tất giao dịch |
| `type` | String | Index | Loại: "topup", "deduction", "fine_payment"...|
| `status` | String | Default: "completed" | Trạng thái giao dịch (pending/completed/failed) |
| `payment_method`| String? | Nullable | Kênh thanh toán (banking, momo, system) |
| `reference` | String? | Nullable | Mã tham chiếu (VD: ID phiếu phạt) |
| `description` | String? | Nullable | Diễn giải nguyên nhân giao dịch |
| `created_at` | DateTime | Default: now(), Index| Thời gian phát sinh |

## 9. Bảng `FinePayment` (Lịch sử thanh toán phạt)
Bảng trung gian kết nối giữa tiền phạt và ví khi thực hiện thanh toán tự động/thủ công.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính |
| `fine_id` | Int | FK -> Fine, Index | ID phiếu phạt |
| `wallet_id` | Int | FK -> Wallet, Index| ID ví đã thực hiện thanh toán |
| `amount` | Int | | Số tiền đã trích từ ví để đóng cho phạt này |
| `created_at` | DateTime | Default: now() | Thời gian đóng phạt |

## 10. Bảng `Notification` (Thông báo)
Hệ thống chuông báo trong ứng dụng cho người dùng.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính |
| `user_id` | Int | Index | ID người nhận thông báo |
| `title` | String | | Tiêu đề thông báo |
| `message` | String | | Nội dung chi tiết |
| `type` | String | Default: "info" | Loại thông báo ("reminder", "overdue", "payment")|
| `is_read` | Boolean | Default: false, Index| Trạng thái người dùng đã đọc hay chưa |
| `reference` | String? | Nullable | Link liên kết (mã phiếu, v.v) để redirect khi click |
| `created_at` | DateTime | Default: now(), Index| Ngày hệ thống tự động gửi thông báo |

## 11. Bảng `Reservation` (Hàng chờ đặt trước sách)
Quản lý việc xếp hàng đặt chỗ mượn đối với các sách đã hết (out of stock).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính |
| `user_id` | Int | FK -> User, Index | Người yêu cầu đặt chỗ |
| `book_id` | Int | FK -> Book, Index | Quyển sách được đặt |
| `status` | String | Default: "waiting" | Trạng thái xếp hàng (waiting, notified, completed, cancelled, expired)|
| `queue_position`| Int? | Nullable | Vị trí thứ tự ưu tiên trong hàng chờ (1, 2, 3...) |
| `reserved_at` | DateTime | Default: now() | Thời gian bắt đầu xếp hàng |
| `notified_at` | DateTime?| Nullable | Thời gian hệ thống gửi TB ưu tiên khi có người trả sách|
| `expires_at` | DateTime?| Nullable | Thời hạn chót đến nhận sách (nếu qua hạn sẽ hủy bỏ ưu tiên) |
| `completed_at` | DateTime?| Nullable | Thời điểm độc giả tới mượn thành công |
| `cancelled_at` | DateTime?| Nullable | Thời điểm độc giả tự tay hủy đặt chỗ |

## 12. Bảng `CrawlLog` (Nhật ký Tiến trình ngầm)
Ghi nhận tiến trình chạy ngầm đồng bộ, cập nhật dữ liệu.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | Int | PK, Auto Increment | Khóa chính |
| `job_type` | String | | Loại tác vụ |
| `isbn` | String? | Nullable | Mã ISBN đang được xử lý (nếu có) |
| `status` | String | Default: "pending", Index| Trạng thái tiến trình (pending, completed, failed) |
| `source` | String? | Nullable | Nguồn API ngoài |
| `books_found` | Int | Default: 0 | Số lượng sách tìm thấy/xử lý |
| `books_updated` | Int | Default: 0 | Số lượng sách cập nhật metadata thành công |
| `error_msg` | String? | Nullable | Thông báo lỗi (nếu tiến trình thất bại) |
| `started_at` | DateTime | Default: now(), Index| Thời gian hệ thống bắt đầu chạy job |
| `finished_at` | DateTime?| Nullable | Thời gian kết thúc job |
