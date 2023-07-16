import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'JohnDoe',
      };

      const result = controller.create(createUserDto);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('userName');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
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

      const result = controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user = { id: 1, userName: 'JohnDoe' };

      const result = controller.findOne('1');

      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user by ID', async () => {
      const updateUserDto: UpdateUserDto = {
        userName: 'NewUsername',
      };

      const result = controller.update('1', updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual({ id: '1', ...updateUserDto });
    });
  });

  describe('remove', () => {
    it('should remove a user by ID', async () => {
      const result = controller.remove('1');

      expect(usersService.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
