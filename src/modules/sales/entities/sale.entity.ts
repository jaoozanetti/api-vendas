import { CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToMany  } from "typeorm";
import { Client } from "src/modules/clients/entities/client.entity";
import { SaleItem } from "./sale-item.entity";

@Entity({ name: 'sales' }) // Nome da tabela no banco de dados
export class Sale {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'date'})
    date: Date; // Data da venda

    // RELACIONAMENTO: Muitas vendas -> 1 cliente
    @ManyToOne(() => Client, { nullable: false }) // Não existe venda sem cliente
    @JoinColumn({ name: 'client_id' }) // Nome da coluna na tabela de vendas que referencia o cliente
    client: Client;

    // RELACIONAMENTO: 1 venda -> Muitos itens de venda
    @OneToMany(() => SaleItem, (saleItem) => saleItem.sale, { cascade: true }) // Cascade para salvar os itens junto com a venda
    items: SaleItem[]; // Itens da venda

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number; // Total da venda


// Auditoria: adicionando colunas de createdAt, updatedAt e deletedAt
    @CreateDateColumn({ name: 'created_at' })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: string;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: string;

}

