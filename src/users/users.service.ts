import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'

type UserWithoutPassword = Omit<User, 'password'>;

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
          throw new Error('Password does not meet complexity requirements');
        }
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      }
      const createdUser = new this.userModel(user);

      return createdUser.save();
    } catch (_error) {
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
    return this.userModel.findById(id).select('-password').lean().exec();
  }

  async update(id: string, user: User): Promise<UserWithoutPassword | null> {
    return this.userModel.findByIdAndUpdate(id, user, { new: true }).select('-password').lean().exec();
  }

  async delete(id: string): Promise<UserWithoutPassword | null> {
    return this.userModel.findByIdAndDelete(id).select('-password').lean().exec();
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    return this.userModel.findOne({ email }).select('-password').lean().exec();
  }

  async changeRole(id: string, role: string): Promise<UserWithoutPassword | null> {
    const user = await this.userModel.findById(id).select('-password').lean().exec();
    if (!user) {
      throw new Error('User not found');
    }
    if (!['user', 'admin'].includes(role)) {
      throw new Error('Invalid role');
    } else if (user.role === role) {
      throw new Error('User already has this role');
    }
    return this.userModel.findByIdAndUpdate(id, { role }, { new: true }).select('-password').lean().exec();
  }
  async addImageProfile(id: string, imageUrl: string): Promise<UserWithoutPassword | null> {
    const user = await this.userModel.findById(id).select('-password').lean().exec();
    if (!user) {
      throw new Error('User not found');
    }
    return this.userModel.findByIdAndUpdate(id, { imageProfile: imageUrl }, { new: true }).select('-password').lean().exec();
  }
  async removeImageProfile(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.userModel.findById(id).select('-password').lean().exec();
    if (!user) {
      throw new Error('User not found');
    }
    return this.userModel.findByIdAndUpdate(id, { imageProfile: null }, { new: true }).select('-password').lean().exec();
  }
}
