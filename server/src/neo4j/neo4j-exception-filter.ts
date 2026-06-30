import { Catch, ExceptionFilter, InternalServerErrorException, Logger } from '@nestjs/common';
import { Neo4jError } from 'neo4j-driver-core';

@Catch(Neo4jError)
export class Neo4jExceptionFilter implements ExceptionFilter<Neo4jError> {
  private readonly logger = new Logger(Neo4jExceptionFilter.name);

  catch(exception: Neo4jError) {
    // const ctx = host.switchToHttp();
    // const response = ctx.getResponse<Response>();
    this.logger.error(exception.message, exception.stack);

    // response.status(500).json({
    //   statusCode: 500,
    //   message: 'Database error',
    //   error: 'Internal Server Error',
    // });
    throw new InternalServerErrorException('Database error');
  }
}
