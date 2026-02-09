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

  // --- NOVA VARIÁVEL PARA O TOTAL ---
  let totalVenda = 0;

  // 2ª - Criar a Venda (Ainda sem o total final)
  const newSale = this.salesRepository.create({
    date: new Date(),
    client: client,
    total: 0, // Iniciamos com 0
  });
  const savedSale = await this.salesRepository.save(newSale);

  // 3ª - Processar os Itens da Venda
  for (const itemDto of items) {
    const productEncontrado = await this.productsRepository.findOneBy({ id: itemDto.productId });
    
    if (!productEncontrado) {
      throw new BadRequestException(`Produto com ID ${itemDto.productId} não encontrado`);
    }

    if (productEncontrado.stock < itemDto.amount) {
      throw new BadRequestException(`Estoque insuficiente para o produto: ${productEncontrado.name}`);
    }

    // --- CÁLCULO DO TOTAL ACUMULADO ---
    totalVenda += Number(productEncontrado.price) * itemDto.amount;

    const itemVenda = this.saleItemsRepository.create({
      sale: savedSale,
      product: productEncontrado,
      amount: itemDto.amount,
      price: productEncontrado.price, 
    });

    await this.saleItemsRepository.save(itemVenda);

    // 4ª Subtraindo o estoque
    productEncontrado.stock -= itemDto.amount;
    await this.productsRepository.save(productEncontrado);
  }

  // --- 5ª ATUALIZAR O TOTAL DA VENDA NO FINAL ---
  savedSale.total = totalVenda;
  await this.salesRepository.save(savedSale);

  // Busca final para retorno
  const vendaCompleta = await this.salesRepository.findOne({
    where: { id: savedSale.id },
    relations: ['client', 'items', 'items.product'],
    select: {
      id: true,
      date: true,
      total: true, // Certifique-se que o campo total existe na sua Entity Sales
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

  // 5ª função: Remover uma venda pelo ID (Estorno)
  async remove(id: number) {
    // 1ª - Achar a Venda para saber o que devolver
    // Ele já traz os itens, o cliente e já da erro 404 se não encontrar.
    const sale = await this.findOne(id);

    // 2ª - Devolver os itens para o Estoque
    // Aqui ele só processa o estoque, não apaga os itens da venda
    for (const item of sale.items) {
      // Precisamos buscar o produto de novo para ter o estoque atualizado e completo
      const product = await this.productsRepository.findOneBy({ id: item.product.id });

      if (product) {
        product.stock = Number(product.stock) + Number(item.amount); // Aqui é a Soma dos Itens de devolução
        await this.productsRepository.save(product);
      }
    }
       await this.salesRepository.softDelete(id);
       return { message: `Venda com ID ${id} cancelada e estoque estornado com sucesso` };
  }
}
