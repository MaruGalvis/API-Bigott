import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { Region } from '../region/entities/region.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    const existing = await this.branchRepository.findOneBy({
      name: createBranchDto.name,
    });

    if (existing) {
      throw new ConflictException('A branch with that name already exists');
    }

    await this.findRegionOrFail(createBranchDto.regionId);

    const branch = this.branchRepository.create(createBranchDto);
    return this.branchRepository.save(branch);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Branch>> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.branchRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: { region: true },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { branchId: id },
      relations: { region: true },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with id ${id} not found`);
    }

    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);

    if (updateBranchDto.regionId) {
      await this.findRegionOrFail(updateBranchDto.regionId);
    }

    Object.assign(branch, updateBranchDto);
    return this.branchRepository.save(branch);
  }

  private async findRegionOrFail(regionId: string): Promise<Region> {
    const region = await this.regionRepository.findOneBy({ regionId });

    if (!region) {
      throw new NotFoundException(`Region with id ${regionId} not found`);
    }

    return region;
  }

  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);
    branch.isActive = false;
    await this.branchRepository.save(branch);
  }

  async restore(id: string): Promise<Branch> {
    const branch = await this.findOne(id);
    branch.isActive = true;
    return this.branchRepository.save(branch);
  }
}
