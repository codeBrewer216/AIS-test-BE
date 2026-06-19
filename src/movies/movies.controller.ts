import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { Movies } from './moives.schema';
import { JwtRedisGuard } from '@/guard/jwt-redis.guard';
import { Roles } from '@/guard/roles.decorator';
import { RolesGuard } from '@/guard/roles.guard';

@ApiTags('MOVIES')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @Post()
  @UseGuards(JwtRedisGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiBody({
    description: 'Create a new movie',
    type: Movies
  })
  async create(@Body() body: Movies) {
    return await this.moviesService.create(body)
  }

  @Get()
  async findAll() {
    return await this.moviesService.findAll()
  }

  @Get(':id')
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async findOne(@Param('id') id: string) {
    return await this.moviesService.findOne(id)
  }

  @Put(':id')
  @UseGuards(JwtRedisGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async update(@Param('id') id: string, @Body() body: Movies) {
    return await this.moviesService.update(id, body)
  }

  @Delete(':id')
  @UseGuards(JwtRedisGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async remove(@Param('id') id: string) {
    return await this.moviesService.remove(id)
  }

  @Get(':id/showtimes')
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async showtimes(@Param('id') id: string) {
    return await this.moviesService.getShowtimes(id)
  }
}
