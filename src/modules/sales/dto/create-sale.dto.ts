import { IsArray, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateSaleItemDto } from './create-sale-item.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleDto {
    @ApiProperty({ description: 'ID do cliente que realizou a venda', example: 1 })
    @IsNotEmpty({ message: 'O ID do cliente é obrigatório.' })
    @IsInt({ message: 'O ID do cliente deve ser um número inteiro.' })
    clientId: number; // ID do cliente que realizou a venda

    @ApiProperty({ description: 'Itens da venda', type: [CreateSaleItemDto] })
    @ValidateNested({ each: true }) // Valida cada item do array individualmente
    @Type(() => CreateSaleItemDto) // Transforma o JSON cru na classe DTO
    @IsArray() // Garante que é uma lista
    items: CreateSaleItemDto[]; // Itens da venda
}
