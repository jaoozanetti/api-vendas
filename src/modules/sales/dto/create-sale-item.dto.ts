import { IsNotEmpty, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleItemDto {
    
    @ApiProperty({ description: 'ID do produto vendido', example: 1 })
    @IsNotEmpty({ message: 'O ID do produto é obrigatório.' })
    @IsInt({ message: 'O ID do produto deve ser um número inteiro.' })
    productId: number; // ID do produto vendido

    @ApiProperty({ description: 'Quantidade do produto vendido', example: 2, minimum: 1 })
    @IsNotEmpty({ message: 'A quantidade é obrigatória.' })
    @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
    @Min(1, { message: 'A quantidade deve ser pelo menos 1.' })
    amount: number; // Quantidade do produto vendido

}