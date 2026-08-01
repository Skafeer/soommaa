import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "@/middlewares/errorHandler";
import authRoutes from "@/modules/auth/auth.routes";
import categoryRoutes from "@/modules/categories/category.routes";
import advertisementRoutes from "@/modules/advertisements/advertisement.routes";
import favoriteRoutes from "@/modules/favorites/favorite.routes";

export const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Souma API is running", data: {} });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/advertisements", advertisementRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use(errorHandler);