import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { RedisModule } from '@nestjs-modules/ioredis/dist/redis.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'), // Chave secreta para assinar o token JWT
      signOptions: {
        expiresIn: Number(configService.get<string>('JWT_EXPIRES_IN')) // Convert to number
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService], // Exporta o AuthService para que possa ser usado em outros módulos (como o AppModule)
})
export class AuthModule {}
