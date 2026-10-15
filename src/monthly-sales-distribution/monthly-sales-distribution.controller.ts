import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { MonthlySalesDistributionService } from './monthly-sales-distribution.service';
import { CreateMonthlySalesDistributionDto } from './dto/create-monthly-sales-distribution.dto';
import { UpdateMonthlySalesDistributionDto } from './dto/update-monthly-sales-distribution.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('monthly-sales-distribution')
export class MonthlySalesDistributionController {
  constructor(private readonly monthlySalesDistributionService: MonthlySalesDistributionService) {}

  @Post()
  @Auth()
  create(@Body() createMonthlySalesDistributionDto: CreateMonthlySalesDistributionDto) {
    return this.monthlySalesDistributionService.create(createMonthlySalesDistributionDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.monthlySalesDistributionService.findAll(paginationDto);
  }

  @Get('by-week/:weeklySalesDistributionId')
  findByWeeklySalesDistribution(@Param('weeklySalesDistributionId', ParseUUIDPipe) weeklySalesDistributionId: string) {
    return this.monthlySalesDistributionService.findByWeeklySalesDistribution(weeklySalesDistributionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.monthlySalesDistributionService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMonthlySalesDistributionDto: UpdateMonthlySalesDistributionDto,
  ) {
    return this.monthlySalesDistributionService.update(id, updateMonthlySalesDistributionDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.monthlySalesDistributionService.remove(id);
  }
}
