import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Screening {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  movieId!: Types.ObjectId

  @Prop({ type: Date, required: true })
  startsAt!: Date

  @Prop({ type: String, required: true })
  room!: string

  @Prop({ type: Number, required: true, default: 50 })
  capacity!: number
}

export const ScreeningSchema = SchemaFactory.createForClass(Screening)
