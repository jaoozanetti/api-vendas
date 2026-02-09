import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Aqui você pode adicionar um guard de autenticação, como o JwtAuthGuard, para proteger as rotas
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(JwtAuthGuard) // Protegendo a rota de criação de cliente
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @UseGuards(JwtAuthGuard) // Protegendo a rota de acesso a todos os clientes
  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @UseGuards(JwtAuthGuard) // Protegendo a rota de acesso a um cliente específico
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard) // Protegendo a rota de atualização de cliente
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(+id, updateClientDto);
  }

  @UseGuards(JwtAuthGuard) // Protegendo a rota de remoção de cliente
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }
}
