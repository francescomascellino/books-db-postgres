import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pbook') // Questo sarà il nome dellatabella che verrà generata
export class Postbook {
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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Esempio di colonna timestamp con valore di default corrente
  created_at: Date;
}
