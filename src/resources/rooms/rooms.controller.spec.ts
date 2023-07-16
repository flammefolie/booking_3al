import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';

describe('RoomsController', () => {
  let controller: RoomsController;
  let service: RoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [RoomsService],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new room', async () => {
      const createRoomDto: CreateRoomDto = {
        name: 'New Room',
        description: 'super',
        booking: null,
        updatedAt: new Date().toDateString(),
        createdAt: new Date().toDateString(),
      };

      const result = service.create(createRoomDto);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('booking');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('createdAt');
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const rooms: Room[] = [
        {
          id: '1',
          name: 'Room 1',
          description: 'super',
          booking: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'Room 2',
          description: 'super',
          booking: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ];
      const result = await service.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result.length).toEqual(rooms.length);
    });
  });

  describe('findOne', () => {
    it('should return a specific room by ID', async () => {
      const roomId = '1';
      const room: Room = {
        id: roomId,
        name: 'Room 1',
        description: 'super',
        booking: null,
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      const result = await service.findOne(roomId);
      expect(service.findOne).toHaveBeenCalledWith(roomId);
      expect(result).toEqual(room);
    });
  });

  describe('update', () => {
    it('should update a specific room by ID', () => {
      const roomId = 1;
      const updateRoomDto: UpdateRoomDto = { name: 'Updated Room' };

      const result = service.update(roomId, updateRoomDto);
      expect(service.update).toHaveBeenCalledWith(roomId, updateRoomDto);
      expect(result).toEqual({ id: roomId, ...updateRoomDto });
    });
  });

  describe('remove', () => {
    it('should remove a specific room by ID', () => {
      const roomId = 1;

      const result = service.remove(roomId);
      expect(service.remove).toHaveBeenCalledWith(roomId);
      expect(result).toBeUndefined();
    });
  });
});
