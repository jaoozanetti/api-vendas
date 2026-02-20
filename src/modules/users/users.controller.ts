import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Criar um novo usuário
  @ApiOperation({ summary: 'Criar usuário', description: 'Cria um novo usuário no sistema' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @Post()
  create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    return this.usersService.create(createUserDto, req);
  }

  // Retornar todos os usuários
  @ApiOperation({ summary: 'Listar usuários', description: 'Retorna todos os usuários cadastrados' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @UseGuards(JwtAuthGuard) // Aqui você pode adicionar um guard de autenticação, se necessário
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Retornar um usuário pelo ID
  @ApiOperation({ summary: 'Buscar usuário por ID', description: 'Retorna um usuário específico pelo ID' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do usuário', example: 1 })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @UseGuards(JwtAuthGuard) // Protegendo a rota de acesso a um usuário específico
  @Get(':id') //Os dois pontos indicam que é um variável
  findOne(@Param('id') id: string, @Req() req: Request) {                    //E o ID vem da URL como texto ("1"). 
    return this.usersService.findOne(+id, req);             //Dica do Gemini: o + converte string para number
  }

  @ApiOperation({ summary: 'Atualizar usuário', description: 'Atualiza os dados de um usuário existente' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do usuário', example: 1 })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @UseGuards(JwtAuthGuard) // Protegendo a rota de atualização de usuário
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    return this.usersService.update(+id, updateUserDto, req);
  }

  @ApiOperation({ summary: 'Remover usuário', description: 'Remove um usuário (soft delete)' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do usuário', example: 1 })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @UseGuards(JwtAuthGuard) // Protegendo a rota de remoção de usuário
  @Delete(':id') // Vamos usar DELETE pois é o padrão semântico para remoção
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.remove(+id, req);
  }
}