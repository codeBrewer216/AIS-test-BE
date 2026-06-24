import { Controller, Post, Body, Get, UseGuards, Req, BadRequestException, Param, Res } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtRedisGuard } from '../guard/jwt-redis.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { JwtRequest } from '../auth/auth.controller';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './booking.schema';
import type { Response } from 'express';

@ApiTags('BOOKINGS')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateBookingDto })
  async create(
    @Body() dto: CreateBookingDto,
    @Req() req: JwtRequest,
  ): Promise<Booking> {
    const userID = req.user._id
    // attach authenticated user id to booking payload
    const payload = Object.assign({}, dto, { userId: userID })
    return this.bookingService.createBooking(payload)
  }

  @Get('user')
  @ApiOperation({ summary: 'Get bookings for the authenticated user' })
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  async getUserBookings(@Req() req: JwtRequest) {
    const tokenUser = req?.user._id
    if (!tokenUser) throw new BadRequestException('Invalid user id')
    // return
    return this.bookingService.getBookingsByUser(tokenUser)
  }

  @Get(':id/export-pdf')
  @ApiOperation({ summary: 'Export booking details as PDF' })
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async exportBookingPdf(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.bookingService.exportBookingPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="booking-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID' })
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async getBookingById(@Param('id') id: string) {
    return this.bookingService.getBookingById(id)
  }
}
