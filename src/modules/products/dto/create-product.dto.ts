import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0, { message: 'O preço não pode ser negativo.' })
    price: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0, { message: 'O estoque não pode ser negativo.' })
    stock: number;  
}
