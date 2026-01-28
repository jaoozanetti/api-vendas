import { Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Entity } from "typeorm";
@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    // nullable adicionado para permitir descrições vazias
    @Column({ type: 'text', nullable: true })
    description: string;

    // Preço com precisão e escala definidas, Esse é o segredo para lidar com valores monetários
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    // Estoque como número inteiro
    @Column({ type: 'int' })
    stock: number;

// Datas de criação, atualização e remoção - Validação de Auditoria
    @CreateDateColumn({ name: 'created_at' })
    createdAt: string;
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: string;  
    
    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: string;
}

