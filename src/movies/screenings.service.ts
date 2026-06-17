import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection, Types } from 'mongoose'
import { Screening, ScreeningDocument } from './screening.schema'
import { Seat, SeatDocument } from './seat.schema'

@Injectable()
export class ScreeningsService {
  constructor(
    @InjectModel(Screening.name) private screeningModel: Model<ScreeningDocument>,
    @InjectModel(Seat.name) private seatModel: Model<SeatDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async createScreening(movieId: string, startsAt: Date, room = 'Room-1') {
    const screening = await this.screeningModel.create({ movieId: new Types.ObjectId(movieId), startsAt, room, capacity: 50 })
    // seed seats: 5 rows (A-E) x 10 seats = 50
    const seats: Partial<Seat>[] = []
    const rows = ['A', 'B', 'C', 'D', 'E']
    for (const row of rows) {
      for (let i = 1; i <= 10; i++) {
        seats.push({ screeningId: screening._id, seatId: `${row}${i}`, row, number: i, status: 'available' })
      }
    }
    await this.seatModel.insertMany(seats)
    return screening
  }

  async holdSeats(screeningId: string, seatIds: string[], holdId: string, ttlSeconds = 300) {
    const session = await this.connection.startSession()
    try {
      let result
      await session.withTransaction(async () => {
        const screeningObjId = new Types.ObjectId(screeningId)
        const now = new Date()
        const expiresAt = new Date(now.getTime() + ttlSeconds * 1000)
        result = await this.seatModel.updateMany(
          { screeningId: screeningObjId, seatId: { $in: seatIds }, status: 'available' },
          { $set: { status: 'held', holdId, holdExpiresAt: expiresAt } },
          { session },
        )
        if (result.modifiedCount !== seatIds.length) {
          throw new ConflictException('One or more seats are no longer available')
        }
      })
      return { ok: true, holdId, expiresAt: new Date(Date.now() + ttlSeconds * 1000) }
    } finally {
      await session.endSession()
    }
  }

  async confirmHold(holdId: string, bookingId: string) {
    const session = await this.connection.startSession()
    try {
      let result
      await session.withTransaction(async () => {
        result = await this.seatModel.updateMany(
          { holdId, status: 'held' },
          { $set: { status: 'booked', bookingId }, $unset: { holdId: '', holdExpiresAt: '' } },
          { session },
        )
        if (result.matchedCount === 0) {
          throw new NotFoundException('Hold not found or already expired')
        }
      })
      return { ok: true, bookingId, seatsBooked: result.modifiedCount }
    } finally {
      await session.endSession()
    }
  }

  async releaseExpiredHolds() {
    // called by a cron or background job: release holds that expired
    const now = new Date()
    const res = await this.seatModel.updateMany({ status: 'held', holdExpiresAt: { $lt: now } }, { $set: { status: 'available' }, $unset: { holdId: '', holdExpiresAt: '' } })
    return { released: res.modifiedCount }
  }
}
