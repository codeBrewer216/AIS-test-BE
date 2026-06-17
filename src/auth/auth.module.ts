import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '@/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisClientProvider } from './RedisProvider';
import { JwtRedisGuard } from '@/guard/jwt-redis.guard';

@Module({
  imports: [UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RedisClientProvider, JwtRedisGuard],
  exports: [JwtRedisGuard],
})
export class AuthModule { }
