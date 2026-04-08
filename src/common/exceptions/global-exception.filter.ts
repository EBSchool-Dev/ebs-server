import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  requestId: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const reply = context.getResponse<FastifyReply>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.resolveMessage(exception);
    const error = this.resolveErrorName(exception);
    const requestIdHeader = request.headers["x-request-id"];
    const requestId = typeof requestIdHeader === "string" ? requestIdHeader : "unknown";

    const responseBody: ErrorResponse = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    this.logger.error(`${request.method} ${request.url} - ${statusCode} ${message}`);
    reply.status(statusCode).send(responseBody);
  }

  private resolveMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === "string") {
        return response;
      }
      if (typeof response === "object" && response !== null && "message" in response) {
        const responseMessage = response.message;
        if (Array.isArray(responseMessage)) {
          return responseMessage.join(", ");
        }
        if (typeof responseMessage === "string") {
          return responseMessage;
        }
      }
      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return "Internal server error";
  }

  private resolveErrorName(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.name;
    }
    if (exception instanceof Error) {
      return exception.name;
    }
    return "Error";
  }
}
