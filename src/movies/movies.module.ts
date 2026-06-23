import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Movies, MoviesSchema } from './moives.schema';
import { Seat, SeatSchema } from './seat.schema'
import { AuthModule } from '../auth/auth.module';
import { Screening, ScreeningSchema } from './screening.schema';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      { name: Movies.name, schema: MoviesSchema },
      { name: Screening.name, schema: ScreeningSchema },
      { name: Seat.name, schema: SeatSchema },
    ]),
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule { }
