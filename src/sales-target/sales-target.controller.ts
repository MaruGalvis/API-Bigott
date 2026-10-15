import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SalesTargetService } from './sales-target.service';
import { CreateSalesTargetDto } from './dto/create-sales-target.dto';
import { UpdateSalesTargetDto } from './dto/update-sales-target.dto';
import { ImportSalesTargetDto } from './dto/import-sales-target.dto';
import { PivotSalesTargetDto } from './dto/pivot-sales-target.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('sales-target')
export class SalesTargetController {
  constructor(private readonly salesTargetService: SalesTargetService) {}

  @Post()
  @Auth()
  create(@Body() createSalesTargetDto: CreateSalesTargetDto) {
    return this.salesTargetService.create(createSalesTargetDto);
  }

  @Post('import')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  importFromExcel(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|vnd\.ms-excel/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() importSalesTargetDto: ImportSalesTargetDto,
  ) {
    return this.salesTargetService.importFromExcel(
      file.buffer,
      importSalesTargetDto.month,
      importSalesTargetDto.year,
    );
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.salesTargetService.findAll(paginationDto);
  }

  @Get('pivot')
  getPivot(@Query() pivotSalesTargetDto: PivotSalesTargetDto) {
    return this.salesTargetService.getPivot(pivotSalesTargetDto.month, pivotSalesTargetDto.year);
  }

  @Get('latest-period')
  getLatestPeriod() {
    return this.salesTargetService.getLatestPeriod();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesTargetService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id') id: string, @Body() updateSalesTargetDto: UpdateSalesTargetDto) {
    return this.salesTargetService.update(id, updateSalesTargetDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string) {
    return this.salesTargetService.remove(id);
  }
}
