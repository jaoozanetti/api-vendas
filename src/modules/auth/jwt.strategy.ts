import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from 'ioredis';
import { UnauthorizedException } from "@nestjs/common";
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super({
      // 1. Pega o token do header Authorization, onde o formato é "Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 2. Não ignora a expiração do token

      // 3. Usa a chave secreta definida no .env para validar o token
      secretOrKey: configService.get<string>("JWT_SECRET")!,

      // 4. Passa o objeto Request para a função validate (necessário para comparar o token)
      passReqToCallback: true,
    });
  }

  // Se o token for válido, o Nest roda isso e coloca o retorno dentro de req.user
  async validate(req: Request, payload: any) {
    const userId = payload.sub;

    // ── Proteção contra Token Hijacking ──────────────────────────
    // Extrai o token bruto do header para comparar com o salvo no Redis
    const tokenFromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    // CONSULTA AO REDIS PARA VER SE A SESSÃO DO USUÁRIO AINDA É VÁLIDA
    const session = await this.redis.get(`session:${userId}`);

    // Se a chave não existir no Redis, o usuário fez logout ou a sessão expirou
    if (!session) {
      throw new UnauthorizedException(
        'Sessão encerrada ou inválida. Faça login novamente.',
      );
    }

    const sessionData = JSON.parse(session);

    // Compara o token do header com o token armazenado no Redis
    // Se forem diferentes, significa que houve um novo login e este token foi invalidado
    if (sessionData.token !== tokenFromHeader) {
      throw new UnauthorizedException(
        'Token invalidado. Uma nova sessão foi iniciada em outro dispositivo.',
      );
    }

    // Retorna os dados da sessão (ficam disponíveis em req.user)
    return { userId, email: sessionData.email, name: sessionData.name };
  }
}