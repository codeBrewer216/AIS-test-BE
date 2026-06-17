import {
  // forwardRef,
  Module
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageSchema, Storage } from './storage.schema';
import { MinioModule } from '../minio/minio.module';
// import { JwtRedisGuard } from '../auth/guard/jwt-redis.guard';
// import { AuthModule } from '../auth/auth.module';
// import { RedisClientProvider } from '../auth/RedisProvider';
// import { UserModule } from '../user/user.module';


@Module({
  imports: [
    // forwardRef(() => AuthModule),
    // forwardRef(() => UserModule),
    MinioModule,
    MongooseModule.forFeature([
      { name: Storage.name, schema: StorageSchema },

    ]),
  ],
  providers: [StorageService,
    //  RedisClientProvider, JwtRedisGuard
  ],
  controllers: [StorageController,],
  exports: [StorageService]
})
export class StorageModule { }
