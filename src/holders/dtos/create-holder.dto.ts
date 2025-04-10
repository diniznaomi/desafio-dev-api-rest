import { IsString, Length } from 'class-validator';

export class CreateHolderDto {
  @IsString()
  fullName: string;

  @IsString()
  @Length(11, 11, { message: 'O CPF deve conter exatamente 11 dígitos.' })
  cpf: string;
}
