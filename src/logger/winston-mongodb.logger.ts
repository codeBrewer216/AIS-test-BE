import * as winston from "winston";
import "winston-mongodb";

import * as dotenv from 'dotenv'

dotenv.config()

const mongoUri = process.env.MONGO_URI + '/logs'

if (!mongoUri) {

  throw new Error('MONGO_URI is missing')

}
export const authLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toString(),
    }),
    winston.format.json(),
  ),

  transports: [
    new winston.transports.MongoDB({
      level: "info",
      db: mongoUri,
      collection: "authentication_logs", // ✅ เจาะจง collection
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});

export const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toString(),
    }),
    winston.format.json(),
  ),

  transports: [
    new winston.transports.MongoDB({
      level: "info",
      db: mongoUri,
      collection: "audit_logs",
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});

