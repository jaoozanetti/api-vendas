import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService} from '@nestjs/config'; // Importa o módulo de configuração do Banco de Dados
import { TypeOrmModule} from '@nestjs/typeorm'; // Importa o módulo TypeORM para integração com o Banco de Dados
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { AuthModule } from './modules/auth/auth.module';
import { LocalStrategy } from './modules/auth/local.strategy';
import { RedisModule } from '@nestjs-modules/ioredis/dist/redis.module';



@Module({
  imports: [
    // Configura o módulo de configuração para carregar variáveis do arquivo .env
    ConfigModule.forRoot({isGlobal: true,}),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('REDIS_URL'),
      }),
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
      dropSchema: false, // Não dropa o esquema do Banco de Dados a cada inicialização
      synchronize: true, // Sincroniza o esquema do Banco de Dados com as entidades (não recomendado para produção)
    }),
    UsersModule,
    ClientsModule,
    ProductsModule,
    SalesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [LocalStrategy],
})
export class AppModule {}