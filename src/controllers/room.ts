import { NextFunction, Request, Response } from "express";
import { RoomService } from "../services/room";

export class RoomController {
  static async createRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        description,
        basePrice,
        capacity,
        bedType,
        size,
        amenities,
      } = req.body;

      const roomType = await RoomService.createRoomType({
        name,
        description,
        basePrice,
        capacity,
        bedType,
        size,
        amenities,
      });

      res.status(201).json({
        success: true,
        message: "Room type created successfully",
        data: roomType,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllRoomTypes(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const roomTypes = await RoomService.getAllRoomTypes();

      res.json({
        success: true,
        message: "Room types retrieved successfully",
        data: roomTypes,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomNumber, roomTypeId, floor, notes } = req.body;

      const room = await RoomService.createRoom({
        roomNumber,
        roomTypeId,
        floor,
        notes,
      });

      res.status(201).json({
        success: true,
        message: "Room created successfully",
        data: room,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Room type not found") {
          res.status(400).json({ success: false, message: error.message });
          return;
        }
        if (error.message === "Room number already exists") {
          res.status(409).json({ success: false, message: error.message });
          return;
        }
      }
      next(error);
    }
  }

  static async getRoomTypeById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid room type ID",
        });
        return;
      }

      const roomType = await RoomService.getRoomTypeById(id);

      res.json({
        success: true,
        message: "Room type retrieved successfully",
        data: roomType,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Room type not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  static async updateRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid room type ID",
        });
        return;
      }

      const {
        name,
        description,
        basePrice,
        capacity,
        bedType,
        size,
        amenities,
        isActive,
      } = req.body;

      const roomType = await RoomService.updateRoomType(id, {
        name,
        description,
        basePrice,
        capacity,
        bedType,
        size,
        amenities,
        isActive,
      });

      res.json({
        success: true,
        message: "Room type updated successfully",
        data: roomType,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Room type not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  static async getAllRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, floor, roomTypeId } = req.query;
      const rooms = await RoomService.getAllRooms();

      // Simple filtering
      let filteredRooms = rooms;
      if (status)
        filteredRooms = filteredRooms.filter((room) => room.status === status);
      if (floor) {
        const floorNum = parseInt(floor as string);
        if (!isNaN(floorNum))
          filteredRooms = filteredRooms.filter(
            (room) => room.floor === floorNum
          );
      }

      res.json({
        success: true,
        message: "Rooms retrieved successfully",
        data: filteredRooms,
        meta: {
          total: filteredRooms.length,
          filters: { status, floor, roomTypeId },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRoomById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid room ID",
        });
        return;
      }

      const room = await RoomService.getRoomById(id);

      res.json({
        success: true,
        message: "Room retrieved successfully",
        data: room,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Room not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  static async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid room ID",
        });
        return;
      }

      const { roomNumber, roomTypeId, floor, status, isActive, notes } =
        req.body;

      const room = await RoomService.updateRoom(id, {
        roomNumber,
        roomTypeId,
        floor,
        status,
        isActive,
        notes,
      });

      res.json({
        success: true,
        message: "Room updated successfully",
        data: room,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Room not found") {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message === "Room number already exists") {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }
      next(error);
    }
  }

  static async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid room ID",
        });
        return;
      }

      await RoomService.deleteRoom(id);

      res.json({
        success: true,
        message: "Room deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Room not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  static async getRoomStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const rooms = await RoomService.getAllRooms();

      const stats = {
        total: rooms.length,
        available: rooms.filter((r) => r.status === "available").length,
        occupied: rooms.filter((r) => r.status === "occupied").length,
        maintenance: rooms.filter((r) => r.status === "maintenance").length,
        byFloor: rooms.reduce((acc, room) => {
          acc[room.floor] = (acc[room.floor] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
      };

      res.json({
        success: true,
        message: "Room statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid room type ID",
        });
        return;
      }

      await RoomService.deleteRoomType(id);

      res.json({
        success: true,
        message: "Room type deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Room type not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
}
