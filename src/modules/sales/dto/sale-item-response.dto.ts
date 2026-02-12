import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


export class SaleItemResponseDto {

    @ApiProperty({ description: 'ID do Produto' })
    @Expose()
    productId: number;

    @ApiProperty({ description: 'Nome do Produto' })
    @Expose()
    productName: string;

    @ApiProperty({ description: 'Quantidade vendida' })
    @Expose()
    amount: number;

    @ApiProperty({ description: 'Preço unitário do produto' })
    @Expose()
    unitPrice: number;

    @ApiProperty({ description: 'Preço total do item (unitPrice * amount)' })
    @Expose()
    subtotal: number;

}