import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateSaleItemDto {
    
    @IsNotEmpty({ message: 'O ID do produto é obrigatório.' })
    @IsInt({ message: 'O ID do produto deve ser um número inteiro.' })
    productId: number; // ID do produto vendido

    @IsNotEmpty({ message: 'A quantidade é obrigatória.' })
    @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
    @Min(1, { message: 'A quantidade deve ser pelo menos 1.' })
    amount: number; // Quantidade do produto vendido

}