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
}
