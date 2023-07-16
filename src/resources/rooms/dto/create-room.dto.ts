import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { Booking } from '../../bookings/entities/booking.entity';

export class CreateRoomDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  @ApiProperty()
  booking: Booking[];

  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  @IsDateString()
  updatedAt: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  @IsDateString()
  createdAt: string;
}
