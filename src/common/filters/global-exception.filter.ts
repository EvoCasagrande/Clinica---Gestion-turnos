import {
    type ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { type Request, type Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        let statusCode = 500;
        let message: string | string[] = 'Error interno en el servidor';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else {
                const responseMessage = (
                    exceptionResponse as { message?: string | string[] }
                ).message;
                message = responseMessage ?? 'La solicitud no es válida';
            }
        } else if (exception instanceof PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2025':
                    statusCode = 404;
                    message = 'El registro requerido no existe.';
                    break;
                case 'P2002':
                    statusCode = 409;
                    message = 'Ya existe un registro con los mismos datos únicos.';
                    break;
                case 'P2003':
                    statusCode = 409;
                    message = 'La operación viola una referencia relacionada.';
                    break;
            }
        }

        this.logger.error(message);

        response.status(statusCode).json({
            statusCode,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
}
