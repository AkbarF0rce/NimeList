import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PremiumService } from './premium.service';
import { CreatePremiumDto } from './dto/create-premium.dto';
import { UpdatePremiumDto } from './dto/update-premium.dto';
import { JwtAuthGuard } from 'src/AuthModule/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/AuthModule/common/guards/roles.guard';
import { Roles } from 'src/AuthModule/common/decorators/roles.decorator';

@Controller('premium')
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}

  @Post('post-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createPremiumDto: CreatePremiumDto) {
    return this.premiumService.createPremium(createPremiumDto);
  }

  @Get('get-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPremium() {
    return await this.premiumService.getPremium();
  }

  @Delete('delete-admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deletePremium(@Param('id') id: string) {
    return this.premiumService.deletePremium(id);
  }

  @Get('get-admin-edit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPremiumEdit(@Param('id') id: string) {
    return await this.premiumService.getPremiumEdit(id);
  }
}
