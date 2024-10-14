import { Injectable } from '@nestjs/common';
import { CreatePremiumDto } from './dto/create-premium.dto';
import { UpdatePremiumDto } from './dto/update-premium.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Premium } from './entities/premium.entity';

@Injectable()
export class PremiumService {
  constructor(
    @InjectRepository(Premium)
    private readonly premiumRepository: Repository<Premium>,
  ) {}
  async createPremium(createPremiumDto: CreatePremiumDto) {
    const premium = await this.premiumRepository.create(createPremiumDto);

    // Save data ke database
    await this.premiumRepository.save(premium);
  }

  async findById(id: string) {
    const premium = await this.premiumRepository.findOne({
      where: { id },
    });
    return premium;
  }

  async getAllPremium() {
    const premium = await this.premiumRepository.find();
    return premium;
  }
}
