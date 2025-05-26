import dotenv from "dotenv";
dotenv.config();
import app from "./server";

const PORT = process.env.PORT || 3000;
const API_NAME = process.env.API_NAME || "Hotel Management API";
const NODE_ENV = process.env.NODE_ENV || "development";

const server = app.listen(PORT, () => {
  console.log(`🚀 ${API_NAME} started!`);
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/health`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
