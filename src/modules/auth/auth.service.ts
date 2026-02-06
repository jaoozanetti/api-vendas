import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis
  ) {}


  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email); // Metodo para encontrar o usuário pelo email

    if (user && await bcrypt.compare(password, user.password)) { // Verifica se a senha é válida
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    // Guardando no Redis: Chave "user_id" -> Valor "token"
    await this.redis.set(`session:${user.id}`, access_token, 'EX', 3600); // Expira em 1 hora (3600 segundos)
    return { access_token: access_token, user };
    };

  async logout(userId: number) {
    // Apaga a chave da sessão deste usário do Redis
    await this.redis.del(`session:${userId}`);
    return { message: 'Logout realizado com sucesso. Sessão encerrada.' };
  }
}