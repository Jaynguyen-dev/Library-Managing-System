const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'README.md');
let content = fs.readFileSync(filePath, 'utf-8');

// Resolve merge conflicts by favoring the 'ea6714c' (the detailed changes we just made) over 'HEAD'
// For the 1st conflict
content = content.replace(/<<<<<<< HEAD\r?\n\s*VB\[Vinabook Web Scraper\]\r?\n=======\r?\n>>>>>>> ea6714c[^\n]*\n/, '');

// For the 2nd conflict
content = content.replace(/<<<<<<< HEAD\r?\n\s*CR <-->\|"Axios Fetch \/ Cheerio Scrape"\| External\r?\n=======\r?\n\s*CR <-->\|"Axios Fetch"\| External\r?\n>>>>>>> ea6714c[^\n]*\n/, '    CR <-->|"Axios Fetch"| External\n');

// For the 3rd conflict (Technology Stack Table)
const techStackRegex = /<<<<<<< HEAD[\s\S]*?\| \*\*Authentication\*\* \| jsonwebtoken \+ bcrypt \| — \| Stateless sessions & password hashing \| Stateless JWT sessions; bcrypt provides secure salted password storage \|\r?\n=======\r?\n([\s\S]*?)>>>>>>> ea6714c[^\n]*\n/;
const detailedTechStack = `
### Frontend
- **React (v19.2)**: Used for building declarative, component-based user interfaces. Chosen because its component lifecycle and state model provide an industry-standard, predictable way to build complex, highly-interactive SPAs.
- **React Router (v7.15)**: Used for client-side routing. Ensures the app functions as a true Single Page Application (SPA) without reloading the page, granting readers a fast, seamless experience when browsing the catalogue or their wallet.
- **Vite (v8.0)**: Used as the build tool and development server. Chosen for its sub-second Hot Module Replacement (HMR) and native ES modules support, offering vastly superior startup and compilation times compared to older bundlers like Webpack.
- **Tailwind CSS (v3.4)**: Used as the utility-first CSS framework. Chosen to rapidly iterate on the Spotify-inspired dark UI directly in markup without needing to manage complex cascading stylesheets or worry about dead CSS classes.
- **Context API + Axios**: Used for global state and HTTP requests. Chosen because Redux is overkill for this scope, and Axios interceptors provide an elegant way to seamlessly inject JWT auth tokens into every request header centrally.
- **Framer Motion & GSAP**: Used for advanced declarative and timeline animations. Chosen to elevate the UI so it feels fluid and premium, using staggered micro-animations and smooth layout transitions that delight the user.

### Backend
- **Express.js (v5.2)**: Used as the minimal web framework for Node.js. Chosen for its unopinionated routing, robust middleware ecosystem (for auth and role guards), and built-in async/await handling in version 5.
- **node-cron (v4.2)**: Used for scheduling background tasks. Chosen to automate daily background jobs such as checking overdue books and calculating dynamic fines without relying on external infrastructure.
- **Node.js (v18+)**: Used as the runtime environment. Chosen to allow developers to use a single language (JavaScript) across both the client and server, reducing context switching.
- **Prisma (v6.19)**: Used as the Object-Relational Mapper (ORM). Chosen for its auto-generated migrations, highly readable schema declaration files (\`schema.prisma\`), and type-safe database queries.
- **MS SQL Server (2019+)**: Used as the relational storage engine. Chosen because it fulfills the university course specifications and handles complex nested relational queries efficiently.
- **Axios (Server-side)**: Used to fetch external data. Chosen to query the Open Library and Google Books REST APIs reliably and parse their JSON payloads for the background metadata enrichment pipeline.
- **jsonwebtoken & bcrypt**: Used for security and authentication. JWT is chosen for stateless, highly scalable session handling across API requests. bcrypt is chosen for secure, salted password hashing to protect reader credentials from database leaks.
`;
content = content.replace(techStackRegex, detailedTechStack);

// If the previous regex fails because the conflict marker changed slightly, let's also do a hard replacement of the whole section just in case.
if(content.includes('<<<<<<< HEAD')) {
    // 4th conflict
    content = content.replace(/<<<<<<< HEAD\r?\n\*\*Multi-Source Merging\*\* — The crawler queries three sources in parallel and merges the best available data:\r?\n=======\r?\n\*\*Multi-Source Merging\*\* — The crawler queries two primary REST APIs in parallel and merges the best available data:\r?\n>>>>>>> ea6714c[^\n]*\n/, '**Multi-Source Merging** — The crawler queries two primary REST APIs in parallel and merges the best available data:\n');

    // 5th conflict
    content = content.replace(/<<<<<<< HEAD\r?\n\| Vinabook \| Cheerio HTML scraper \| Vietnamese edition metadata, local pricing context \|\r?\n=======\r?\n>>>>>>> ea6714c[^\n]*\n/, '');

    // 6th conflict
    content = content.replace(/<<<<<<< HEAD\r?\n(│   │   ├── pages\/[\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> ea6714c[^\n]*\n/, '$2\n');

    // 7th conflict
    content = content.replace(/<<<<<<< HEAD\r?\n(│   │   │   ├── authRoutes\.js[\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> ea6714c[^\n]*\n/, '$2\n');

    // 8th conflict
    content = content.replace(/<<<<<<< HEAD\r?\nBooks must never be hard-deleted[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> ea6714c[^\n]*\n/, '$1\n');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log("README resolved and tech stack updated.");
