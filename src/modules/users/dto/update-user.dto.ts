import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// O PartialType pega todas as regras do CreateUserDto (tem que ser email, senha min 6, etc)
// mas torna tudo opcional. Se o usuário não mandar a senha, a gente ignora a validação de senha.
export class UpdateUserDto extends PartialType(CreateUserDto) {}
