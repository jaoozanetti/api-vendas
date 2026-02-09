import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { NotFoundException } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';

// Serviço responsável por gerenciar os clientes
@Injectable()
export class ClientsService { // Injeção de dependência do repositório de clientes
  constructor( // Constructor: Onde pedimos as ferramentas para o NestJS
    @InjectRepository(Client) // Injetando o repositório de clientes
    private clientRepository: Repository<Client>,
  ) {}

  // 1ª função: Criar um novo cliente
async create(createClientDto: CreateClientDto) {
  const client = this.clientRepository.create(createClientDto);
  
  try {
    // O await aqui é essencial. O retorno do save já traz o ID do banco.
    return await this.clientRepository.save(client); 
  } catch (error) {
    if (error.code === '23505') {
      throw new ConflictException('CPF ou e-mail já cadastrado.');
    }
    // IMPORTANTE: Se for outro erro (ex: tabela sumiu), 
    // precisamos lançar o erro original para saber o que aconteceu!
    throw error; 
  }
}

  // 2ª função: Retornar todos os clientes
 async findAll() {
    return await this.clientRepository.find();
  }

  // 3ª função: Retornar um cliente pelo ID
  async findOne(id: number) {
    const client = await this.clientRepository.findOneBy({ id });
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
  }
  return client;
}

  // 4ª função: Atualizar um cliente pelo ID
  async update(id: number, updateClientDto: UpdateClientDto) {
    const result = await this.clientRepository.update(id, updateClientDto);
      try {
        return result;
      } catch (error) {
        if (error.code === '23505') {
          // 23505 é o código de violação de chave única no Postgres
          throw new ConflictException('CPF ou e-mail já cadastrado.');
        }
      }
      if (result.affected === 0) {
        throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
      }
      return 'Cliente atualizado com sucesso';
  }

  // 5ª função: Remover um cliente pelo ID
  async remove(id: number) {
    const result = await this.clientRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
      }
      return 'Cliente removido com sucesso';
  }
}

