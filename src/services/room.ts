import { db } from "../config/index";
import { rooms, roomTypes, type NewRoom, type NewRoomType } from "../db/schema";
import { eq, and } from "drizzle-orm";

export class RoomService {
  static async createRoomType(data: {
    name: string;
    description?: string;
    basePrice: number;
    capacity: number;
    bedType: string;
    size?: number;
    amenities?: string[];
  }) {
    const newRoomType: NewRoomType = {
      name: data.name,
      description: data.description,
      basePrice: data.basePrice.toString(),
      capacity: data.capacity,
      bedType: data.bedType,
      size: data.size,
      amenities: data.amenities ? JSON.stringify(data.amenities) : null,
    };

    const [created] = await db
      .insert(roomTypes)
      .values(newRoomType)
      .returning();

    return {
      ...created,
      amenities: created.amenities ? JSON.parse(created.amenities) : [],
    };
  }

  static async getAllRoomTypes() {
    const types = await db
      .select()
      .from(roomTypes)
      .where(eq(roomTypes.isActive, true));

    return types.map((type) => ({
      ...type,
      amenities: type.amenities ? JSON.parse(type.amenities) : [],
    }));
  }

  static async getRoomTypeById(id: number) {
    const [roomType] = await db
      .select()
      .from(roomTypes)
      .where(and(eq(roomTypes.id, id), eq(roomTypes.isActive, true)));

    if (!roomType) {
      throw new Error("Room type not found");
    }

    return {
      ...roomType,
      amenities: roomType.amenities ? JSON.parse(roomType.amenities) : [],
    };
  }

  static async updateRoomType(
    id: number,
    data: Partial<{
      name: string;
      description: string;
      basePrice: number;
      capacity: number;
      bedType: string;
      size: number;
      amenities: string[];
      isActive: boolean;
    }>
  ) {
    const updateData: any = { ...data };

    if (data.basePrice) {
      updateData.basePrice = data.basePrice.toString();
    }

    if (data.amenities) {
      updateData.amenities = JSON.stringify(data.amenities);
    }

    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(roomTypes)
      .set(updateData)
      .where(eq(roomTypes.id, id))
      .returning();

    if (!updated) {
      throw new Error("Room type not found");
    }

    return {
      ...updated,
      amenities: updated.amenities ? JSON.parse(updated.amenities) : [],
    };
  }

  static async deleteRoomType(id: number) {
    const [updated] = await db
      .update(roomTypes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(roomTypes.id, id))
      .returning();

    if (!updated) {
      throw new Error("Room type not found");
    }

    return true;
  }

  static async createRoom(data: {
    roomNumber: string;
    roomTypeId: number;
    floor: number;
    notes?: string;
  }) {
    // Check if room type exists
    const [roomType] = await db
      .select()
      .from(roomTypes)
      .where(eq(roomTypes.id, data.roomTypeId));
    if (!roomType) {
      throw new Error("Room type not found");
    }

    // Check if room number already exists
    const [existingRoom] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.roomNumber, data.roomNumber));
    if (existingRoom) {
      throw new Error("Room number already exists");
    }

    const newRoom: NewRoom = {
      roomNumber: data.roomNumber,
      roomTypeId: data.roomTypeId,
      floor: data.floor,
      notes: data.notes,
    };

    const [created] = await db.insert(rooms).values(newRoom).returning();
    return created;
  }

  static async getAllRooms() {
    const result = await db
      .select({
        id: rooms.id,
        roomNumber: rooms.roomNumber,
        floor: rooms.floor,
        status: rooms.status,
        isActive: rooms.isActive,
        notes: rooms.notes,
        lastCleaned: rooms.lastCleaned,
        createdAt: rooms.createdAt,
        updatedAt: rooms.updatedAt,
        roomType: {
          id: roomTypes.id,
          name: roomTypes.name,
          basePrice: roomTypes.basePrice,
          capacity: roomTypes.capacity,
          bedType: roomTypes.bedType,
        },
      })
      .from(rooms)
      .leftJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.id))
      .where(eq(rooms.isActive, true))
      .orderBy(rooms.roomNumber);

    return result;
  }

  static async getRoomById(id: number) {
    const [result] = await db
      .select({
        id: rooms.id,
        roomNumber: rooms.roomNumber,
        floor: rooms.floor,
        status: rooms.status,
        isActive: rooms.isActive,
        notes: rooms.notes,
        lastCleaned: rooms.lastCleaned,
        createdAt: rooms.createdAt,
        updatedAt: rooms.updatedAt,
        roomType: {
          id: roomTypes.id,
          name: roomTypes.name,
          description: roomTypes.description,
          basePrice: roomTypes.basePrice,
          capacity: roomTypes.capacity,
          bedType: roomTypes.bedType,
          size: roomTypes.size,
          amenities: roomTypes.amenities,
        },
      })
      .from(rooms)
      .leftJoin(roomTypes, eq(rooms.roomTypeId, roomTypes.id))
      .where(and(eq(rooms.id, id), eq(rooms.isActive, true)));

    if (!result) {
      throw new Error("Room not found");
    }

    return {
      ...result,
      roomType: {
        ...result.roomType,
        amenities: result.roomType?.amenities
          ? JSON.parse(result.roomType.amenities)
          : [],
      },
    };
  }

  static async updateRoom(id: number, data: Partial<NewRoom>) {
    if (data.roomNumber) {
      const [existingRoom] = await db
        .select()
        .from(rooms)
        .where(and(eq(rooms.roomNumber, data.roomNumber), eq(rooms.id, id)));

      if (existingRoom && existingRoom.id !== id) {
        throw new Error("Room number already exists");
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(rooms)
      .set(updateData)
      .where(eq(rooms.id, id))
      .returning();

    if (!updated) {
      throw new Error("Room not found");
    }

    return updated;
  }

  static async deleteRoom(id: number) {
    const [updated] = await db
      .update(rooms)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning();

    if (!updated) {
      throw new Error("Room not found");
    }

    return true;
  }
}
