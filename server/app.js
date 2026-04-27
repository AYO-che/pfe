import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./passport.js";
import Routes from "./routes/index.js";
import { createServer } from "http";
import { initSocket } from "./socket.js";
import { resolve } from "path";

dotenv.config();

const app = express();

/* ========================
   🔥 CORS FIX (IMPORTANT)
======================== */
app.use(
  cors({
    origin: "http://localhost:5173", // ONLY frontend (Vite)
    credentials: true,
  })
);

/* ========================
   CORE MIDDLEWARE
======================== */
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

/* ========================
   ROUTES
======================== */
app.use("/", Routes);

/* ========================
   TEST ROUTES
======================== */
app.get("/stripe-test", (req, res) => {
  res.sendFile(resolve("../test.html"));
});
app.use("/uploads", express.static("uploads"));

app.get("/success", (req, res) =>
  res.send("Stripe onboarding completed successfully!")
);

app.get("/reauth", (req, res) =>
  res.send("Please try the onboarding link again.")
);

app.get("/health", (req, res) =>
  res.send("Chrysalise API is running")
);

/* ========================
   SOCKET
======================== */
const httpServer = createServer(app);
initSocket(httpServer);

/* ========================
   START SERVER
======================== */
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});