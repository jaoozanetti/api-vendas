import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from 'ioredis';
import { UnauthorizedException } from "@nestjs/common";
import { InjectRedis } from '@nestjs-modules/ioredis';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService,
    @InjectRedis() private readonly redis: Redis) 
    {
      super({
          // 1. Pega o token do header Authorization, onde o formato é "Bearer <token>"
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false, // 2. Não ignora a expiração do token

          // 2. Usa a chave secreta definida no .env para validar o token
          secretOrKey: configService.get<string>("JWT_SECRET")!,
      });
    }

  // 3. Se o token for válido, o Nest roda isso e coloca o retorno dentro de req.user
    async validate(payload: any) {
        // CONSULTA AO REDIS
        const session = await this.redis.get(`session:${payload.sub}`);

        // Se a chave não existir no Redis, o usuário fez logout ou a sessão expirou
        if (!session) {
            throw new UnauthorizedException('Sessão encerrada ou inválida. Faça login novamente.');
        }
        return { userId: payload.sub, email: payload.email };
    }
}