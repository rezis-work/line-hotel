import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { validate, schemas } from "../utils/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", validate(schemas.register), AuthController.register);
router.post("/login", validate(schemas.login), AuthController.login);
router.post(
  "/refresh-token",
  validate(schemas.refreshToken),
  AuthController.refreshToken
);
router.post("/logout", validate(schemas.refreshToken), AuthController.logout);
router.get("/profile", authenticate, AuthController.getProfile);

export default router;
