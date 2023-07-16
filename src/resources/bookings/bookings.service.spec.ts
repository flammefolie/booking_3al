import {Test, TestingModule} from '@nestjs/testing';
import {BookingsService} from './bookings.service';
import {Repository} from "typeorm";
import {Booking} from "./entities/booking.entity";
import {User} from "../users/entities/user.entity";
import {Room} from "../rooms/entities/room.entity";
import {getRepositoryToken} from "@nestjs/typeorm";
import {CreateBookingDto} from "./dto/create-booking.dto";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UpdateBookingDto } from "./dto/update-booking.dto";

const mockBookingsRepository = {
  save: jest.fn().mockImplementation((dto: CreateBookingDto) => {
    return Promise.resolve();
  }),
  findOne: jest.fn().mockImplementation((options) => {
    return Promise.resolve({
      startTime: "2021-07-10T08:00:00.000Z",
      endTime: "2021-07-10T09:00:00.000Z",
      description: "description",
      title: "title",
      room: "room",
    });
  }),
};
const mockRoomRepository = {
  findOne: jest.fn().mockImplementation((options) => {
    return Promise.resolve({
      id: "id",
      name: "name",
      description: "description",
      bookings: [
        {}
      ],
    });
  }),
};

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepository: Repository<Booking>;
  let userRepository: Repository<User>;
  let roomRepository: Repository<Room>;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Les providers sont les services, répositories etc... dont notre service de test pourrait avoir besoin
      providers: [
        BookingsService,
        // Ici on "mock" nos répositories
        {provide: getRepositoryToken(Booking), useValue: mockBookingsRepository},
        {provide: getRepositoryToken(User), useClass: Repository},
        {provide: getRepositoryToken(Room), useValue: mockRoomRepository},
      ],
    }).compile(); // Compilation du module de test

    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const testBookingDto = {
      room: 'room id',
      startTime: '2023-07-16T12:00:00',
      endTime: '2023-07-16T13:00:00',
      title: 'Book the room',
      description: 'booking the room',
    };

    const testUser = new User();
    testUser.id = 'user id';
    testUser.userName = 'JohnDoe';

    const testRoom = new Room();
    testRoom.id = 'room id';
    testRoom.name = 'Test Room';
    testRoom.description = 'This is a test room';

    it('should throw an error if the user does not exist', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([]);
      await expect(
          service.create(testBookingDto, 'invalid-user-id'),
      ).rejects.toThrow();
    });

    it('should throw an error if the room does not exist', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([testUser]);
      jest.spyOn(roomRepository, 'findOneOrFail').mockImplementation(() => {
        throw new Error();
      });
      await expect(
          service.create(testBookingDto, testUser.id),
      ).rejects.toThrow();
    });

    it('should successfully book a room for a user', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([testUser]);
      jest.spyOn(roomRepository, 'findOneOrFail').mockResolvedValue(testRoom);
      jest.spyOn(bookingRepository, 'save').mockResolvedValue(undefined);
      await expect(
          service.create(testBookingDto, testUser.id),
      ).resolves.not.toThrow();
      expect(userRepository.find).toBeCalledWith({
        where: { id: testUser.id },
      });
      expect(roomRepository.findOneOrFail).toBeCalledWith({
        where: { id: testBookingDto.room },
      });
      expect(bookingRepository.save).toBeCalled();
    });
  });

  it("can't create two rooms at the same time", async () => {
        const createBookingDto = {
          startTime: "2021-07-10T08:00:00.000Z",
          endTime: "2021-07-10T09:00:00.000Z",
          description: "description",
          title: "title",
          room: "room",
        }
        // La méthode create est appelé avec en paramètre le DTO et le userId
        // Find one est appelé avec les paramètres {where: {startTime: SuperiorThan(reateBookingDto.startTime),
        // endTime: LessThan(createBookingDto.endTime)}
        // On mock que findOne (voir déclaration au début du module) va retourner existingBooking ce qui veut dire (grace aux paramètres plus haut)
        // qu'il existe bien un booking qui prend lieu pendant la période de createBookingDto

        //Par conséquent, la méthode doit throw et renvoyer UserAlreadyBookedAtThisTimeException
        await expect(service.create(createBookingDto, "userId")).toThrow(UserAlreadyBookedAtThisTimeException);
      }
  );

  it("Same room can't be booked twice", async () => {
        const createBookingDto = {
          startTime: "2021-07-10T08:00:00.000Z",
          endTime: "2021-07-10T09:00:00.000Z",
          description: "description",
          title: "title",
          room: "room",
        }
        // room.findOne est appelé avec les paramètres {where: {room: createBookingDto.room,
        // startTime: SuperiorThan(reateBookingDto.startTime), endTime: LessThan(createBookingDto.endTime)}}
        // On mock que findOne (voir déclaration au début du module) va retourner existingBooking ce qui veut dire (grace aux paramètres plus haut)
        // qu'il existe bien un booking qui prend lieu pendant la période de createBookingDto dans cette meme pièce

        //Par conséquent, la méthode doit throw et renvoyer RoomAlreadyBookedAtThisTimeException
        await expect(service.create(createBookingDto, "userId")).toThrow(RoomAlreadyBookedAtThisTimeException);
      }
  );


  describe("findAll", () => {
    it("should return an array of bookings", async () => {

      const booking1 = new Booking();
      booking1.id = "booking-id-1";
      const booking2 = new Booking();
      booking2.id = "booking-id-2";

      const bookings = [booking1, booking2];

      jest.spyOn(bookingRepository, "find").mockResolvedValue(bookings as any);
      const result = await service.findAll();

      // Vérification que la méthode `find()` a été appelée
      expect(bookingRepository.find).toHaveBeenCalled();

      // Vérification que le résultat correspond aux réservations factices
      expect(result.length).toEqual(bookings.length);
      expect(result).toEqual(bookings);

    });

  });

  describe("findOne", () => {
    it("should return a booking by id", async () => {

      const booking1 = new Booking();
      booking1.id = "booking-id-1";

      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(booking1);
      const result = await service.findOne(booking1.id);

      // Vérification que la méthode `find()` a été appelée
      expect(bookingRepository.findOne).toHaveBeenCalled();

      // Vérification que le résultat correspond aux réservations factices
      expect(result).toEqual(booking1);
      expect(result.id).toEqual(booking1.id);

    });

  });

  describe("remove", () => {
    let booking: Booking;
    let user: User;

    beforeEach(() => {
      booking = new Booking();
      booking.id = "booking-id";

      user = new User();
      user.id = "user id";
      user.userName = "Test User";
      booking.user = user;
    });


    it("it should throw an exception because the user is unauthorised to remove a booking", async () => {
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(booking);

      const userId = "another-user-id";

      await expect(async () => {
        await service.remove(booking.id, userId);
      }).rejects.toThrow(HttpException);

      try {
        await service.remove(booking.id, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({
          status: HttpStatus.FORBIDDEN,
          error: "You are not authorize to delete this resource"
        });
      }
    });


    it("it should remove a booking if the user is authorised", async () => {
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(booking);
      jest.spyOn(bookingRepository, "delete").mockResolvedValue(undefined);

      await service.remove(booking.id, user.id);
      expect(bookingRepository.findOne).toHaveBeenCalled();
      expect(bookingRepository.delete).toHaveBeenCalled();
    });
  });


  describe("update", () => {
    let booking: Booking;
    let user: User;
    let room: Room;
    let updateBookingDto: UpdateBookingDto;

    beforeEach(() => {
      booking = new Booking();
      booking.id = "booking-id";

      user = new User();
      user.id = "user id";
      user.userName = "Test User";
      booking.user = user;

      room = new Room();
      room.id = "room id";
      room.name = "Test Room";
      room.description = "This is a test room";

      updateBookingDto = new UpdateBookingDto();
      updateBookingDto.startTime = new Date().setTime(10).toString();
      updateBookingDto.endTime = new Date().setTime(11).toString();
      updateBookingDto.room = room.id;

    });


    it("it should throw an exception because the user is unauthorised to update a booking", async () => {
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(booking);

      const userId = "another-user-id";

      await expect(async () => {
        await service.update(booking.id, updateBookingDto, userId);
      }).rejects.toThrow(HttpException);

      try {
        await service.update(booking.id, updateBookingDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({
          status: HttpStatus.FORBIDDEN,
          error: "You are not authorize to update this resource"
        });
      }
    });


    it("it should update a booking if the user is authorised", async () => {
      jest.spyOn(roomRepository, "findOne").mockResolvedValue(room);
      jest.spyOn(bookingRepository, "findOne").mockResolvedValue(booking);
      jest.spyOn(bookingRepository, "save").mockResolvedValue(undefined);

      await service.update(booking.id, updateBookingDto, user.id);

      expect(bookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: booking.id },
        relations: ["room", "user"]
      });

      expect(roomRepository.findOne).toHaveBeenCalledWith({
        where: { id: updateBookingDto.room }
      });

      expect(bookingRepository.save).toHaveBeenCalledWith(booking);
    });
  });

});
