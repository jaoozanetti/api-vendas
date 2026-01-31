import { Entity, PrimaryGeneratedColumn,JoinColumn, ManyToOne, Column } from "typeorm";
import { Sale } from "../entities/sale.entity";
import { Product } from "src/modules/products/entities/product.entity";

@Entity({ name: 'sale_items' }) // Nome da tabela no banco de dados
export class SaleItem {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'int' })
    amount: number; // Quantidade do produto vendido

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number; // Preço do produto no momento da venda

    // RELACIONAMENTO: Muitos itens de venda -> 1 venda
    @ManyToOne(() => Sale, (sale) => sale.id, { nullable: false, onDelete: 'CASCADE' }) // Não existe item de venda sem venda
    @JoinColumn({ name: 'sale_id' }) // Nome da coluna na tabela de itens de venda que referencia a venda
    sale: Sale;

    // RELACIONAMENTO: Muitos itens de venda -> 1 produto
    @ManyToOne(() => Product, { nullable: false, onDelete: 'CASCADE' }) // Não existe item de venda sem produto
    @JoinColumn({ name: 'product_id' }) // Nome da coluna na tabela de itens de venda que referencia o produto
    product: Product;
}