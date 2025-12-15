import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import teamRouter from "./routes/team.routes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// CORS configuration
// - Development: intentionally permissive (reflect request origin, allow credentials)
// - Production: expect a specific origin via `CORS_ORIGIN` env var and keep credentials enabled
if (process.env.NODE_ENV === "production") {
  const corsOptions = {
    // If a CORS_ORIGIN is explicitly provided use it, otherwise fall back to
    // permissive reflection to avoid silently blocking requests when
    // NODE_ENV may be set to 'production' in local setups.
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  };
  app.use(cors(corsOptions));
} else {
  // Dev: use `cors` package in permissive mode. `origin: true` reflects the
  // request origin, which allows cookies to be sent when paired with
  // `credentials: true` on the client (and here).
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      exposedHeaders: ["set-cookie"],
    })
  );
}

app.use(cookieParser());

// API routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/team", teamRouter);

// Serve client build if present
const clientDist = path.join(process.cwd(), "..", "client", "dist");
app.use(express.static(clientDist));

// Handle client-side routing (SPA fallback)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) res.status(404).send("Client build not found");
  });
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectDB();

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
