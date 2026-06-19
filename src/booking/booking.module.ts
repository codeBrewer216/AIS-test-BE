import { Module, forwardRef } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './booking.schema';
import { Seat, SeatSchema } from '@/movies/seat.schema';
import { Screening, ScreeningSchema } from '@/movies/screening.schema';
import { MoviesModule } from '@/movies/movies.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => MoviesModule),
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Seat.name, schema: SeatSchema },
      { name: Screening.name, schema: ScreeningSchema },
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule { }
