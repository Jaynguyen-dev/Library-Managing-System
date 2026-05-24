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

app.use(cors({ origin: ENV.CLIENT_URL }));
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

export default app;
