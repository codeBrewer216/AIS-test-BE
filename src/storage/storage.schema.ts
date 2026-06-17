import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Storage extends Document {
  @Prop({ type: String }) filename!: string
  @Prop({ type: String }) originalName!: string
  @Prop({ type: String }) mimeType!: string
  @Prop({ type: Number }) size!: number
  @Prop({ type: Boolean }) isPublic!: boolean
  @Prop({ type: String }) url!: string
}

export const StorageSchema = SchemaFactory.createForClass(Storage)