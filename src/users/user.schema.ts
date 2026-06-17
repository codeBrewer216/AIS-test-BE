import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document } from 'mongoose'

@Schema()
export class User extends Document {
  @Prop({ type: String, required: true })
  @ApiProperty({
    example: 'johndoe',
    description: 'The username of the user',
  })
  username!: string

  @Prop({ type: String, required: true, unique: true })
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email of the user',
  })
  email!: string
  @Prop({ type: String, required: true })
  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  password!: string
  @Prop({ type: String, required: true })
  @ApiProperty({
    example: 'user',
    description: 'The role of the user',
  })
  role!: string

  @Prop({ type: String, default: null, nullable: true })
  imageUrl!: string
}

export const UserSchema = SchemaFactory.createForClass(User)
