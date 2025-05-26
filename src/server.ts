import express from "express";
import authRoutes from "./routes/auth";
import roomRoutes from "./routes/rooms";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", error.message);

    const NODE_ENV = process.env.NODE_ENV || "development";

    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error:
        NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
);

export default app;
