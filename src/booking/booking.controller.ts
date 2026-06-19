import { Controller, Post, Body, Get, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtRedisGuard } from '@/guard/jwt-redis.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import type { JwtRequest } from '@/auth/auth.controller';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateBookingDto })
  async create(@Body() dto: CreateBookingDto, @Req() req: JwtRequest) {
    const userID = req.user._id
    // attach authenticated user id to booking payload
    const payload = Object.assign({}, dto, { userId: userID })
    return this.bookingService.createBooking(payload)
  }

  @Get('user/:userId')
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  async getUserBookings(@Req() req: JwtRequest) {
    const tokenUser = req?.user._id
    console.log(tokenUser)
    if (!tokenUser) throw new BadRequestException('Invalid user id')
    // return
    return this.bookingService.getBookingsByUser(tokenUser)
  }
}
