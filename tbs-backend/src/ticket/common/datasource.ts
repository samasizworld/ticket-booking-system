import { DataSourceOptions } from 'typeorm';
import { join } from 'path';

export function getDataSourceConfig() {
    return {
        type: 'postgres',
        url: process.env.DB_URL,
        entities: [
            join(__dirname, '../entities/**', '*.entity.{js,ts}'),
        ],
        migrationsTableName: 'migration',
        migrations: [join(__dirname, '../../migration', '*.{js,ts}')],
        migrationsRun: true,
        ssl: false,
        logging: true,
    } as DataSourceOptions;
}
