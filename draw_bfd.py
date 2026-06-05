import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Data structure in Vietnamese
top_node = "Quản lý Hoạt động Thư viện"
columns = [
    {
        "title": "Quản lý Người dùng",
        "children": ["Đăng ký", "Đăng nhập", "Quản trị Tài khoản"]
    },
    {
        "title": "Quản lý Danh mục",
        "children": ["Quản lý Sách", "Cập nhật Dữ liệu", "Tìm kiếm"]
    },
    {
        "title": "Quản lý Mượn Trả",
        "children": ["Xử lý Mượn", "Xử lý Trả", "Lịch sử Mượn"]
    },
    {
        "title": "Quản lý Phí Phạt",
        "children": ["Tính Phí Phạt", "Xử lý Thanh toán"]
    },
    {
        "title": "Quản lý Báo cáo",
        "children": ["Báo cáo\nTổng quan", "Sách Quá hạn"]
    }
]

# Formatting parameters
box_w = 3.0
box_h = 0.8
gap_x = 0.6
gap_y = 0.4
top_y = 8.0
lvl1_y = 6.0

color_bg = "#38A38E"
color_line = "#38A38E"
text_color = "white"

fig, ax = plt.subplots(figsize=(20, 10))
ax.set_aspect('equal')
ax.axis('off')

# Calculate total width
num_cols = len(columns)
total_w = num_cols * box_w + (num_cols - 1) * gap_x

start_x = 0

# Draw top node
top_x = start_x + (total_w - box_w * 1.5) / 2
ax.add_patch(patches.Rectangle((top_x, top_y), box_w * 1.5, box_h * 1.5, facecolor=color_bg, edgecolor='none'))
ax.text(top_x + box_w * 0.75, top_y + box_h * 0.75, top_node, color=text_color, ha='center', va='center', fontsize=20, fontweight='bold')

# Horizontal line from top node
top_center_x = top_x + box_w * 0.75
top_bottom_y = top_y
ax.plot([top_center_x, top_center_x], [top_bottom_y, lvl1_y + box_h + 0.5], color=color_line, lw=2)

# Horizontal distribution line
first_col_center = start_x + box_w / 2
last_col_center = start_x + (num_cols - 1) * (box_w + gap_x) + box_w / 2
ax.plot([first_col_center, last_col_center], [lvl1_y + box_h + 0.5, lvl1_y + box_h + 0.5], color=color_line, lw=2)

for i, col in enumerate(columns):
    col_x = start_x + i * (box_w + gap_x)
    col_center_x = col_x + box_w / 2
    
    # Line down to Level 1
    ax.plot([col_center_x, col_center_x], [lvl1_y + box_h + 0.5, lvl1_y + box_h], color=color_line, lw=2)
    
    # Draw Level 1 box
    ax.add_patch(patches.Rectangle((col_x, lvl1_y), box_w, box_h, facecolor=color_bg, edgecolor='none'))
    ax.text(col_center_x, lvl1_y + box_h / 2, col["title"], color=text_color, ha='center', va='center', fontsize=16, fontweight='bold')
    
    # Draw children
    if col["children"]:
        drop_x = col_x - 0.2
        drop_start_y = lvl1_y
        drop_end_y = lvl1_y - len(col["children"]) * (box_h + gap_y) + box_h/2
        
        ax.plot([drop_x, drop_x], [drop_start_y, drop_end_y], color=color_line, lw=2)
        ax.plot([drop_x, col_x + 0.5], [drop_start_y, drop_start_y], color=color_line, lw=2)
        ax.plot([drop_x, drop_x], [lvl1_y, drop_end_y], color=color_line, lw=2)
        ax.plot([drop_x, col_x + 0.2], [lvl1_y, lvl1_y], color=color_line, lw=2)

        for j, child in enumerate(col["children"]):
            child_y = lvl1_y - (j + 1) * (box_h + gap_y)
            
            # Horizontal line to child box
            ax.plot([drop_x, col_x], [child_y + box_h/2, child_y + box_h/2], color=color_line, lw=2)
            
            # Draw child box
            ax.add_patch(patches.Rectangle((col_x, child_y), box_w, box_h, facecolor=color_bg, edgecolor='none'))
            ax.text(col_center_x, child_y + box_h / 2, child, color=text_color, ha='center', va='center', fontsize=14)

plt.xlim(start_x - 1, start_x + total_w + 1)
plt.ylim(lvl1_y - 4 * (box_h + gap_y) - 1, top_y + box_h * 1.5 + 1)
plt.subplots_adjust(left=0.01, right=0.99, top=0.99, bottom=0.01)

plt.savefig('business_function_diagram.png', dpi=300, bbox_inches='tight')
