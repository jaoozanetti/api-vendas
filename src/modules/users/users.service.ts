import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  // Constructor: Onde pedimos as ferramentas para o NestJS
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 1ª função: Criar um novo usuário
  async create(createUserDto: CreateUserDto) {
    // Cria o Objeto na memoria (ainda não salvo no banco)
    const user = this.userRepository.create(createUserDto);
    // Salva o Objeto no banco de dados
    return await this.userRepository.save(user);
  }

  // Retorna todos os usuários
  async findAll() {
    return await this.userRepository.find();
  }

  // 2ª função: Atualizar um usuário
  // Retorna um usuário pelo ID
  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    // Se não encontrar, lança um erro 404 e informa a mensagem
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    // Se encontrar, retorna o usuário
    return user;
  }

  // 3ª função: Atualizar um usuário
  async update(id: number, updateUserDto: UpdateUserDto) {
    // Passo 1: Verificar se o usuário existe
    const user = await this.findOne(id);

    // Passo 2: Atualiza os dados na memória
    // O Repository.merge pega os dados novos e joga por cima dos dados antigos
    this.userRepository.merge(user, updateUserDto);

    // Passo 3: Salva os dados atualizados no banco
    return await this.userRepository.save(user);
  }

  // 4ª função: Inativar um usuário (Soft Delete)
  async remove(id: number) {
    // Passo 1: Verificar se o usuário existe
    await this.findOne(id);

    // O SoftDelete preenche a coluna deletedAt com a data atual
    // Ele não apaga a linha do banco de dados
    return await this.userRepository.softDelete(id);
  }
}
