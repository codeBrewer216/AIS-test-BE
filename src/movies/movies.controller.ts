import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Movies } from './moives.schema';
import { JwtRedisGuard } from '../guard/jwt-redis.guard';
import { Roles } from '../guard/roles.decorator';
import { RolesGuard } from '../guard/roles.guard';

@ApiTags('MOVIES')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new movie' })
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
  @ApiOperation({ summary: 'Get all movies' })
  @UseGuards(JwtRedisGuard)
  async findAll() {
    return await this.moviesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a movie by ID' })
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async findOne(@Param('id') id: string) {
    return await this.moviesService.findOne(id)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a movie by ID' })
  @UseGuards(JwtRedisGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async update(@Param('id') id: string, @Body() body: Movies) {
    return await this.moviesService.update(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a movie by ID' })
  @UseGuards(JwtRedisGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async remove(@Param('id') id: string) {
    return await this.moviesService.remove(id)
  }

  @Get(':id/showtimes')
  @ApiOperation({ summary: 'Get showtimes for a movie by ID' })
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async showtimes(@Param('id') id: string) {
    return await this.moviesService.getShowtimes(id)
  }
}
