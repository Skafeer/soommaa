import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "@/middlewares/errorHandler";
import authRoutes from "@/modules/auth/auth.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Souma API is running", data: {} });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);