import { IsNotEmpty } from "class-validator";

export class CreateClientDto {
    @IsNotEmpty({ message: 'O Nome não pode estar vazio.' })
    name: string;

    @IsNotEmpty({ message: 'O Email não pode estar vazio.' })
    email: string;

    @IsNotEmpty({ message: 'O CPF não pode estar vazio.' })
    cpf: string;
}