import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document } from 'mongoose'

@Schema()
export class Movies extends Document {
  @Prop({ type: String, required: true })
  @ApiProperty({
    example: 'Lion King',
    description: 'The name of the movie',
  })
  name!: string

  @Prop({ type: String, required: true })
  @ApiProperty({
    example: 'Animation',
    description: 'The type of the movie',
  })
  type!: string

  @Prop({ type: String, required: true })
  @ApiProperty({
    example: 'A young lion prince flees his kingdom',
    description: 'The description of the movie',
  })
  description!: string

  @Prop({ type: Number, required: false })
  @ApiProperty({
    example: 118,
    description: 'Length of the movie in minutes',
  })
  length: number

  @Prop({ type: String, required: false })
  @ApiProperty({
    example: 'https://example.com/poster.jpg',
    description: 'Poster image URL',
  })
  poster?: string

  @Prop({ type: Date, required: true })
  @ApiProperty({
    example: '2023-01-01 10:00:00',
    description: 'The start date of the movie',
  })
  startDate!: Date

  @Prop({ type: Date, required: true })
  @ApiProperty({
    example: '2023-01-31 23:59:59',
    description: 'The end date of the movie',
  })
  endDate!: Date

}

export const MoviesSchema = SchemaFactory.createForClass(Movies)
