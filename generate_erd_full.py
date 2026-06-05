import graphviz

dot = graphviz.Digraph('ERD', format='png')
dot.attr(rankdir='LR', size='24,16!', dpi='300', nodesep='0.6', ranksep='2.0', splines='ortho')
dot.attr('node', shape='record', style='filled', fillcolor='#f9f9f9', fontname='Helvetica', fontsize='18')
dot.attr('edge', fontname='Helvetica', fontsize='16', color='#555555')

def create_node(name, title, fields):
    label = f"<<TABLE BORDER='0' CELLBORDER='1' CELLSPACING='0' CELLPADDING='8'> <TR><TD BGCOLOR='#2c3e50'><B><FONT COLOR='white' POINT-SIZE='22'>{title}</FONT></B></TD></TR>"
    for field, ftype in fields:
        label += f"<TR><TD ALIGN='LEFT'><FONT COLOR='#333333'><B>{field}</B>: {ftype}</FONT></TD></TR>"
    label += "</TABLE>>"
    dot.node(name, label=label, shape='none', margin='0')

create_node('User', 'User', [
    ('id', 'Int (PK)'), 
    ('full_name', 'String'), 
    ('email', 'String (Unique)'), 
    ('password_hash', 'String'), 
    ('role', 'String'), 
    ('is_active', 'Boolean'), 
    ('created_at', 'DateTime')
])

create_node('Wallet', 'Wallet', [
    ('id', 'Int (PK)'), 
    ('user_id', 'Int (FK, Unique)'), 
    ('balance', 'Int'), 
    ('created_at', 'DateTime')
])

create_node('WalletTransaction', 'WalletTransaction', [
    ('id', 'Int (PK)'), 
    ('wallet_id', 'Int (FK)'), 
    ('amount', 'Int'), 
    ('type', 'String'), 
    ('status', 'String'), 
    ('created_at', 'DateTime')
])

create_node('FinePayment', 'FinePayment', [
    ('id', 'Int (PK)'), 
    ('fine_id', 'Int (FK)'), 
    ('wallet_id', 'Int (FK)'), 
    ('amount', 'Int'), 
    ('created_at', 'DateTime')
])

create_node('Fine', 'Fine', [
    ('id', 'Int (PK)'), 
    ('borrow_record_id', 'Int (FK)'), 
    ('user_id', 'Int (FK)'), 
    ('amount', 'Int'), 
    ('reason', 'String'), 
    ('is_paid', 'Boolean')
])

create_node('BorrowRecord', 'BorrowRecord', [
    ('id', 'Int (PK)'), 
    ('user_id', 'Int (FK)'), 
    ('borrow_date', 'DateTime'), 
    ('due_date', 'DateTime'), 
    ('return_date', 'DateTime?'), 
    ('status', 'String')
])

create_node('BorrowItem', 'BorrowItem', [
    ('id', 'Int (PK)'), 
    ('borrow_record_id', 'Int (FK)'), 
    ('book_id', 'Int (FK)'), 
    ('quantity', 'Int')
])

create_node('Book', 'Book', [
    ('id', 'Int (PK)'), 
    ('title', 'String'), 
    ('author', 'String'), 
    ('isbn', 'String (Unique)'), 
    ('category', 'String'), 
    ('total_quantity', 'Int'), 
    ('available_quantity', 'Int')
])

create_node('BookMetadata', 'BookMetadata', [
    ('id', 'Int (PK)'), 
    ('book_id', 'Int (FK, Unique)'), 
    ('cover_image_url', 'String?'), 
    ('description', 'String?'), 
    ('publisher', 'String?'), 
    ('publish_year', 'Int?')
])

create_node('Reservation', 'Reservation', [
    ('id', 'Int (PK)'), 
    ('user_id', 'Int (FK)'), 
    ('book_id', 'Int (FK)'), 
    ('status', 'String'), 
    ('queue_position', 'Int?'), 
    ('reserved_at', 'DateTime')
])

create_node('Notification', 'Notification', [
    ('id', 'Int (PK)'), 
    ('user_id', 'Int'), 
    ('title', 'String'), 
    ('type', 'String'), 
    ('is_read', 'Boolean')
])

create_node('CrawlLog', 'CrawlLog', [
    ('id', 'Int (PK)'), 
    ('job_type', 'String'), 
    ('isbn', 'String?'), 
    ('status', 'String')
])

# Define relations
dot.edge('User', 'Wallet', headlabel='1', taillabel='1')
dot.edge('User', 'BorrowRecord', headlabel='N', taillabel='1')
dot.edge('User', 'Fine', headlabel='N', taillabel='1')
dot.edge('User', 'Reservation', headlabel='N', taillabel='1')
dot.edge('Wallet', 'WalletTransaction', headlabel='N', taillabel='1')
dot.edge('Wallet', 'FinePayment', headlabel='N', taillabel='1')
dot.edge('Fine', 'FinePayment', headlabel='N', taillabel='1')
dot.edge('BorrowRecord', 'Fine', headlabel='N', taillabel='1')
dot.edge('BorrowRecord', 'BorrowItem', headlabel='N', taillabel='1')
dot.edge('Book', 'BorrowItem', headlabel='N', taillabel='1')
dot.edge('Book', 'BookMetadata', headlabel='1', taillabel='1')
dot.edge('Book', 'Reservation', headlabel='N', taillabel='1')

dot.render('plot/erd_full', cleanup=True)
print("ERD successfully generated at plot/erd_full.png")
