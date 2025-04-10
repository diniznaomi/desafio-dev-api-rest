import { IsString, Length } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @Length(11, 11, { message: 'CPF must be exactly 11 characters long' })
  cpf: string;
}
