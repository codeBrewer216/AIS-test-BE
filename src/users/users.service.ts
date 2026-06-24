import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { authLogger } from '@/logger/winston-mongodb.logger';

export type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }
  passwordVerify(password: string) {
    if (!password || password.length === 0) {
      return false
    }
    if (password.length < 8 || password.length > 128) {
      return false
    }
    if (!/[A-Z]/.test(password)) {
      return false
    }
    if (!/[a-z]/.test(password)) {
      return false
    }
    if (!/[0-9]/.test(password)) {
      return false
    }
    if (!/[@$!%*?&]/.test(password)) {
      return false
    }
    return true
  }

  async create(user: User): Promise<User> {
    try {
      if (user.password) {
        if (this.passwordVerify(user.password) === false) {
          authLogger.error(`Password does not meet complexity requirements for user: ${user.email}`);
          throw new Error('Password does not meet complexity requirements');
        }
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      }
      user.role = 'user'
      const createdUser = new this.userModel(user);

      return createdUser.save();
    } catch (_error) {
      authLogger.error(`User creation failed for user: ${user.email}`);
      throw new BadRequestException('User creation failed')
    }
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    return this.userModel
      .find()
      .select('-password')
      .lean()
      .exec();
  }


  async findOne(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.userModel.findById(id).select('-password').lean().exec();
    if (!user) {
      authLogger.error(`User not found: ${id}`);
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async update(id: string, user: User): Promise<UserWithoutPassword | null> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, user, { returnDocument: 'after' }).select('-password').lean().exec();
    if (!updatedUser) {
      authLogger.error(`User not found: ${id}`);
      throw new BadRequestException('User not found');
    }
    return updatedUser;
  }

  async delete(id: string): Promise<UserWithoutPassword | null> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).select('-password').lean().exec();
    if (!deletedUser) {
      authLogger.error(`User not found: ${id}`);
      throw new BadRequestException('User not found');
    }
    return deletedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean().exec();
  }

  async changeRole(id: string, role: string): Promise<UserWithoutPassword | null> {
    const user = await this.userModel.findById(id).select('-password').lean().exec();
    if (!user) {
      authLogger.error(`User not found: ${id}`);
      throw new BadRequestException('User not found');
    }
    if (!['user', 'admin'].includes(role)) {
      authLogger.error(`Invalid role: ${role} for user: ${id}`);
      throw new BadRequestException('Invalid role');
    } else if (user.role === role) {
      authLogger.error(`User already has this role: ${role} for user: ${id}`);
      throw new BadRequestException('User already has this role');
    }
    return this.userModel.findByIdAndUpdate(id, { role }, { returnDocument: 'after' }).select('-password').lean().exec();
  }
  async addImageProfile(id: string, imageUrl: string): Promise<UserWithoutPassword | null> {
    const user = await this.userModel.findById(id).select('-password').lean().exec();
    if (!user) {
      authLogger.error(`User not found: ${id}`);
      throw new BadRequestException('User not found');
    }
    return this.userModel.findByIdAndUpdate(id, { imageProfile: imageUrl }, { returnDocument: 'after' }).select('-password').lean().exec();
  }
  async removeImageProfile(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.userModel.findById(id).select('-password').lean().exec();
    if (!user) {
      authLogger.error(`User not found: ${id}`);
      throw new BadRequestException('User not found');
    }
    return this.userModel.findByIdAndUpdate(id, { imageProfile: null }, { returnDocument: 'after' }).select('-password').lean().exec();
  }
}
