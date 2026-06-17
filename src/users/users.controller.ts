import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService, UserWithoutPassword } from './users.service';
import { User } from './user.schema';
@ApiTags('USERS')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    description: 'The data to create a new user',
    required: true,
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'johndoe@example.com' },
        password: { type: 'string', example: 'P@ssw0rd123' },
      }
    }
  })
  async createUser(@Body() createUserDto: User) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully.',
  })
  async getAllUsers(): Promise<UserWithoutPassword[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully retrieved.',
  })
  @ApiParam({ name: 'id', description: 'The ID of the user to retrieve', example: '6a326fc193d912e1dbe5a3f7' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserById(@Param('id') id: string): Promise<UserWithoutPassword | null> {
    return this.userService.findOne(id);
  }

  @Post(':id/role')
  @ApiOperation({ summary: 'Change a user role' })
  @ApiResponse({
    status: 200,
    description: 'The user role has been successfully changed.',
  })
  @ApiParam({ name: 'id', description: 'The ID of the user to change role', example: '6a326fc193d912e1dbe5a3f7' })
  @ApiBody({
    description: 'The new role for the user',
    required: true,
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', example: 'admin' },
      }
    }
  })
  async changeUserRole(@Param('id') id: string, @Body('role') role: string): Promise<UserWithoutPassword | null> {
    return this.userService.changeRole(id, role);
  }

  @Post(':id/image')
  @ApiOperation({ summary: 'Add or update user profile image' })
  @ApiResponse({
    status: 200,
    description: 'The user profile image has been successfully added or updated.',
  })
  @ApiParam({ name: 'id', description: 'The ID of the user to add or update profile image', example: '6a326fc193d912e1dbe5a3f7' })
  @ApiBody({
    description: 'The URL of the new profile image for the user',
    required: true,
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', example: 'https://example.com/profile.jpg' },
      }
    }
  })
  async addOrUpdateUserProfileImage(@Param('id') id: string, @Body('imageUrl') imageUrl: string): Promise<UserWithoutPassword | null> {
    return this.userService.addImageProfile(id, imageUrl);
  }

  @Post(':id/image/remove')
  @ApiOperation({ summary: 'Remove user profile image' })
  @ApiResponse({
    status: 200,
    description: 'The user profile image has been successfully removed.',
  })
  @ApiParam({ name: 'id', description: 'The ID of the user to remove profile image', example: '6a326fc193d912e1dbe5a3f7' })
  async removeUserProfileImage(@Param('id') id: string): Promise<UserWithoutPassword | null> {
    return this.userService.removeImageProfile(id);
  }
}