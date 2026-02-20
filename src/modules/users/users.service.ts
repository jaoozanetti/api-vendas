import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LogAction, LogOrigin } from '../logs/entities/logs.entity';
import { LogsService } from '../logs/logs.service';
import { Request } from 'express';


@Injectable()
export class UsersService {
  // Constructor: Onde pedimos as ferramentas para o NestJS
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private logsService: LogsService,
  ) {}
  
  // 1ª função: Criar um novo usuário
async create(createUserDto: CreateUserDto, req: Request) {
    // PRIMEIRO: Verifique se o usuário JÁ existe
    // Se existir, a gente para tudo e solta o erro aqui mesmo.
    const existingUser = await this.userRepository.findOne({ 
        where: { email: createUserDto.email } 
    });

    if (existingUser) {
        throw new ConflictException('Email já cadastrado.');
    }

    // SEGUNDO: Se não existe, aí sim geramos a senha e salvamos
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepository.create({
        ...createUserDto,
        password: passwordHash,
    });

    // TERCEIRO: Salvamos no banco para gerar o ID
    const savedUser = await this.userRepository.save(user);

    // POR ÚLTIMO: Logamos a ação com o ID real do usuário
    await this.logsService.logAction(
        LogOrigin.USER,
        savedUser.id,
        LogAction.CREATE,
        'Criação de novo usuário',
        createUserDto,
        req
    );

    return savedUser;
}

  // Retorna todos os usuários
  async findAll() {
    return await this.userRepository.find();
  }

  // 2ª função: Atualizar um usuário
  // Retorna um usuário pelo ID
  async findOne(id: number, req: Request) {
    const user = await this.userRepository.findOneBy({ id });
    // Se não encontrar, lança um erro 404 e informa a mensagem
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    // Logamos a ação de visualização do usuário
    await this.logsService.logAction(
        LogOrigin.USER,
        user.id,
        LogAction.UPDATE,
        'Alteração de dados do usuário',
        user,
        req
    );
    // Se encontrar, retorna o usuário
    return user;
  }

  // 3ª função: Atualizar um usuário
  async update(id: number, updateUserDto: UpdateUserDto, req: Request) {
    // Passo 1: Verificar se o usuário existe
    const user = await this.findOne(id, req);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    // Passo 2: Atualiza os dados na memória
    // O Repository.merge pega os dados novos e joga por cima dos dados antigos
    this.userRepository.merge(user, updateUserDto);

    // Passo 3: Salva os dados atualizados no banco

      // Logamos a ação de atualização do usuário
      await this.logsService.logAction(
        LogOrigin.USER,
        user.id,
        LogAction.UPDATE,
        'Alteração de dados do usuário',
        updateUserDto,
        req

      );
      return await this.userRepository.save(user);
  }

  // 4ª função: Inativar um usuário (Soft Delete)
  async remove(id: number, req: Request) {
    // Passo 1: Verificar se o usuário existe
    await this.findOne(id, req);
    if (!id) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    // O SoftDelete preenche a coluna deletedAt com a data atual
    // Ele não apaga a linha do banco de dados

      // Logamos a ação de inativação do usuário
      await this.logsService.logAction(
        LogOrigin.USER,
        id,
        LogAction.DELETE,
        'Inativação do usuário',
        { id },
        req
    );
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
