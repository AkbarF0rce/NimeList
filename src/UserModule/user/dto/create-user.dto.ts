import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(3, { message: 'username must be at least 3 characters' })
  @MaxLength(20, { message: 'username must be at most 20 characters' })
  username: string;

  @MinLength(6)
  @MaxLength(20)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/, {
    message:
      'passwords must be at least 6 characters long, containing at least one uppercase letter, one lowercase letter, and one number.',
  })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50, { message: 'email must be at most 50 characters' })
  email: string;
}
