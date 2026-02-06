import { DataSource } from 'typeorm';
import { getDataSourceConfig } from './datasource';
import { config } from 'dotenv';

config({ path: '.env.local' });

export function createDataSource() {
  const dataSource = new DataSource(getDataSourceConfig());
  return dataSource;
}

export default createDataSource();
