import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from "../../product/entities/product.entity";
import { Region } from "../../region/entities/region.entity";

@Entity()
@Unique(['regionId', 'productId', 'month', 'year'])
export class SalesTarget {

    @PrimaryGeneratedColumn('uuid')
    salesTargetId!: string;

    @ManyToOne(() => Region, (region) => region.salesTargets)
    @JoinColumn({ name: 'regionId' })
    region!: Region;

    @Column('uuid')
    regionId!: string;

    @ManyToOne(() => Product, (product) => product.salesTargets)
    @JoinColumn({ name: 'productId' })
    product!: Product;

    @Column('uuid')
    productId!: string;

    @Column('decimal', {
        precision: 12,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    targetSalesVolume!: number;

    @Column('int')
    month!: number;

    @Column('int')
    year!: number;

}
