# 🎬 Full-Stack Developer Coding Challenge: Movie Ticket Booking System

![Homepage](public/image/homepage-withoutloging.png)

Backend application สำหรับระบบจองตั๋วภาพยนตร์ พัฒนาด้วย Nextjs และเชื่อมต่อกับฐ้านข้อมูล MongoDB, Redis, Minio

## Features

Features

Authentication & Authorization

- Secure JWT Authentication (Register / Login)
- Role-Based Access Control (RBAC) for protected APIs
- Access Token Management with Redis Cache for improved performance and scalability

<b>
User Management
</b>

- Create, Retrieve, Update User Profiles
- Profile Image Upload and Management

<b>
Movie Management
</b>

- Full CRUD Operations for Movies
- Movie Detail Retrieval
- Movie Poster Upload and Storage

<b>
File Storage Service
</b>

- Object Storage Integration with MinIO
- Upload, Retrieve, and Delete Files
- Support for Movie Posters and User Profile Images

<b>
Ticket Booking System
</b>

- Movie Ticket Booking
- Ticket Detail and Booking History Retrieval
- PDF Ticket Generation and Export

<b>
Infrastructure & Performance
</b>

- Redis Caching for Session and Token Management
- RESTful API Architecture
- Dockerized Development & Deployment Environment

<b>
Security
</b>

- JWT-Based Authentication
- Protected Routes with Authorization Guards
- Role-Based API Access Control
- Environment Variable Configuration for Sensitive Data

## Tech Stack

- NestJS
- Express
- NodeJS
- TypeScript
- Swagger
- qrcode
- PDF-LIB
- MongoDB
- Redis
- Minio
- Docker

## Architecture Diagram

Angular Frontend
│
▼
NestJS API
│
▼
MongoDB | Reis | minio

## Project Structure

```text
├── src/
│    ├── auth/
│    │    ├── auth.controller.ts
│    │    ├── auth.module.ts
│    │    ├── auth.service.ts
│    │    ├── RedisProvider.ts
│    │    └── session-cleanup.service.ts
│    ├── booking/
│    │    ├── booking.controller.ts
│    │    ├── booking.module.ts
│    │    ├── booking.schema.ts
│    │    ├── booking.service.ts
│    │    └── pdf.service.ts
│    ├── guard/
│    │    ├── jwt-redis.guard.ts
│    │    ├── role.decorator.ts
│    │    └── role.guard.ts
│    ├── minio/
│    │    ├── minio.module.ts
│    │    └── minio.service.ts
│    ├── movies/
│    │    ├── movies.schema.ts
│    │    ├── movies.controller.ts
│    │    ├── movies.module.ts
│    │    ├── movies.service.ts
│    │    ├── screening.schema.ts
│    │    └── seat.schema.ts
│    ├── storage/
│    │    ├── storage.module.ts
│    │    ├── storage.service.ts
│    │    ├── storage.schema.ts
│    │    └── storage.schema.ts
│    ├── users/
│    │    ├── users.module.ts
│    │    ├── users.service.ts
│    │    ├── users.schema.ts
│    │    └── users.schema.ts
│    ├── app.controller.ts
│    ├── app.module.ts
│    ├── app.service.ts
│    └── main.ts
├── .env
├── Dockerfile
└── docker-compose.yml




```
