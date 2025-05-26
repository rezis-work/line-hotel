import express from "express";
import { schemas } from "./utils/validation";
import { validate } from "./utils/validation";
import { testConnection } from "./config";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/test-error", (req, res, next) => {
  const error = new Error("This is a test error");
  next(error);
});

app.post("/test-validation", validate(schemas.testUser), (req, res) => {
  // If we reach here, validation passed
  const { name, email, age } = req.body;

  res.json({
    success: true,
    message: "Validation passed!",
    data: {
      name,
      email,
      age,
      receivedAt: new Date().toISOString(),
    },
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const isConnected = await testConnection();

    if (isConnected) {
      res.json({
        success: true,
        message: "Database connection successful",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Database connection failed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

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
