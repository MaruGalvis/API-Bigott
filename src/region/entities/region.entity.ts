import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Branch } from "../../branch/entities/branch.entity";
import { SalesTarget } from "../../sales-target/entities/sales-target.entity";

@Entity()
export class Region {
    @PrimaryGeneratedColumn('uuid')
    regionId!: string;

    @Column('text', {unique: true})
    name!: string;

    @Column({ default: true })
    isActive!: boolean;

    @OneToMany(() => Branch, (branch) => branch.region)
    branches!: Branch[];

    @OneToMany(() => SalesTarget, (salesTarget) => salesTarget.region)
    salesTargets!: SalesTarget[];
}
