import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination-dto';

@ApiTags('Sales')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard) // Aqui você pode adicionar um guard de autenticação, como o JwtAuthGuard, para proteger as rotas
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @ApiOperation({ summary: 'Criar venda', description: 'Cria uma nova venda com os itens informados' })
  @ApiResponse({ status: 201, description: 'Venda criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Post()
  async create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @ApiOperation({ summary: 'Listar vendas', description: 'Retorna todas as vendas cadastradas' })
  @ApiResponse({ status: 200, description: 'Lista de vendas retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.salesService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Buscar venda por ID', description: 'Retorna uma venda específica pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da venda', example: 1 })
  @ApiResponse({ status: 200, description: 'Venda encontrada.' })
  @ApiResponse({ status: 404, description: 'Venda não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Atualizar venda', description: 'Atualiza os dados de uma venda existente' })
  @ApiParam({ name: 'id', description: 'ID da venda', example: 1 })
  @ApiResponse({ status: 200, description: 'Venda atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Venda não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

  @ApiOperation({ summary: 'Remover venda', description: 'Remove uma venda (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID da venda', example: 1 })
  @ApiResponse({ status: 200, description: 'Venda removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Venda não encontrada.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
