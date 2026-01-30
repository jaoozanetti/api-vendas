import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from '../products/entities/product.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemsRepository: Repository<SaleItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  // 1ª função: Criar uma nova venda
  async create(createSaleDto: CreateSaleDto) {
    const { clientId, items } = createSaleDto;
    
    // 1ª - Validar o Cliente
    const client = await this.clientsRepository.findOneBy({ id: clientId });
    if (!client) {
      throw new BadRequestException(`Cliente com ID ${clientId} não encontrado`);
    }

    // 2ª - Criar e Salvar a Venda (Header)
    const newSale = this.salesRepository.create({
      date: new Date(),
      client: client,
    });
    const savedSale = await this.salesRepository.save(newSale);

    for (const itemDto of items) {
      // SUA MISSÃO COMEÇA AQUI:
      // A) Busque o produto (productRepository.findOneBy...)
      // B) Valide se existe
      // C) Valide se tem estoque (product.stock >= itemDto.amount)
      // D) Crie o SaleItem com o preço DO PRODUTO (product.price)
      // E) Salve o SaleItem
      // F) Atualize o estoque do Produto (product.stock -= ...) e salve o produto
    });
  }

  // 2ª função: Retornar todas as vendas
  async findAll() {
    return await this.salesRepository.find({
      relations: ['items', 'items.product'], // Carrega os itens da venda e os produtos relacionados
    });
  }

  // 3ª função: Retornar uma venda pelo ID
  async findOne(id: number) {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'], // Carrega os itens da venda e os produtos relacionados
    });
    if (!sale) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada, digite um ID válido`);
    }
    return sale;
  }

  // 4ª função: Atualizar uma venda pelo ID
  async update(id: number, updateSaleDto: UpdateSaleDto) {
    const result = await this.salesRepository.update(id, updateSaleDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada, digite um ID válido`);
    }
    return `Venda com ID ${id} atualizada com sucesso`;
  }

  // 5ª função: Remover uma venda pelo ID
  async remove(id: number) {
    const result = await this.salesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada, digite um ID válido`);
    }
    return `Venda com ID ${id} removida com sucesso`;
  }
}
