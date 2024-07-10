import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post_book')
export class PostBook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column({ length: 50 })
  author: string;

  @Column({ length: 13 })
  ISBN: string;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ nullable: true })
  loaned_to: number | null;
}
