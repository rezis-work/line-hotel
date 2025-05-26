import { Router } from "express";
import { RoomController } from "../controllers/room";
import { validate, schemas } from "../utils/validation";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post(
  "/types",
  authenticate,
  authorize(["admin", "staff"]),
  validate(schemas.createRoomType),
  RoomController.createRoomType
);

router.get("/types", RoomController.getAllRoomTypes);

router.get("/types/:id", RoomController.getRoomTypeById);

router.put(
  "/types/:id",
  authenticate,
  authorize(["admin", "staff"]),
  validate(schemas.updateRoomType),
  RoomController.updateRoomType
);

router.delete(
  "/types/:id",
  authenticate,
  authorize(["admin"]),
  RoomController.deleteRoomType
);

router.post(
  "/",
  authenticate,
  authorize(["admin", "staff"]),
  validate(schemas.createRoom),
  RoomController.createRoom
);

router.get(
  "/statistics",
  authenticate,
  authorize(["admin", "staff"]),
  RoomController.getRoomStatistics
);

router.get("/:id", RoomController.getRoomById);

router.put(
  "/:id",
  authenticate,
  authorize(["admin", "staff"]),
  validate(schemas.updateRoom),
  RoomController.updateRoom
);

router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  RoomController.deleteRoom
);

export default router;
