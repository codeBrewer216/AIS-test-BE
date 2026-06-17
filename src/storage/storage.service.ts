import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Storage } from './storage.schema'
import { MinioService } from '../minio/minio.service'

@Injectable()
export class StorageService {
  private readonly bucket = process.env.MINIO_BUCKET!

  constructor(
    private readonly minio: MinioService,
    @InjectModel(Storage.name) private model: Model<Storage>,
  ) { }

  async upload(file: Express.Multer.File, baseUrl: string) {
    const uploaded = await this.minio.upload(file)

    const doc = await this.model.create({
      filename: uploaded.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      isPublic: true,
      url: `${baseUrl}/storage/file/${uploaded.filename}`, // 🔥 IMPORTANT CHANGE
    })

    return doc
  }

  getFileStream(filename: string) {
    return this.minio.getObject(this.bucket, filename)
  }

  async delete(filename: string) {
    const state = await this.minio.delete(this.bucket, filename)
    const result = await this.model.deleteOne({ filename }).exec()
    if (!result || !state) {
      throw new Error('File not found in database')
    }
    return { status: 'success', message: 'File deleted successfully' }
  }


}