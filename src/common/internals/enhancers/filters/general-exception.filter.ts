import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { IRequestLogPayload } from 'src/common/interfaces/internals/enhancers/interceptors/log/request-log-payload.interface';
import { IResponseLogPayload } from 'src/common/interfaces/internals/enhancers/interceptors/log/response-log-payload.interface';
import { ILogPayload } from '../../../interfaces/internals/enhancers/interceptors/log/log-payload.interface';
import { IResolvedRequest } from '../../../interfaces/internals/enhancers/interceptors/resolved-request.interface';

@Catch(HttpException) //TODO: catching only http exceptions, make it catch all exceptions or rename?
export class GeneralExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const req = context.getRequest<IResolvedRequest>();
    const res = context.getResponse<Response>();
    const status = exception.getStatus();

    if (!req?.isRequestLogged) {
      this.logRequestException(req, exception);
    }

    // Format error response(except for graphql)
    const contextType = host.getType() as string;
    if (contextType !== 'graphql') {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object') {
        res.status(status).json(exceptionResponse);
      } else {
        res.status(status).json({
          statusCode: status,
          message: exception.message,
        });
      }
    }
  }

  private logRequestException(req: IResolvedRequest, exception: HttpException) {
    const requestLogPayload: IRequestLogPayload = {
      http: {
        method: req?.method.toUpperCase(),
        path: `${req?.baseUrl}${req?.route?.path || ''}`,
        payload: {
          headers: req?.headers,
          params: req?.params,
          query: req?.query,
          body: req?.body,
        },
      },
      auth: req?.user,
    };

    const responseLogPayload: IResponseLogPayload = {
      statusCode: exception.getStatus(),
      result: exception.message,
    };

    const logPayload: ILogPayload = {
      request: requestLogPayload,
      response: responseLogPayload,
      startTimestamp: req?.startTimestamp,
      executionTime: req?.startTimestamp
        ? Date.now() - req.startTimestamp
        : undefined,
      errorStack: exception.stack,
    };

    Logger.error(JSON.stringify(logPayload)); // Stringify logs for better visualization on cloud tools like aws cloudwatch
  }
}
