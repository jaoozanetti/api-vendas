import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty( { message: 'O Nome não pode estar vazio.' } )
    name: string;

    @IsEmail( {}, { message: 'Infome um E-mail válido.' } )
    email: string;

    @IsNotEmpty()
    @MinLength( 6, { message: 'A Senha deve ter no mínimo 6 caracteres.' } )
    password: string;
}
