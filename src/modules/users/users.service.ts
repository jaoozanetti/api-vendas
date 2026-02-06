import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // Constructor: Onde pedimos as ferramentas para o NestJS
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 1ª função: Criar um novo usuário
  async create(createUserDto: CreateUserDto) {
    // Gera o salt para o hash
    const salt = await bcrypt.genSalt(10);
    // Hash da senha
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);
    //
    const user = this.userRepository.create({
      ...createUserDto,
      password: passwordHash,
    });
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
    if (!id) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    // O SoftDelete preenche a coluna deletedAt com a data atual
    // Ele não apaga a linha do banco de dados
    return await this.userRepository.softDelete(id);
  }

  // 5ª função: Encontrar um usuário pelo email (usado para autenticação)
  async findByEmail(email: string) {
      // Busca um usuário onde a coluna 'email' bate com o parâmetro recebido
      // Usamos addSelect('user.password') porque por padrão a senha pode estar oculta se você usou @Exclude no DTO/Entity
      // Mas aqui precisamos dela para validar o login!
      return await this.userRepository.findOne({
        where: { email },
      });
    }
  }
