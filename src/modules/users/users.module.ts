import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importa o módulo TypeORM para integração com o Banco de Dados
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity'; // Importa a entidade User para registrar no TypeORM

@Module({
  // Registra a entidade User no módulo TypeORM para que possa ser usada no serviço
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
