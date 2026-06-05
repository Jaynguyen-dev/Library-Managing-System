import graphviz

dot = graphviz.Digraph('BusinessFunctionDiagram', format='png')
dot.attr(rankdir='LR', size='12,8', dpi='300', nodesep='0.8', ranksep='1.2', splines='ortho')
dot.attr('node', shape='box', style='rounded,filled', fillcolor='lightblue', fontname='Helvetica', fontsize='14')
dot.attr('edge', fontname='Helvetica', fontsize='12', color='gray30')

with dot.subgraph(name='cluster_frontend') as c:
    c.attr(label='Frontend (React SPA)', style='filled', color='lightgrey', fillcolor='whitesmoke', fontsize='16', fontname='Helvetica-Bold')
    c.node('UI_Auth', 'Authentication UI\n(Login/Register)')
    c.node('UI_Dashboard', 'Dashboard UI')
    c.node('UI_Books', 'Catalogue & Book UI')
    c.node('UI_Borrows', 'Borrow & Return UI')
    c.node('UI_Users', 'User Management UI')

with dot.subgraph(name='cluster_backend') as c:
    c.attr(label='Backend API (Express.js)', style='filled', color='lightgrey', fillcolor='#e8f4f8', fontsize='16', fontname='Helvetica-Bold')
    c.node('API_Gateway', 'API Gateway / Routes\n& Auth Middleware', shape='hexagon', fillcolor='#fcf3cf')
    
    with c.subgraph(name='cluster_services') as s:
        s.attr(label='Business Logic Services', style='dashed', color='gray', fillcolor='none')
        s.node('S_Auth', 'Auth Service\n(JWT, Bcrypt)', fillcolor='#d5f5e3')
        s.node('S_Dashboard', 'Dashboard Service\n(Analytics, Stats)', fillcolor='#d5f5e3')
        s.node('S_Books', 'Book Management Service\n(CRUD, Availability)', fillcolor='#d5f5e3')
        s.node('S_Borrows', 'Borrow & Return Service\n(Transactions)', fillcolor='#d5f5e3')
        s.node('S_Fines', 'Fine Management Service\n(Auto Calc)', fillcolor='#d5f5e3')
        s.node('S_Users', 'User Management Service\n(CRUD, Roles)', fillcolor='#d5f5e3')
        s.node('S_Crawl', 'Data Ingestion Service\n(Web Crawling)', fillcolor='#f5b041', fontcolor='white')

with dot.subgraph(name='cluster_db') as c:
    c.attr(label='Data Layer (Prisma & MSSQL)', style='filled', color='lightgrey', fillcolor='#fdedec', fontsize='16', fontname='Helvetica-Bold')
    c.node('DB_Users', 'Users Table', shape='cylinder', fillcolor='white')
    c.node('DB_Books', 'Books & Metadata Tables', shape='cylinder', fillcolor='white')
    c.node('DB_Borrows', 'Borrow Records & Items', shape='cylinder', fillcolor='white')
    c.node('DB_Fines', 'Fines Table', shape='cylinder', fillcolor='white')
    c.node('DB_Crawl', 'Crawl Logs', shape='cylinder', fillcolor='white')

with dot.subgraph(name='cluster_external') as c:
    c.attr(label='External Data Sources', style='filled', color='none')
    c.node('Ext_APIs', 'Open Library /\nGoogle Books API', shape='ellipse', fillcolor='#d2b4de')

# Flows Frontend -> Gateway
dot.edge('UI_Auth', 'API_Gateway', label=' REST / JSON')
dot.edge('UI_Dashboard', 'API_Gateway')
dot.edge('UI_Books', 'API_Gateway')
dot.edge('UI_Borrows', 'API_Gateway')
dot.edge('UI_Users', 'API_Gateway')

# Flows Gateway -> Services
dot.edge('API_Gateway', 'S_Auth', label=' /api/auth')
dot.edge('API_Gateway', 'S_Dashboard', label=' /api/dashboard')
dot.edge('API_Gateway', 'S_Books', label=' /api/books')
dot.edge('API_Gateway', 'S_Borrows', label=' /api/borrows\n/api/fines')
dot.edge('API_Gateway', 'S_Users', label=' /api/users')
dot.edge('API_Gateway', 'S_Crawl', label=' /api/crawl')

# Internal Service Flows
dot.edge('S_Borrows', 'S_Fines', label=' triggers calculation', style='dotted')
dot.edge('S_Borrows', 'S_Books', label=' updates quantity', style='dotted')

# Flow Services -> Database
dot.edge('S_Auth', 'DB_Users', label=' Read/Write')
dot.edge('S_Users', 'DB_Users', label=' Read/Write')
dot.edge('S_Books', 'DB_Books', label=' Read/Write')
dot.edge('S_Borrows', 'DB_Borrows', label=' Read/Write')
dot.edge('S_Fines', 'DB_Fines', label=' Read/Write')
dot.edge('S_Dashboard', 'DB_Users', label=' Read')
dot.edge('S_Dashboard', 'DB_Books', label=' Read')
dot.edge('S_Dashboard', 'DB_Borrows', label=' Read')
dot.edge('S_Dashboard', 'DB_Fines', label=' Read')
dot.edge('S_Crawl', 'DB_Books', label=' Upsert Metadata')
dot.edge('S_Crawl', 'DB_Crawl', label=' Log Status')

# Flow External
dot.edge('S_Crawl', 'Ext_APIs', label=' HTTP GET', dir='both')

dot.render('business_function_diagram', cleanup=True)
