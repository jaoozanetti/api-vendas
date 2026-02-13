import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationProductDto } from './dto/pagination-product.dto';
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

// 2ª função: Retornar todos os produtos com paginação
  async findAll(paginationDto: PaginationProductDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    try {
      const [data, totalItems] = await this.productRepository.findAndCount({
        skip,
        take: limit,
        order: { id: 'ASC' },
      });

      return {
        data,
        meta: {
          totalItems,
          itemCount: data.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      console.error('Erro de paginação de produtos:', error);
      throw new BadRequestException('Erro ao buscar produtos paginados');
    }
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
