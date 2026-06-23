import {
  forwardRef,
  // forwardRef,
  Module
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageSchema, Storage } from './storage.schema';
import { MinioModule } from '../minio/minio.module';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => MinioModule),
    MongooseModule.forFeature([
      { name: Storage.name, schema: StorageSchema },

    ]),
  ],
  providers: [StorageService,
  ],
  controllers: [StorageController,],
  exports: [StorageService]
})
export class StorageModule { }
