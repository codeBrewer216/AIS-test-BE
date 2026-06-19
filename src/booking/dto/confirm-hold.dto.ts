import { ApiProperty } from '@nestjs/swagger'

export class ConfirmHoldDto {
  @ApiProperty({ description: 'Hold ID returned from hold call', example: '60f7c2e5b4d3a2a1f0e12345' })
  holdId!: string
}
