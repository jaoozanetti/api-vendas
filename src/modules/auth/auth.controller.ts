import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Realizar login', description: 'Autentica o usuário com email e senha e retorna um token JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'joao@email.com' },
        password: { type: 'string', example: 'senha123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'Login realizado com sucesso. Retorna o token JWT e dados do usuário.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  @UseGuards(LocalAuthGuard) // Protege a rota de login com a estratégia local
  @Post('login')
  async login(@Request() req) {
    // Se o código chegar aqui, é porque o LocalAuthGuard já validou o usuário
    // e o colocou dentro de req.user
    return this.authService.login(req.user); // Retorna o token JWT e os dados do usuário
  }

  @ApiOperation({ summary: 'Realizar logout', description: 'Invalida a sessão do usuário no Redis' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 201, description: 'Logout realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado.' })
  @UseGuards(JwtAuthGuard) // Precisa estar logado para deslogar
  @Post('logout')
  async logout(@Request() req) {
    // O JwtAuthGuard já validou o token e colocou os dados do usuário em req.user
    return this.authService.logout(req.user.userId); // Invalida o token ou remove a sessão do usuário e o ID do usuário
  }
}