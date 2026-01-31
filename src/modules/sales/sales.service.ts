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

    // 3ª - Processar os Itens da Venda
    for (const itemDto of items) {
      const productEncontrado = await this.productsRepository.findOneBy({ id: itemDto.productId });
      if (!productEncontrado) {
        // Se chegou aqui , o ID está errado
        throw new BadRequestException(`Produto com ID ${itemDto.productId} não encontrado`);
      }
      // Verificar se há estoque suficiente
      if (productEncontrado.stock < itemDto.amount) {
        throw new BadRequestException(`Estoque insuficiente para o produto ID ${productEncontrado.name}`);
      }
      // Criando o Item da Venda
      const itemVenda = this.saleItemsRepository.create({
        sale: savedSale, //O objeto da venda que acabou de ser salva (cabeçalho)
        product: productEncontrado, // O objeto do produto a ser encontrado no Banco
        amount: itemDto.amount, // Quantidade do produto que veio no JSON
        price: productEncontrado.price, // Preço do produto que veio do Banco para não ser alterado via JSON
      });
      // Salvando o Item da Venda
      await this.saleItemsRepository.save(itemVenda);

      // 4ª Subtraindo o estoque dos produtos vendidos
      productEncontrado.stock = productEncontrado.stock - itemDto.amount;
      await this.productsRepository.save(productEncontrado);
      }
      const vendaCompleta = await this.salesRepository.findOne({
        where: { id: savedSale.id },
        relations: ['client', 'items', 'items.product'], // Carrega os itens da venda e os produtos relacionados
        select: {
          id: true,
          date: true,
          client: { id: true, name: true, email: true },
          items: {
            id: true, amount: true, price: true,
            product: { id: true, name: true, price: true },
          },
        },
      });
      return vendaCompleta;
  }

  // 2ª função: Retornar todas as vendas
  async findAll() {
    return await this.salesRepository.find({
      relations: ['client', 'items', 'items.product'], // Carrega os itens da venda e os produtos relacionados
      select: {
        id: true,
        date: true,
        client: { id: true, name: true, email: true },
        items: {
          id: true, amount: true, price: true,
          product: { id: true, name: true, price: true },
        },
      }
    });
  }

  // 3ª função: Retornar uma venda pelo ID
  async findOne(id: number) {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ['client', 'items', 'items.product'], // Carrega os itens da venda e os produtos relacionados
      select: {
        id: true,
        date: true,
        client: { id: true, name: true, email: true },
        items: {
          id: true, amount: true, price: true,
          product: { id: true, name: true, price: true },
        },
      }
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
