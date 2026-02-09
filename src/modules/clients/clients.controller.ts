import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Clients')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard) // Aqui você pode adicionar um guard de autenticação, como o JwtAuthGuard, para proteger as rotas
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Criar cliente', description: 'Cria um novo cliente no sistema' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @ApiOperation({ summary: 'Listar clientes', description: 'Retorna todos os clientes cadastrados' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @ApiOperation({ summary: 'Buscar cliente por ID', description: 'Retorna um cliente específico pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente', example: 1 })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Atualizar cliente', description: 'Atualiza os dados de um cliente existente' })
  @ApiParam({ name: 'id', description: 'ID do cliente', example: 1 })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(+id, updateClientDto);
  }

  @ApiOperation({ summary: 'Remover cliente', description: 'Remove um cliente (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID do cliente', example: 1 })
  @ApiResponse({ status: 200, description: 'Cliente removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }
}
