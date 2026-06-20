import { Injectable, OnModuleInit } from '@nestjs/common'
import { Client } from 'minio'
import { randomUUID } from 'crypto'
@Injectable()
export class MinioService implements OnModuleInit {
  private minio = new Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: Number(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
  })

  private bucket = process.env.MINIO_BUCKET!

  async onModuleInit() {
    const exists = await this.minio.bucketExists(this.bucket)

    if (!exists) {
      await this.minio.makeBucket(this.bucket, 'us-east-1')
    }
    return true
  }

  async upload(file: Express.Multer.File) {
    const filename = `${randomUUID()}` + file.mimetype.replace('image/', '.')

    await this.minio.putObject(
      this.bucket,
      filename,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    )

    this.minio.presignedGetObject(this.bucket, filename, 24 * 60 * 60) // 1 day in seconds
    return {
      filename,
      url: `${process.env.MINIO_PUBLIC_URL}/${this.bucket}/${filename}`,
    }
  }

  async getObject(bucket: string, filename: string) {
    return this.minio.getObject(bucket, filename)
  }

  async delete(bucket: string, filename: string) {
    try {
      await this.minio.removeObject(bucket, filename)
    }
    catch (err) {
      console.error(`Failed to delete object ${filename} from bucket ${bucket}:`, err)
      return false
    }
    return true
  }

}