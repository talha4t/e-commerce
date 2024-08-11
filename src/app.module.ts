import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';

@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true,
  }), AuthModule],

  controllers: [],

  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard
    }
  ],
})

export class AppModule {}
