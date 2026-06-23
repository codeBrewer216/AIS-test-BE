import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MoviesModule } from './movies/movies.module';
import { BookingModule } from './booking/booking.module';
import KeyvRedis from '@keyv/redis'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        dbName: 'main_db',
        minPoolSize: 100,
        maxPoolSize: 100,
      }),
    }),
    MongooseModule.forRootAsync({
      connectionName: 'logsConnection',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        dbName: 'logs',
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('REDIS_HOST=', config.get('REDIS_HOST'));
        console.log('REDIS_PORT=', config.get('REDIS_PORT'));
        return {
          stores: [
            new KeyvRedis(
              `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
            ),
          ],
        };
      },
    }),
    UsersModule,
    AuthModule,
    MoviesModule,
    BookingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
