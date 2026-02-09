import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Aqui você pode adicionar um guard de autenticação, como o JwtAuthGuard, para proteger as rotas
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard) // Aqui você pode adicionar um guard de autenticação, como o JwtAuthGuard, para proteger as rotas
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }
  @UseGuards(JwtAuthGuard) // Protege a rota de acesso a todos os produtos
  @Get()
  findAll() {
    return this.productsService.findAll();
  }
  @UseGuards(JwtAuthGuard) // Protege a rota de acesso a um produto específico
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard) // Protege a rota de atualização com autenticação
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard) // Protege a rota de remoção com autenticação
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
