import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from "../../product/entities/product.entity";
import { Branch } from "../../branch/entities/branch.entity";
import { MonthlySalesDistribution } from "../../monthly-sales-distribution/entities/monthly-sales-distribution.entity";
import { WeekNumber } from "../enums/week-number.enum";

@Entity()
@Unique(['branchId', 'productId', 'workingWeeks', 'month', 'year'])
export class WeeklySalesDistribution {

    @PrimaryGeneratedColumn('uuid')
    weeklySalesDistributionId!: string;

    @Column('int')
    month!: number;

    @Column('int')
    year!: number;

    @ManyToOne(() => Branch, (branch) => branch.weeklySalesDistributions)
    @JoinColumn({ name: 'branchId' })
    branch!: Branch;

    @Column('uuid')
    branchId!: string;

    @ManyToOne(() => Product, (product) => product.weeklySalesDistributions)
    @JoinColumn({ name: 'productId' })
    product!: Product;

    @Column('uuid')
    productId!: string;

    @Column('int')
    workingDays!: number;

    @Column('int')
    totalWorkingDays!: number;

    @Column({ type: 'enum', enum: WeekNumber })
    workingWeeks!: WeekNumber;

    @Column('decimal', {
        precision: 5,
        scale: 4,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    weight!: number;

    @Column('decimal', {
        precision: 12,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    dailySalesAverage!: number;

    @Column('decimal', {
        precision: 12,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    sop!: number;

    @Column('decimal', {
        precision: 12,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    weeklyQuantity!: number;

    @OneToMany(() => MonthlySalesDistribution, (monthlySalesDistribution) => monthlySalesDistribution.weeklySalesDistribution)
    monthlySalesDistributions!: MonthlySalesDistribution[];

}
