import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type BookingDocument = Booking & Document

export type BookingStatus = 'held' | 'confirmed' | 'cancelled'

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Screening' })
  screeningId!: Types.ObjectId

  @Prop({ type: String, required: true })
  room!: string

  @Prop({ type: Date, required: true })
  startsAt!: Date

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Movies',
  })
  movieId!: Types.ObjectId

  @Prop({
    type: [
      {
        seatId: { type: String, required: true },
        seatRef: { type: Types.ObjectId, required: true, ref: 'Seat' },
      },
    ],
    required: true,
  })
  seats!: Array<{ seatId: string; seatRef: Types.ObjectId }>

  @Prop({ type: Types.ObjectId, required: false, ref: 'User' })
  userId?: Types.ObjectId

  @Prop({ type: String, required: true, default: 'held' })
  status!: BookingStatus

  @Prop({ type: String, required: false })
  holdId?: string

  @Prop({ type: Date, required: false })
  expiresAt?: Date

}

export const BookingSchema = SchemaFactory.createForClass(Booking)

BookingSchema.index({ screeningId: 1 })
BookingSchema.index({ holdId: 1 })

