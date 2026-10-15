import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchModule } from './branch/branch.module';
import { RegionModule } from './region/region.module';
import { ProductModule } from './product/product.module';
import { SalesTargetModule } from './sales-target/sales-target.module';
import { MlForecastModule } from './ml-forecast/ml-forecast.module';
import { WeeklySalesDistributionModule } from './weekly-sales-distribution/weekly-sales-distribution.module';
import { MonthlySalesDistributionModule } from './monthly-sales-distribution/monthly-sales-distribution.module';
import { AuthModule } from './auth/auth.module';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: JoiValidationSchema,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5436'),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),

    BranchModule,

    RegionModule,

    ProductModule,

    SalesTargetModule,

    MlForecastModule,

    WeeklySalesDistributionModule,

    MonthlySalesDistributionModule,

    AuthModule
],

})
export class AppModule {}
