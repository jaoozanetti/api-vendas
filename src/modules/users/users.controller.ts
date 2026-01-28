import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Criar um novo usuário
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Retornar todos os usuários
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Retornar um usuário pelo ID
  @Get(':id') //Os dois pontos indicam que é um variável
  findOne(@Param('id') id: string) {                    //E o ID vem da URL como texto ("1"). 
    return this.usersService.findOne(+id);             //Dica do Gemini: o + converte string para number
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id') // Vamos usar DELETE pois é o padrão semântico para remoção
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}