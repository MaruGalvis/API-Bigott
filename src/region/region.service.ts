import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    const existing = await this.regionRepository.findOneBy({
      name: createRegionDto.name,
    });

    if (existing) {
      throw new ConflictException('A region with that name already exists');
    }

    const region = this.regionRepository.create(createRegionDto);
    return this.regionRepository.save(region);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Region>> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.regionRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Region> {
    const region = await this.regionRepository.findOneBy({ regionId: id });

    if (!region) {
      throw new NotFoundException(`Region with id ${id} not found`);
    }

    return region;
  }

  async update(id: string, updateRegionDto: UpdateRegionDto): Promise<Region> {
    const region = await this.findOne(id);
    Object.assign(region, updateRegionDto);
    return this.regionRepository.save(region);
  }

  async remove(id: string): Promise<void> {
    const region = await this.findOne(id);
    region.isActive = false;
    await this.regionRepository.save(region);
  }

  async restore(id: string): Promise<Region> {
    const region = await this.findOne(id);
    region.isActive = true;
    return this.regionRepository.save(region);
  }
}
