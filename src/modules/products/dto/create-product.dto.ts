import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ description: 'Nome do produto', example: 'Notebook Dell' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Descrição do produto', example: 'Notebook Dell Inspiron 15 polegadas' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Preço do produto', example: 3499.99, minimum: 0 })
    @IsNotEmpty()
    @IsNumber()
    @Min(0, { message: 'O preço não pode ser negativo.' })
    price: number;

    @ApiProperty({ description: 'Quantidade em estoque', example: 50, minimum: 0 })
    @IsNotEmpty()
    @IsNumber()
    @Min(0, { message: 'O estoque não pode ser negativo.' })
    stock: number;  
}
