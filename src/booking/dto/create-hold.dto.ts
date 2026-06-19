import { ApiProperty } from '@nestjs/swagger'

export class CreateHoldDto {
  @ApiProperty({ description: 'Screening (room) ID', example: '64a33a0a8adb4c876d300924' })
  rooms!: string

  @ApiProperty({ description: 'Movie ID for this booking', example: '6a33a0a8adb4c876d300924' })
  movieId!: string

  @ApiProperty({ description: 'Array of seat IDs to hold (e.g. A1, A2)', type: [String], example: ['A1', 'A2'] })
  seatIds!: string[]
}
