import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import {UpdateUserDto} from "./dto/update-user.dto";

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', () => {
      const createUserDto = { userName: 'JohnDoe' };

      const result = service.create(createUserDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('userName');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('findAll', () => {
    it('should return all users', () => {
      const users: User[] = [
        {
          id: '1',
          userName: 'JohnDoe',
          createdAt: new Date(),
          updatedAt: new Date(),
          booking: [],
        },
        {
          id: '2',
          userName: 'AliceSmith',
          createdAt: new Date(),
          updatedAt: new Date(),
          booking: [],
        },
      ];

      const result = service.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result.length).toEqual(users.length);
    });
  });

  describe('findOne', () => {
    it('should return a specific user by ID', () => {
      const user = { id: 1, userName: 'JohnDoe' };

      const result = service.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a specific user by ID', () => {
      const updateUserDto: UpdateUserDto = {
        userName: 'NewUsername',
      };
      const result = service.update(1, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual({ id: '1', ...updateUserDto });
    });
  });

  describe('remove', () => {
    it('should remove a specific user by ID', () => {
      const result = service.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
