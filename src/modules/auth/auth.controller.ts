import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard) // Protege a rota de login com a estratégia local
  @Post('login')
  async login(@Request() req) {
    // Se o código chegar aqui, é porque o LocalAuthGuard já validou o usuário
    // e o colocou dentro de req.user
    return this.authService.login(req.user); // Retorna o token JWT e os dados do usuário
  }

  @UseGuards(JwtAuthGuard) // Precisa estar logado para deslogar
  @Post('logout')
  async logout(@Request() req) {
    // O JwtAuthGuard já validou o token e colocou os dados do usuário em req.user
    return this.authService.logout(req.user.userId); // Invalida o token ou remove a sessão do usuário e o ID do usuário
  }
}