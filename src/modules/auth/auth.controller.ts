import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Realizar login', description: 'Autentica o usuário com email e senha e retorna access_token (15min) + refresh_token (7 dias)' })
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
  @ApiResponse({ status: 201, description: 'Login realizado com sucesso. Retorna access_token e refresh_token.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  @ApiResponse({ status: 429, description: 'Muitas tentativas de login. Tente novamente mais tarde.' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentativas por minuto por IP
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Renovar tokens', description: 'Usa o refresh_token para gerar um novo par de access_token + refresh_token sem pedir senha' })
  @ApiResponse({ status: 201, description: 'Tokens renovados com sucesso.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado.' })
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refresh_token);
  }

  @ApiOperation({ summary: 'Realizar logout', description: 'Invalida a sessão do usuário e o refresh_token no Redis' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 201, description: 'Logout realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado.' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Body() body?: RefreshTokenDto) {
    return this.authService.logout(req.user.userId, body?.refresh_token);
  }
}