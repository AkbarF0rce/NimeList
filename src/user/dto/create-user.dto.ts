import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @MinLength(6)
  @MaxLength(20)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/, {
    message:
      'Password harus minimal 6 karakter, mengandung setidaknya satu huruf besar, satu huruf kecil, dan satu angka',
  })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string;
}
