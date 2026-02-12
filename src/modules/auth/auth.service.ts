import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // ── Validação de Credenciais ──────────────────────────────────────
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // ── Login (gera access_token curto + refresh_token longo) ─────────
  async login(user: any) {
    // 1. Access Token – curto (15 min)
    const accessPayload = { sub: user.id };
    const access_token = this.jwtService.sign(accessPayload, {
      expiresIn: 900, // 15 minutos
    });

    // 2. Refresh Token – opaco (UUID), salvo apenas no Redis
    const refresh_token = uuidv4();

    // 3. Sessão no Redis – guarda access + refresh (1 sessão por usuário)
    //    Se o usuário já estava logado, o token antigo é sobrescrito → sessão anterior invalidada
    const sessionData = {
      email: user.email,
      name: user.name,
      token: access_token,
    };
    await this.redis.set(
      `session:${user.id}`,
      JSON.stringify(sessionData),
      'EX',
      900, // Sessão expira junto com o access_token (15 min)
    );

    // 4. Refresh token no Redis – expira em 7 dias
    const refreshData = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
    await this.redis.set(
      `refresh:${refresh_token}`,
      JSON.stringify(refreshData),
      'EX',
      604800, // 7 dias em segundos
    );

    return { access_token, refresh_token };
  }

  // ── Refresh (gera novo par de tokens sem pedir senha) ─────────────
  async refresh(refreshToken: string) {
    // 1. Busca o refresh token no Redis
    const raw = await this.redis.get(`refresh:${refreshToken}`);
    if (!raw) {
      throw new UnauthorizedException(
        'Refresh token inválido ou expirado. Faça login novamente.',
      );
    }

    const { userId, email, name } = JSON.parse(raw);

    // 2. Invalida o refresh token antigo (rotação de refresh token)
    await this.redis.del(`refresh:${refreshToken}`);

    // 3. Gera novo access_token + novo refresh_token
    const newAccessToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: 900 },
    );
    const newRefreshToken = uuidv4();

    // 4. Atualiza sessão no Redis
    const sessionData = { email, name, token: newAccessToken };
    await this.redis.set(
      `session:${userId}`,
      JSON.stringify(sessionData),
      'EX',
      900,
    );

    // 5. Salva novo refresh token
    await this.redis.set(
      `refresh:${newRefreshToken}`,
      JSON.stringify({ userId, email, name }),
      'EX',
      604800,
    );

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  // ── Logout (apaga sessão + refresh token) ─────────────────────────
  async logout(userId: number, refreshToken?: string) {
    // Apaga a sessão do access_token
    await this.redis.del(`session:${userId}`);

    // Apaga o refresh token, se fornecido
    if (refreshToken) {
      await this.redis.del(`refresh:${refreshToken}`);
    }

    return { message: 'Logout realizado com sucesso. Sessão encerrada.' };
  }
}