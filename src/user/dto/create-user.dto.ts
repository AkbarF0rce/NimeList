import { IsEmpty, IsNotEmpty } from "class-validator";
import { badges, status_premium } from "../entities/user.entity";

export class CreateUserDto {
    @IsNotEmpty()
    id_role: string;

    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    salt: string

    @IsEmpty()
    bio: string;

    @IsEmpty()
    status_premium: status_premium;

    @IsEmpty()
    badge: badges;

    @IsEmpty()
    start_premium: Date;

    @IsEmpty()
    end_premium: Date;
}
