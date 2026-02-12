import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SaleItemResponseDto } from './sale-item-response.dto';

export class SaleResponseDto {
  @ApiProperty({ description: 'ID da venda' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Data da venda' })
  @Expose()
  date: Date;

  @ApiProperty({ description: 'Total da venda' })
  @Expose()
  total: number;

  @ApiProperty({ description: 'Nome do cliente' })
  @Expose()
  clientName: string;

  @ApiProperty({ description: 'Itens da venda', type: [SaleItemResponseDto] })
  @Expose()
  items: SaleItemResponseDto[];
}
