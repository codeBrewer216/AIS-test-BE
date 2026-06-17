import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type SeatDocument = Seat & Document

export type SeatStatus = 'available' | 'held' | 'booked'

@Schema({ timestamps: true })
export class Seat {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  screeningId!: Types.ObjectId

  @Prop({ type: String, required: true })
  seatId!: string // e.g., A5

  @Prop({ type: String, required: true })
  row!: string

  @Prop({ type: Number, required: true })
  number!: number

  @Prop({ type: String, required: true, default: 'available' })
  status!: SeatStatus

  @Prop({ type: String, required: false })
  holdId?: string

  @Prop({ type: Date, required: false })
  holdExpiresAt?: Date

  @Prop({ type: String, required: false })
  bookingId?: string
}

export const SeatSchema = SchemaFactory.createForClass(Seat)
SeatSchema.index({ screeningId: 1, seatId: 1 }, { unique: true })
