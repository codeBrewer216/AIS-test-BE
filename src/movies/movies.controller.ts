import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { Movies } from './moives.schema';

@ApiTags('MOVIES')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @Post()
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
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async findOne(@Param('id') id: string) {
    return await this.moviesService.findOne(id)
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async update(@Param('id') id: string, @Body() body: Movies) {
    return await this.moviesService.update(id, body)
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async remove(@Param('id') id: string) {
    return await this.moviesService.remove(id)
  }

  @Get(':id/showtimes')
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async showtimes(@Param('id') id: string) {
    return await this.moviesService.getShowtimes(id)
  }
}
