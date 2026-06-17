import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Movies } from './moives.schema';
import { Screening } from './screening.schema'
import { Seat } from './seat.schema'


@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movies.name) private movieModel: Model<Movies>,
    @InjectModel(Screening.name) private screeningModel: Model<Screening>,
    @InjectModel(Seat.name) private seatModel: Model<Seat>,
  ) { }

  async create(dto: Movies): Promise<Movies> {
    if (!dto.name || !dto.type) {
      throw new BadRequestException('Missing required fields')
    }
    return this.movieModel.create(dto)
  }

  async findAll(
  ) {
    return this.movieModel.find().sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id')
    const movie = await this.movieModel.findById(id).lean().exec()
    if (!movie) throw new NotFoundException('Movie not found')
    return movie
  }

  async update(id: string, dto: Movies): Promise<Movies> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id')
    const updated = await this.movieModel.findByIdAndUpdate(id, dto, { new: true }).lean().exec()
    if (!updated) throw new NotFoundException('Movie not found')
    return updated
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id')
    const deleted = await this.movieModel.findByIdAndDelete(id).lean().exec()
    if (!deleted) throw new NotFoundException('Movie not found')
    // optional: remove screenings and seats (find screenings first)
    const screenings = await this.screeningModel.find({ movieId: deleted._id }).lean().exec()
    const screeningIds = screenings.map(s => s._id)
    await this.seatModel.deleteMany({ screeningId: { $in: screeningIds } })
    await this.screeningModel.deleteMany({ movieId: deleted._id })
    return { ok: true }
  }

  async getShowtimes(movieId: string): Promise<{ movie: Movies, showtimes: Date, length: number }> {
    if (!Types.ObjectId.isValid(movieId)) throw new BadRequestException('Invalid id')
    const movie = await this.movieModel.findById(movieId).lean().exec()
    if (!movie) throw new NotFoundException('Movie not found')
    return {
      movie,
      showtimes: movie.startDate,
      length: movie.length,
    }
  }
}
