import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';

@Module({
  // Loads .env (relative to the working directory) and exposes ConfigService.
  imports: [ConfigModule.forRoot({ isGlobal: true }), TasksModule],
})
export class AppModule {}
