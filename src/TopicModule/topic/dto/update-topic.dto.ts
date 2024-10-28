import { PartialType } from '@nestjs/mapped-types';
import { CreateTopicDto } from './create-topic.dto';
import { IsNumber, IsString } from 'class-validator';

export class UpdateTopicDto extends PartialType(CreateTopicDto) {
    @IsString()
    title?: string

    @IsString()
    body?: string;

    @IsString()
    id_anime?: string;
}
