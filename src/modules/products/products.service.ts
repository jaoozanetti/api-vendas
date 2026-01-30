import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Serviço responsável por gerenciar os produtos

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // 1ª função: Criar um novo produto
async create(createProductDto: CreateProductDto) {
  const product = this.productRepository.create(createProductDto);
  return await this.productRepository.save(product);
}

// 2ª função: Retornar todos os produtos
  async findAll() {
    return this.productRepository.find(); // Retorna uma cópia do array de produtos
  }

  // 3ª função: Retornar um produto pelo ID
  async findOne(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      return { message: `Produto com ID ${id} não encontrado, digite um ID válido` };
    }
    return product;
  }

  // 4ª função: Atualizar um produto pelo ID
  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      return { message: `Produto com ID ${id} não encontrado, digite um ID válido` };
    }
    Object.assign(product, updateProductDto, { updatedAt: new Date() });
    return this.productRepository.save(product);
  }

  // 5ª função: Remover um produto pelo ID
  async remove(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      return { message: `Produto com ID ${id} não encontrado, digite um ID válido` };
    }
    await this.productRepository.softDelete(id);
    return { message: `Produto com ID ${id} removido com sucesso` };
  }
}
