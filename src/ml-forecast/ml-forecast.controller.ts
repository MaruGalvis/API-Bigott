import { Body, Controller, Post } from '@nestjs/common';
import { MlForecastService } from './ml-forecast.service';
import { SaveMlForecastDto } from './dto/save-ml-forecast.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('ml-forecast')
export class MlForecastController {
  constructor(private readonly mlForecastService: MlForecastService) {}

  @Post('generate')
  @Auth()
  generate() {
    return this.mlForecastService.generate();
  }

  @Post('save')
  @Auth()
  save(@Body() saveMlForecastDto: SaveMlForecastDto) {
    return this.mlForecastService.save(saveMlForecastDto.objetivos);
  }
}
