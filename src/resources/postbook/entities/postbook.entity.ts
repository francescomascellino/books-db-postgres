import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pbook') // Questo sarà il nome dellatabella che verrà generata
export class Postbook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'varchar', length: 50 })
  author: string;

  @Column({ type: 'varchar', length: 13, unique: true })
  ISBN: string;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'integer', nullable: true })
  loaned_to: number | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Esempio di colonna timestamp con valore di default corrente
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
