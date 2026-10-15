import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId!: string;

  @Column('text', { unique: true })
  email!: string;

  @Column('text', { select: false })
  password!: string;

  @Column('text')
  name!: string;

  @Column({ default: true })
  isActive!: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    this.email = this.email.toLowerCase().trim();
  }
}
