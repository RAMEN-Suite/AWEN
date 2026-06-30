import { BeforeApplicationShutdown, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Driver, ManagedTransaction, Result, session, Session } from 'neo4j-driver';
import type { Neo4jConfig } from './neo4j-config.interface';
import { RecordShape } from 'neo4j-driver-core/types/record';

@Injectable()
export class Neo4jService implements BeforeApplicationShutdown {
  private readonly logger = new Logger(Neo4jService.name);

  constructor(
    @Inject('NEO4J_OPTIONS') private readonly config: Neo4jConfig,
    @Inject('NEO4J_DRIVER') private readonly driver: Driver,
  ) {}

  async write<T extends RecordShape>(cypher: string, params?: Record<string, unknown>, database?: string): Promise<Result<T>> {
    const session = this.getWriteSession(database);
    try {
      return await session.executeWrite((tx: ManagedTransaction) => tx.run<T>(cypher, params));
    } catch (e) {
      this.logger.error('Could not run a query, because:', e);
      throw new InternalServerErrorException('Database could not run a query.');
    } finally {
      await session.close();
    }
  }

  async read<T extends RecordShape>(cypher: string, params?: Record<string, unknown>, database?: string): Promise<Result<T>> {
    const session = this.getReadSession(database);
    try {
      return await session.executeRead((tx: ManagedTransaction) => tx.run<T>(cypher, params));
    } catch (e) {
      this.logger.error('Could not run a query, because:', e);
      throw new InternalServerErrorException('Database could not run a query.');
    } finally {
      await session.close();
    }
  }

  private getReadSession(database?: string): Session {
    return this.driver.session({
      database: database ?? this.config.database,
      defaultAccessMode: session.READ,
    });
  }

  private getWriteSession(database?: string): Session {
    return this.driver.session({
      database: database ?? this.config.database,
      defaultAccessMode: session.WRITE,
    });
  }

  async beforeApplicationShutdown(signal?: string): Promise<void> {
    this.logger.log('[Neo4j Driver]', 'Neo4j-Driver Closed with signal: ', signal);
    await this.driver.close();
  }
}
