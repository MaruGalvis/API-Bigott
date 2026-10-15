import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { WeeklySalesDistributionService } from './weekly-sales-distribution.service';
import { CreateWeeklySalesDistributionDto } from './dto/create-weekly-sales-distribution.dto';
import { UpdateWeeklySalesDistributionDto } from './dto/update-weekly-sales-distribution.dto';
import { FindWeeklySalesDistributionDto } from './dto/find-weekly-sales-distribution.dto';
import { PivotWeeklySalesDistributionDto } from './dto/pivot-weekly-sales-distribution.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('weekly-sales-distribution')
export class WeeklySalesDistributionController {
  constructor(private readonly weeklySalesDistributionService: WeeklySalesDistributionService) {}

  @Post()
  @Auth()
  create(@Body() createWeeklySalesDistributionDto: CreateWeeklySalesDistributionDto) {
    return this.weeklySalesDistributionService.create(createWeeklySalesDistributionDto);
  }

  @Get()
  findAll(@Query() findWeeklySalesDistributionDto: FindWeeklySalesDistributionDto) {
    return this.weeklySalesDistributionService.findAll(findWeeklySalesDistributionDto);
  }

  @Get('pivot')
  getPivot(@Query() pivotWeeklySalesDistributionDto: PivotWeeklySalesDistributionDto) {
    const { branchId, month, year } = pivotWeeklySalesDistributionDto;
    return this.weeklySalesDistributionService.getPivot(branchId, month, year);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.weeklySalesDistributionService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWeeklySalesDistributionDto: UpdateWeeklySalesDistributionDto,
  ) {
    return this.weeklySalesDistributionService.update(id, updateWeeklySalesDistributionDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.weeklySalesDistributionService.remove(id);
  }
}
