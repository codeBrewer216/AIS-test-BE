import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Movies } from './moives.schema';
import { Screening } from './screening.schema';
import { Seat } from './seat.schema';
import { auditLogger } from '@/logger/winston-mongodb.logger';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movies.name) private movieModel: Model<Movies>,
    @InjectModel(Screening.name) private screeningModel: Model<Screening>,
    @InjectModel(Seat.name) private seatModel: Model<Seat>,
  ) { }

  async create(dto: Movies): Promise<Movies> {
    if (dto.name == null || dto.type == null) {
      auditLogger.error(`Missing required fields in movie creation: ${JSON.stringify(dto)}`)
      throw new BadRequestException('Missing required fields')
    }
    if (typeof dto.name === 'string') dto.name = dto.name.trim()
    if (typeof dto.type === 'string') dto.type = dto.type.trim()


    const created = await this.movieModel.create(dto)

    // creation no longer auto-generates screenings
    auditLogger.info(`Created new movie: ${JSON.stringify(created)}`)
    return created
  }

  async findAll() {
    return this.movieModel.find().sort({ createdAt: -1 }).lean().exec()
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      auditLogger.error(`Invalid movie id: ${id}`)
      throw new BadRequestException('Invalid id')
    }
    const movie = await this.movieModel.findById(id).lean().exec()
    if (!movie) {
      auditLogger.error(`Movie not found: ${id}`)
      throw new NotFoundException('Movie not found')
    }
    return movie
  }

  async update(id: string, dto: Movies): Promise<Movies> {
    if (!Types.ObjectId.isValid(id)) {
      auditLogger.error(`Invalid movie id: ${id}`)
      throw new BadRequestException('Invalid id')
    }
    const existing = await this.movieModel.findById(id).exec()
    if (!existing) {
      auditLogger.error(`Movie not found: ${id}`)
      throw new NotFoundException('Movie not found')
    }

    // enforce canonical rooms
    ; (dto as any).rooms = ['Room-1', 'Room-2', 'Room-3']

    const updated = await this.movieModel.findByIdAndUpdate(id, dto, { returnDocument: 'after' }).lean().exec()

    // updating movie dates does not affect screenings here

    return updated
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      auditLogger.error(`Invalid movie id: ${id}`)
      throw new BadRequestException('Invalid id')
    }
    const deleted = await this.movieModel.findByIdAndDelete(id).lean().exec()
    if (!deleted) {
      auditLogger.error(`Movie not found: ${id}`)
      throw new NotFoundException('Movie not found')
    }

    // removal no longer cascades to screenings/seats from this service
    auditLogger.info(`Deleted movie: ${JSON.stringify(deleted)}`)
    return { ok: true }
  }

  async getShowtimes(movieId: string): Promise<{ movie: Movies; showtimes: Array<any>; length: number }> {
    if (!Types.ObjectId.isValid(movieId)) {
      auditLogger.error(`Invalid movie id: ${movieId}`)
      throw new BadRequestException('Invalid id')
    }
    const movie = await this.movieModel.findById(movieId).lean().exec()
    if (!movie) {
      auditLogger.error(`Movie not found: ${movieId}`)
      throw new NotFoundException('Movie not found')
    }

    // find all screenings for this movie
    const screenings = await this.screeningModel.find({ movieId: new Types.ObjectId(movieId) }).sort({ startsAt: 1 }).lean().exec()

    // for each screening, attach seat availability
    const showtimes = await Promise.all(screenings.map(async (s) => {
      const seats = await this.seatModel.find({ screeningId: s._id }).lean().exec()
      const seatSummary = seats.map(seat => ({ seatId: seat.seatId, status: seat.status }))
      const availableCount = seats.filter(seat => seat.status === 'available').length
      return {
        screeningId: s._id,
        room: s.room,
        startsAt: s.startsAt,
        capacity: s.capacity,
        availableCount,
        seats: seatSummary,
      }
    }))

    return { movie, showtimes, length: movie.length }
  }
}
