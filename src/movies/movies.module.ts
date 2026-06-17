import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Movies, MoviesSchema } from './moives.schema';
import { Screening, ScreeningSchema } from './screening.schema'
import { Seat, SeatSchema } from './seat.schema'
import { ScreeningsService } from './screenings.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movies.name, schema: MoviesSchema },
      { name: Screening.name, schema: ScreeningSchema },
      { name: Seat.name, schema: SeatSchema },
    ]),
  ],
  controllers: [MoviesController],
  providers: [MoviesService, ScreeningsService],
})
export class MoviesModule { }
