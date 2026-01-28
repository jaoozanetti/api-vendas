import { Module } from '@nestjs/common';
import { ConfigModule} from '@nestjs/config'; // Importa o módulo de configuração do Banco de Dados
import { TypeOrmModule} from '@nestjs/typeorm'; // Importa o módulo TypeORM para integração com o Banco de Dados
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { Client } from './modules/clients/entities/client.entity';

@Module({
  imports: [
    // Configura o módulo de configuração para carregar variáveis do arquivo .env
    ConfigModule.forRoot({
      isGlobal: true, // Torna o módulo de configuração global
    }),

    // Configura o TypeORM para conectar ao Banco de Dados usando variáveis de ambiente
    TypeOrmModule.forRoot({
      type: 'postgres', // Tipo do Banco de Dados
      host: process.env.DB_HOST, // Host do Banco de Dados
      port: Number(process.env.DB_PORT), // Porta do Banco de Dados
      username: process.env.DB_USERNAME, // Nome de usuário do Banco de Dados
      password: process.env.DB_PASSWORD, // Senha do Banco de Dados
      database: process.env.DB_NAME, // Nome do Banco de Dados
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Caminho para as entidades do TypeORM
      synchronize: true, // Sincroniza o esquema do Banco de Dados com as entidades (não recomendado para produção)
    }),
    UsersModule,
    ClientsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}