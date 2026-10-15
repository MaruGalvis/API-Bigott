import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Region } from "../../region/entities/region.entity";
import { MonthlySalesDistribution } from "../../monthly-sales-distribution/entities/monthly-sales-distribution.entity";
import { WeeklySalesDistribution } from "../../weekly-sales-distribution/entities/weekly-sales-distribution.entity";

@Entity()
export class Branch {

    @PrimaryGeneratedColumn('uuid')
    branchId!: string;

    @ManyToOne(() => Region, (region) => region.branches)
    @JoinColumn({ name: 'regionId' })
    region!: Region;

    @Column('uuid')
    regionId!: string;

    @Column('text', {unique: true})
    name!: string;

    @Column({ default: true })
    isActive!: boolean;

    @OneToMany(() => MonthlySalesDistribution, (monthlySalesDistribution) => monthlySalesDistribution.branch)
    monthlySalesDistributions!: MonthlySalesDistribution[];

    @OneToMany(() => WeeklySalesDistribution, (weeklySalesDistribution) => weeklySalesDistribution.branch)
    weeklySalesDistributions!: WeeklySalesDistribution[];

}
