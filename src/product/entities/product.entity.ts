import { Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { PackType } from "../emuns/pack-type.enum";
import { SalesTarget } from "../../sales-target/entities/sales-target.entity";
import { MonthlySalesDistribution } from "../../monthly-sales-distribution/entities/monthly-sales-distribution.entity";
import { WeeklySalesDistribution } from "../../weekly-sales-distribution/entities/weekly-sales-distribution.entity";

@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    productId!: string;

    @Column('text', {unique: true})
    name!: string;

    @Column('text')
    description!: string;

    @Column({type: 'enum', enum: PackType})
    type!: PackType;

    @Column({ default: true })
    isActive!: boolean;

    @OneToMany(() => SalesTarget, (salesTarget) => salesTarget.product)
    salesTargets!: SalesTarget[];

    @OneToMany(() => MonthlySalesDistribution, (monthlySalesDistribution) => monthlySalesDistribution.product)
    monthlySalesDistributions!: MonthlySalesDistribution[];

    @OneToMany(() => WeeklySalesDistribution, (weeklySalesDistribution) => weeklySalesDistribution.product)
    weeklySalesDistributions!: WeeklySalesDistribution[];

}
