import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlySalesDistribution } from './entities/monthly-sales-distribution.entity';
import { Branch } from '../branch/entities/branch.entity';
import { Product } from '../product/entities/product.entity';
import { WeeklySalesDistribution } from '../weekly-sales-distribution/entities/weekly-sales-distribution.entity';
import { CreateMonthlySalesDistributionDto } from './dto/create-monthly-sales-distribution.dto';
import { UpdateMonthlySalesDistributionDto } from './dto/update-monthly-sales-distribution.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class MonthlySalesDistributionService {
  constructor(
    @InjectRepository(MonthlySalesDistribution)
    private readonly monthlySalesDistributionRepository: Repository<MonthlySalesDistribution>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(WeeklySalesDistribution)
    private readonly weeklySalesDistributionRepository: Repository<WeeklySalesDistribution>,
  ) {}

  async create(createMonthlySalesDistributionDto: CreateMonthlySalesDistributionDto): Promise<MonthlySalesDistribution> {
    const { branchId, productId, weeklySalesDistributionId } = createMonthlySalesDistributionDto;

    const [branch, product, weeklySalesDistribution] = await Promise.all([
      this.branchRepository.findOneBy({ branchId }),
      this.productRepository.findOneBy({ productId }),
      this.weeklySalesDistributionRepository.findOneBy({ weeklySalesDistributionId }),
    ]);

    if (!branch) throw new NotFoundException(`Branch with id ${branchId} not found`);
    if (!product) throw new NotFoundException(`Product with id ${productId} not found`);
    if (!weeklySalesDistribution) {
      throw new NotFoundException(`Weekly sales distribution with id ${weeklySalesDistributionId} not found`);
    }

    const monthlySalesDistribution = this.monthlySalesDistributionRepository.create({
      ...createMonthlySalesDistributionDto,
      monthlyQuantity: createMonthlySalesDistributionDto.dailyWeight * weeklySalesDistribution.weeklyQuantity,
    });

    try {
      const saved = await this.monthlySalesDistributionRepository.save(monthlySalesDistribution);
      return this.findOne(saved.monthlySalesDistributionId);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException(
          `A distribution for that week/day already exists (${createMonthlySalesDistributionDto.dayOfWeek})`,
        );
      }
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<MonthlySalesDistribution>> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.monthlySalesDistributionRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: { branch: true, product: true, weeklySalesDistribution: true },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<MonthlySalesDistribution> {
    const monthlySalesDistribution = await this.monthlySalesDistributionRepository.findOne({
      where: { monthlySalesDistributionId: id },
      relations: { branch: true, product: true, weeklySalesDistribution: true },
    });

    if (!monthlySalesDistribution) {
      throw new NotFoundException(`Monthly sales distribution with id ${id} not found`);
    }

    return monthlySalesDistribution;
  }

  async findByWeeklySalesDistribution(weeklySalesDistributionId: string): Promise<MonthlySalesDistribution[]> {
    return this.monthlySalesDistributionRepository.find({
      where: { weeklySalesDistributionId },
      relations: { branch: true, product: true },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async update(
    id: string,
    updateMonthlySalesDistributionDto: UpdateMonthlySalesDistributionDto,
  ): Promise<MonthlySalesDistribution> {
    const monthlySalesDistribution = await this.findOne(id);

    const weeklySalesDistributionId =
      updateMonthlySalesDistributionDto.weeklySalesDistributionId ?? monthlySalesDistribution.weeklySalesDistributionId;

    if (!weeklySalesDistributionId) {
      throw new BadRequestException('A weeklySalesDistributionId is required to compute the monthly quantity');
    }

    const weeklySalesDistribution = await this.weeklySalesDistributionRepository.findOneBy({
      weeklySalesDistributionId,
    });

    if (!weeklySalesDistribution) {
      throw new NotFoundException(`Weekly sales distribution with id ${weeklySalesDistributionId} not found`);
    }

    const dailyWeight = updateMonthlySalesDistributionDto.dailyWeight ?? monthlySalesDistribution.dailyWeight;

    Object.assign(monthlySalesDistribution, updateMonthlySalesDistributionDto, {
      monthlyQuantity: dailyWeight * weeklySalesDistribution.weeklyQuantity,
    });

    try {
      await this.monthlySalesDistributionRepository.save(monthlySalesDistribution);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException('A distribution for that week/day already exists');
      }
      throw error;
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const monthlySalesDistribution = await this.findOne(id);
    await this.monthlySalesDistributionRepository.remove(monthlySalesDistribution);
  }
}
