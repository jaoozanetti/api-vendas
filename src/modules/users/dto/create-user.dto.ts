import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateUserDto {
    @ApiProperty({ description: 'Nome do usuário', example: 'João Silva' })
    @IsNotEmpty( { message: 'O Nome não pode estar vazio.' } )
    name: string;

    @ApiProperty({ description: 'E-mail do usuário', example: 'joao@email.com' })
    @IsEmail( {}, { message: 'Infome um E-mail válido.' } )
    email: string;

    @ApiProperty({ description: 'Senha do usuário (mínimo 6 caracteres)', example: 'senha123', minLength: 6 })
    @IsNotEmpty()
    @MinLength( 6, { message: 'A Senha deve ter no mínimo 6 caracteres.' } )
    password: string;
}
