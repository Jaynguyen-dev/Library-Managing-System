import { fileURLToPath } from "url";
import path from "path";
import { existsSync } from "fs";
import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/book.routes.js";
import userRoutes from "./routes/user.routes.js";
import borrowRoutes from "./routes/borrow.routes.js";
import fineRoutes from "./routes/fine.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import crawlRoutes from "./routes/crawl.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      ENV.CLIENT_URL,
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/fines", fineRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/crawl", crawlRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reservations", reservationRoutes);

app.use(errorHandler);

const clientDist = path.resolve(__dirname, "../../client/dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

export default app;
