
import { Injectable, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking } from './booking.schema';
import { Seat } from '@/movies/seat.schema';
import { Screening } from '@/movies/screening.schema';
import { PdfService } from './pdf.service';

export class CreateBookingDto {
  rooms: string;
  movieId: string;
  seatIds: string[];
  startsAt?: string;
}

@Injectable()
export class BookingService {
  constructor(

    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Seat.name) private seatModel: Model<any>,
    @InjectModel(Screening.name) private screeningModel: Model<Screening>,
    private readonly pdfService: PdfService,
  ) { }

  private async ensureDailyShowtimes(movieId: Types.ObjectId, roomName: string) {
    const times = [10, 14, 18]
    const today = new Date()
    for (const hour of times) {
      const startsAt = new Date(today)
      startsAt.setHours(hour, 0, 0, 0)
      // if startsAt already passed for today, keep it (we may create for past too)
      const exists = await this.screeningModel.findOne({ movieId, room: roomName, startsAt }).lean().exec()
      if (!exists) {
        try {
          const created = await this.screeningModel.create({ movieId, room: roomName, startsAt, capacity: 50 })
          await this.ensureScreeningSeats(created._id)
        } catch (_e) {
          // ignore concurrent creates
        }
      }
    }
  }

  private async ensureScreeningSeats(screeningId: Types.ObjectId) {
    const existing = await this.seatModel.countDocuments({ screeningId }).exec()
    if (existing > 0) return
    const rows = ['A', 'B', 'C', 'D', 'E']
    const seats: Partial<Seat>[] = []
    for (const row of rows) {
      for (let i = 1; i <= 10; i++) {
        seats.push({ screeningId, seatId: `${row}${i}`, row, number: i, status: 'available' })
      }
    }
    try {
      await this.seatModel.insertMany(seats)
    } catch (_err) {
      // ignore duplicates or race inserts
    }
  }

  async createBooking(dto: CreateBookingDto & { userId?: string }): Promise<Booking> {
    const {
      rooms,
      movieId,
      seatIds,
      userId,
    }: {
      rooms: string;
      movieId: string;
      seatIds: string[];
      userId?: string;
    } = dto;
    if (!rooms || !movieId || !Array.isArray(seatIds) || seatIds.length === 0) {
      throw new BadRequestException('Missing required fields')
    }

    if (!Types.ObjectId.isValid(movieId)) throw new BadRequestException('Invalid movieId')
    const movieObjId = new Types.ObjectId(movieId)
    let screeningObjId: Types.ObjectId
    if (Types.ObjectId.isValid(rooms)) {
      screeningObjId = new Types.ObjectId(rooms)
    } else {
      // normalize and validate canonical room names
      const roomMap: Record<string, string> = {
        'room-1': 'Room-1',
        'room-2': 'Room-2',
        'room-3': 'Room-3',
      }
      const roomName = roomMap[rooms.toLowerCase()]
      if (!roomName) throw new BadRequestException('Invalid room; valid rooms are Room-1, Room-2, Room-3')

      // allow choosing a specific time slot or startsAt from DTO
      let targetStartsAt: Date | undefined
      const startsAtRaw = (dto && dto.startsAt) || undefined
      if (startsAtRaw) {
        // accept formats like "10.00", "10:00" or ISO
        const hmMatch = String(startsAtRaw).match(/^(\d{1,2})(?:\.|:)(\d{2})$/)
        if (hmMatch) {
          const h = parseInt(hmMatch[1], 10)
          const m = parseInt(hmMatch[2], 10)
          targetStartsAt = new Date()
          targetStartsAt.setHours(h, m, 0, 0)
        } else {
          const parsed = new Date(startsAtRaw)
          if (!isNaN(parsed.getTime())) targetStartsAt = parsed
        }
      }

      // ensure standard daily showtimes exist
      await this.ensureDailyShowtimes(movieObjId, roomName)
      const now = new Date()
      let screening: any = null
      if (targetStartsAt) {
        // find or create screening at the exact targetStartsAt
        screening = await this.screeningModel.findOne({ room: roomName, movieId: movieObjId, startsAt: targetStartsAt }).lean().exec()
        if (!screening) {
          const created = await this.screeningModel.create({ movieId: movieObjId, room: roomName, startsAt: targetStartsAt, capacity: 50 })
          await this.ensureScreeningSeats(created._id)
          screening = created
        }
      }
      if (!screening) {
        screening = await this.screeningModel.findOne({ room: roomName, movieId: movieObjId, startsAt: { $gte: now } }).sort({ startsAt: 1 }).lean().exec()
        if (!screening) {
          screening = await this.screeningModel.findOne({ room: roomName, movieId: movieObjId }).sort({ startsAt: 1 }).lean().exec()
        }
      }
      screeningObjId = screening._id
    }

    // ensure seats exist for this screening (rooms -> screening id)
    await this.ensureScreeningSeats(screeningObjId)

    // load screening doc to record showtime in booking
    const screeningDoc = await this.screeningModel.findById(screeningObjId).lean().exec()
    if (!screeningDoc) throw new BadRequestException('Screening not found')

    // Attempt optimistic, transaction-free claim: atomically mark seats as booked
    const bookingId = new Types.ObjectId()
    let updateRes: any
    try {
      const setObj: any = { status: 'booked', bookingId }
      if (userId && Types.ObjectId.isValid(userId)) setObj.bookingUser = new Types.ObjectId(userId)
      updateRes = await this.seatModel.updateMany({ screeningId: screeningObjId, seatId: { $in: seatIds }, status: 'available' }, { $set: setObj }).exec()
    } catch (_err) {
      throw new BadRequestException('Failed to claim seats')
    }

    const claimed = (updateRes.modifiedCount ?? (updateRes).nModified ?? 0)
    if (claimed !== seatIds.length) {
      // rollback any partial claims
      try {
        await this.seatModel.updateMany({ screeningId: screeningObjId, bookingId }, { $set: { status: 'available' }, $unset: { bookingId: '', bookingUser: '' } }).exec()
      } catch (_e) {
        // ignore rollback errors
      }

      // determine which seats are missing or unavailable to return better error
      const foundSeats = await this.seatModel
        .find({
          screeningId: screeningObjId,
          seatId: { $in: seatIds },
        })
        .lean<Seat[]>()
        .exec();
      const foundIds = new Set(foundSeats.map(s => s.seatId))
      const missing = seatIds.filter(id => !foundIds.has(id))
      const unavailable = foundSeats.filter(s => s.status !== 'available').map(s => ({ seatId: s.seatId, status: s.status }))

      let msg = 'One or more seats are already held/booked'
      const parts: string[] = []
      if (missing.length) parts.push(`missing seats: ${missing.join(', ')}`)
      if (unavailable.length) parts.push(`unavailable: ${unavailable.map(u => `${u.seatId}(${u.status})`).join(', ')}`)
      if (parts.length) msg = `${msg} (${parts.join('; ')})`

      throw new BadRequestException(msg)
    }

    // fetch claimed seats
    const seats = await this.seatModel.find({ screeningId: screeningObjId, bookingId }).exec()

    // create booking document referencing claimed seats
    try {
      const booking = await this.bookingModel.create({
        _id: bookingId,
        screeningId: screeningObjId,
        room: screeningDoc.room,
        startsAt: screeningDoc.startsAt,
        movieId: new Types.ObjectId(movieId),
        seats: seats.map((s) => ({
          seatId: s.seatId,
          seatRef: s._id,
        })),
        userId: userId
          ? new Types.ObjectId(userId)
          : undefined,
        status: 'confirmed',
      });
      return booking;
    } catch (err) {
      await this.seatModel.updateMany(
        { screeningId: screeningObjId, bookingId },
        {
          $set: { status: 'available' },
          $unset: {
            bookingId: '',
            bookingUser: '',
          },
        },
      ).exec();
      throw err;
    }
  }

  async getBookingsByUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user id')
    const uid = new Types.ObjectId(userId)
    // const bookings = await this.bookinƒgModel.find({ userId: uid }).sort({ createdAt: -1 }).populate('userId', 'username email').lean().exec()

    const bookings = await this.bookingModel
      .find({ userId: uid })
      .sort({ createdAt: -1 })
      .populate('userId', 'username email')
      .populate('movieId', 'name')
      .lean()
      .exec()

    return bookings.map((booking) => ({
      ...booking,
      movieName: (booking.movieId as any)?.name
    }))
  }

  async getBookingById(bookingId: string) {
    if (!Types.ObjectId.isValid(bookingId)) throw new BadRequestException('Invalid booking id')
    const bid = new Types.ObjectId(bookingId)
    const booking = await this.bookingModel.findById(bid).populate('movieId', 'name poster').lean().exec()
    if (!booking) throw new BadRequestException('Booking not found')
    return booking
  }

  async exportBookingPdf(bookingId: string) {
    if (!Types.ObjectId.isValid(bookingId)) throw new BadRequestException('Invalid booking id')
    const bid = new Types.ObjectId(bookingId)
    const booking = await this.bookingModel.findById(bid).populate('movieId', 'name poster').lean().exec()
    if (!booking) throw new BadRequestException('Booking not found')
    // generate PDF with booking details (for simplicity, using the same PDF for all bookings here)
    const pdfBytes = await this.pdfService.generatePdf(booking)
    return pdfBytes
  }
}
