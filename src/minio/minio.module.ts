import { Module } from '@nestjs/common'
import { MinioService } from './minio.service'

@Module({
  providers: [MinioService],
  exports: [MinioService], // 🔥 สำคัญมาก
})

export class MinioModule { }