import neo4j, { Driver } from 'neo4j-driver';
import { Neo4jConfig } from './neo4j-config.interface';
import { Logger } from '@nestjs/common';

export const createDriver = async (config: Neo4jConfig): Promise<Driver> => {
  const logger = new Logger('Neo4j Driver');
  for (let j = 1; j <= 5; j++) {
    logger.log(`${config.scheme}://${config.host}:${config.port}/${config.database}`);
    const driver = neo4j.driver(
      `${config.scheme}://${config.host}:${config.port}`,
      neo4j.auth.basic(config.username, config.password, config.database),
      { disableLosslessIntegers: true },
    );

    try {
      await driver.getServerInfo();
    } catch (e) {
      logger.error('Neo4j Driver could not connect to the neo4j server', e instanceof Error ? e.stack : undefined);
      logger.log(`Attempt Nr. ${j}`);
      for (let i = 5; i > 0; i--) {
        logger.warn(`Neo4j-Driver could not start. It will try again in ${i}...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      continue;
    }

    logger.log('Neo4j-Driver Created');
    return driver;
  }
  throw new Error('Failed to create Neo4j driver after 5 attempts.');
};
