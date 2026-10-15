import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from "../../product/entities/product.entity";
import { Branch } from "../../branch/entities/branch.entity";
import { WeeklySalesDistribution } from "../../weekly-sales-distribution/entities/weekly-sales-distribution.entity";
import { DayOfWeek } from "../enums/day-of-week.enum";

@Entity()
@Unique(['weeklySalesDistributionId', 'dayOfWeek'])
export class MonthlySalesDistribution {

    @PrimaryGeneratedColumn('uuid')
    monthlySalesDistributionId!: string;

    @ManyToOne(() => Branch, (branch) => branch.monthlySalesDistributions)
    @JoinColumn({ name: 'branchId' })
    branch!: Branch;

    @Column('uuid')
    branchId!: string;

    @ManyToOne(() => Product, (product) => product.monthlySalesDistributions)
    @JoinColumn({ name: 'productId' })
    product!: Product;

    @Column('uuid')
    productId!: string;

    @ManyToOne(() => WeeklySalesDistribution, (weeklySalesDistribution) => weeklySalesDistribution.monthlySalesDistributions, { nullable: true })
    @JoinColumn({ name: 'weeklySalesDistributionId' })
    weeklySalesDistribution!: WeeklySalesDistribution | null;

    @Column('uuid', { nullable: true })
    weeklySalesDistributionId!: string | null;

    @Column('int', { nullable: true })
    month!: number | null;

    @Column('int', { nullable: true })
    year!: number | null;

    @Column({ type: 'enum', enum: DayOfWeek })
    dayOfWeek!: DayOfWeek;

    @Column('decimal', {
        precision: 5,
        scale: 4,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    dailyWeight!: number;

    @Column('decimal', {
        precision: 12,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    monthlyQuantity!: number;

}
