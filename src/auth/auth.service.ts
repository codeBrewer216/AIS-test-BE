import { UsersService, } from '../users/users.service';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import type { RedisClientType } from 'redis';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (user && isMatch) {
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const payload = {
      email: user.email,
      sub: (user)._id ?? (user).id,
      role: (user).role,
      username: (user).username,
    };
    const token = this.jwtService.sign(payload);
    await this.redis.set(
      `token:${token}`,
      JSON.stringify(user),
      {
        EX: 60 * 60 * 24,
      },
    );
    return {
      access_token: token,
      payload,
    };
  }

  async validateToken(token: string): Promise<any> {
    const userData = await this.redis.get(`token:${token}`);
    if (typeof userData === 'string') {
      return JSON.parse(userData);
    }
    return null;
  }

  async getPayloadFromToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verify(token);
      return payload;
    } catch (_error) {
      return null;
    }
  }

  async logout(token: string) {
    await this.redis.del(`token:${token}`);
  }
}
