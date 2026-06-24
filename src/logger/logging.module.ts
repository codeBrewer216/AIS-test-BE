import { Module } from "@nestjs/common";
import {
  authLogger,
  auditLogger,
} from "./winston-mongodb.logger";

@Module({
  providers: [
    {
      provide: "AUTH_LOGGER",
      useValue: authLogger,
    },
    {
      provide: "AUDIT_LOGGER",
      useValue: auditLogger,
    },
  ],
  exports: [
    "AUTH_LOGGER",
    "AUDIT_LOGGER",
  ],
})
export class LoggingModule { }
