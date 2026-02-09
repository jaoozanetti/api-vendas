import { IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
    @ApiProperty({ description: 'Nome do cliente', example: 'Maria Oliveira' })
    @IsNotEmpty({ message: 'O Nome não pode estar vazio.' })
    name: string;

    @ApiProperty({ description: 'E-mail do cliente', example: 'maria@email.com' })
    @IsNotEmpty({ message: 'O Email não pode estar vazio.' })
    email: string;

    @ApiProperty({ description: 'CPF do cliente', example: '123.456.789-00' })
    @IsNotEmpty({ message: 'O CPF não pode estar vazio.' })
    cpf: string;
}