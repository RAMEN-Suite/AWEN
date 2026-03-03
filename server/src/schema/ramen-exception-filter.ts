import {
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RAMENError } from './RAMENError';

@Catch(RAMENError)
export class RAMENExceptionFilter implements ExceptionFilter<RAMENError> {
  private readonly logger = new Logger(RAMENExceptionFilter.name);

  catch(exception: RAMENError) {
    this.logger.error(exception.message, exception.stack);

    // response.status(500).json({
    //   statusCode: 500,
    //   message: 'There is a problem with the RAMEN-Schema this application uses. Please report this error to your Technical Supervisor.',
    //   error: 'Internal Server Error',
    // });
    throw new InternalServerErrorException(
      'There is a problem with the RAMEN-Schema this application uses. Please report this error to your Technical Supervisor',
    );
  }
}
