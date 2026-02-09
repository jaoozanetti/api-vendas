import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Criar um novo usuário
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Retornar todos os usuários
  @UseGuards(JwtAuthGuard) // Aqui você pode adicionar um guard de autenticação, se necessário
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Retornar um usuário pelo ID
  @UseGuards(JwtAuthGuard) // Protegendo a rota de acesso a um usuário específico
  @Get(':id') //Os dois pontos indicam que é um variável
  findOne(@Param('id') id: string) {                    //E o ID vem da URL como texto ("1"). 
    return this.usersService.findOne(+id);             //Dica do Gemini: o + converte string para number
  }
  @UseGuards(JwtAuthGuard) // Protegendo a rota de atualização de usuário
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  @UseGuards(JwtAuthGuard) // Protegendo a rota de remoção de usuário
  @Delete(':id') // Vamos usar DELETE pois é o padrão semântico para remoção
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}