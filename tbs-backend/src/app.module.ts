import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketModule } from './ticket/ticket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDataSourceConfig } from './ticket/common/datasource';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      useFactory: () => {
        const dbSourceProps = getDataSourceConfig();
        return dbSourceProps;
      },
      inject: [],
    }),
    TicketModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
