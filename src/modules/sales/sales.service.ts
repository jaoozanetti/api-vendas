import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from '../products/entities/product.entity';
import { Client } from '../clients/entities/client.entity';
import { SaleItemResponseDto } from './dto/sale-item-response.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
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
    private dataSource: DataSource,
  ) {}

  // Mapeia a entidade Sale para o DTO de resposta, incluindo os itens e o cliente
  private mapEntityToResponse(sale: Sale): SaleResponseDto { // Mapeia a entidade Sale para o DTO de resposta
    const response = new SaleResponseDto();
    response.id = sale.id;
    response.date = sale.date;
    response.total = sale.total;
    response.clientName = sale.client?.name;

    // Mapeia cada item de venda para o DTO de resposta
    response.items = (sale.items ?? []).map(item => { // Proteção contra items nulos
      const itemResponse = new SaleItemResponseDto();
      itemResponse.productId = item.product?.id;
      itemResponse.productName = item.product?.name;
      itemResponse.amount = item.amount;
      itemResponse.unitPrice = item.price;
      // Calcula o subtotal (quantidade x preço unitário)
      itemResponse.subtotal = Number(item.price) * Number(item.amount);
      return itemResponse;
    });

    return response;
  }

   // Retorna a query builder padrão para buscas de vendas
  private getSalesQueryBuilder(): SelectQueryBuilder<Sale> {
    return this.salesRepository.createQueryBuilder('sale')
      .leftJoinAndSelect('sale.client', 'client') // Carrega os dados do cliente junto com a venda
      .leftJoinAndSelect('sale.items', 'saleItem') // Carrega os itens da venda
      .leftJoinAndSelect('saleItem.product', 'product') // Carrega os dados do produto para cada item da venda
      .select([
        'sale.id',
        'sale.date',
        'sale.total',
        'client.id',
        'client.name',
        'client.email',
        'saleItem.id',
        'saleItem.amount',
        'saleItem.price',
        'product.id',
        'product.name',
        'product.price',
      ]);
  }

  // Busca uma venda pelo ID, lançando NotFoundException se não existir
  private async findSaleEntity(id: number): Promise<Sale> {
    const sale = await this.getSalesQueryBuilder()
      .where('sale.id = :id', { id })
      .getOne();

    if (!sale) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada, digite um ID válido`);
    }

    return sale;
  }

  async create(createSaleDto: CreateSaleDto): Promise<SaleResponseDto> {
    // Inicializa controle de transação
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // PASSO 1: Validação do Cliente
      // Verifica se o cliente existe antes de criar a venda
      const client = await queryRunner.manager.findOne(Client, {
        where: { id: createSaleDto.clientId },
      });
      if (!client) {
        throw new BadRequestException(
          `Cliente com ID ${createSaleDto.clientId} não encontrado, digite um ID válido`
        );
      }

      // PASSO 2: Validação de Estoque e Preparação de Itens
      // Para cada item da venda, valida estoque e prepara o objeto SaleItem
      const saleItems: SaleItem[] = [];
      let total = 0;

      for (const item of createSaleDto.items) {
        // Busca o produto no banco 
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(
            `Produto com ID ${item.productId} não encontrado, digite um ID válido`
          );
        }

        // Verifica se há estoque suficiente
        if (product.stock < item.amount) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto com ID ${item.productId}. ` +
            `Disponível: ${product.stock}, Solicitado: ${item.amount}`
          );
        }

        // PASSO 3: Atualização de Estoque
        // Decrementa o estoque do produto
        product.stock = Number(product.stock) - Number(item.amount);
        await queryRunner.manager.save(Product, product);

        // Cria o item da venda usando o preço atual do produto
        const saleItem = queryRunner.manager.create(SaleItem, {
          product,
          amount: item.amount,
          price: product.price, // Salva o preço no momento da venda
        });
        saleItems.push(saleItem);

        // Acumula o total da venda
        total += Number(product.price) * Number(item.amount);
      }

      // PASSO 4: Criação da Venda
      // Cria e salva a venda com todos os itens
      // O cascade: true da Entity garante que os itens também serão salvos
      const sale = queryRunner.manager.create(Sale, {
        date: new Date(),
        client,
        items: saleItems,
        total,
      });
      const savedSale = await queryRunner.manager.save(Sale, sale);

      // PASSO 5: Commit da Transação
      // Se chegou aqui, tudo funcionou! Confirma as mudanças no banco
      await queryRunner.commitTransaction();

      // PASSO 6: Retorno Mapeado
      // Busca a venda completa e retorna como DTO
      return this.findOne(savedSale.id);
    } catch (err) {
      // ERRO: Reverte TUDO o que foi feito
      // Estoque, cliente, itens... Tudo volta ao estado anterior
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Libera a conexão do queryRunner
      await queryRunner.release();
    }
  }

 // Busca todas as vendas, mapeando para DTOs de resposta
  async findAll(): Promise<SaleResponseDto[]> {
    // Usa a query builder padrão para buscar todas as vendas
    const sales = await this.getSalesQueryBuilder().getMany();

    // Mapeia cada venda para o DTO de resposta
    return sales.map(sale => this.mapEntityToResponse(sale));
  }

// Busca uma venda pelo ID, mapeando para DTO de resposta
  async findOne(id: number): Promise<SaleResponseDto> {
    // Busca a venda com todas as relações carregadas
    const sale = await this.findSaleEntity(id);

    // Mapeia para DTO e retorna
    return this.mapEntityToResponse(sale);
  }

// Atualiza uma venda existente, lançando NotFoundException se não existir
  async update(id: number, updateSaleDto: UpdateSaleDto): Promise<string> {
    // Atualiza os campos fornecidos
    const result = await this.salesRepository.update(id, updateSaleDto);

    if (result.affected === 0) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada, digite um ID válido`);
    }

    return `Venda com ID ${id} atualizada com sucesso`;
  }

// Remove (soft delete) uma venda, revertendo o estoque dos itens e lançando NotFoundException se não existir
  async remove(id: number): Promise<{ message: string }> { // O método remove agora é responsável por cancelar a venda e estornar o estoque dos produtos envolvidos
    // PASSO 1: Busca a venda para saber que estoque devolver
    const sale = await this.findSaleEntity(id);

    // Inicializa controle de transação
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // PASSO 2: Reverte o estoque de cada item
      // Crucial: Se isso falhar no meio, a transação todo é revertida
      for (const item of sale.items) {
        // Busca o produto dentro da transação (para lock pessimista)
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.product.id },
        });

        if (product) {
          // Devolve a quantidade ao estoque
          product.stock = Number(product.stock) + Number(item.amount);
          await queryRunner.manager.save(Product, product);
        }
      }

      // PASSO 3: Faz soft delete da venda
      // TypeORM identifica que há DeleteDateColumn e faz soft delete automaticamente
      await this.salesRepository.softDelete(id);

      // PASSO 4: Commit da Transação
      await queryRunner.commitTransaction();

      return {
        message: `Venda com ID ${id} cancelada e estoque estornado com sucesso`,
      };
    } catch (err) {
      // ERRO: Reverte TUDO (estoque + venda)
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Libera a conexão do queryRunner
      await queryRunner.release();
    }
  }
}
