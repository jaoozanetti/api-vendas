import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' }) // Define a entidade User mapeada para a tabela 'users' no Banco de Dados
export class User {

    @PrimaryGeneratedColumn('increment') // Define a coluna 'id' como chave primária auto-incrementada
    id: number;

    @Column({ name: 'name', length: 100, nullable: false }) // Define a coluna 'name' com tamanho máximo de 100 caracteres
    name: string;

    @Column({ name: 'password', length: 255, nullable: false }) // Define a coluna 'password' com tamanho máximo de 255 caracteres
    password: string;

    // --- Colunas de controle de auditoria ---

    @CreateDateColumn({ name: 'created_at' }) // Define a coluna 'created_at' para armazenar a data de criação do registro
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at' }) // Define a coluna 'updated_at' para armazenar a data da última atualização do registro
    updatedAt: string;

    @DeleteDateColumn({ name: 'deleted_at' }) // Define a coluna 'deleted_at' para armazenar a data de exclusão lógica do registro
    deletedAt: string;
}