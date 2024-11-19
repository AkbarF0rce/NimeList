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
    const premium = this.premiumRepository.create(createPremiumDto);

    // Save data ke database
    await this.premiumRepository.save(premium);
  }

  async findById(id: string) {
    const premium = await this.premiumRepository.findOne({ where: { id } });
    return premium;
  }

  async getPremium() {
    const premium = await this.premiumRepository.find({
      relations: ['transactions'],
      order: { price: 'ASC' },
    });

    const result = premium.map((item) => ({
      ...item,
      transactions: item.transactions.filter(
        (transaction) => transaction.status === 'success',
      ).length,
    }));
    return result;
  }

  async deletePremium(id: string) {
    const premium = await this.premiumRepository.delete(id);
    return premium;
  }

  async getPremiumEdit(id: string) {
    const premium = await this.premiumRepository.findOne({
      where: { id },
      select: ['id', 'name', 'price', 'duration'],
    });
    return premium;
  }

  async updatePremium(id: string, updatePremiumDto: UpdatePremiumDto) {
    const premium = await this.premiumRepository.update(id, updatePremiumDto);
    return {
      message: 'Premium updated successfully',
      staus: 200,
    }
  }
}
