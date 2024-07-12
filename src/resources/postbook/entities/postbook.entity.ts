import { PostuserPostbook } from 'src/resources/postuser_postbook/entities/postuser_postbook.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';

@Entity('pbook') // Questo sarà il nome dellatabella che verrà generata
@Unique(['ISBN'])
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

  /**
   * Relazione uno-a-molti con PostuserPostbook.
   *
   * Un libro può avere molti prestiti rappresentati da istanze di PostuserPostbook.
   *
   * Utilizziamo puserPbooks per rappresentare questa relazione:
   * - puserPbooks è un array di istanze di PostuserPostbook associato a questo libro.
   * - La decorazione @OneToMany ci permette di definire una relazione uno-a-molti, indicando che ogni istanza di Postbook
   *   può avere molteplici istanze di PostuserPostbook.
   * - () => PostuserPostbook specifica il tipo dell'entità di destinazione (PostuserPostbook).
   * - (puserPbook) => puserPbook.pbook specifica il campo in PostuserPostbook che fa riferimento a questo libro.
   *
   * Il nome "pbook" è stato scelto convenzionalmente per rappresentare questa relazione, non è legato a un nome obbligatorio dell'entità Postbook.
   * È buona prassi seguire le convenzioni per mantenere il codice comprensibile e consistente.
   *
   * Questo campo ci permette di accedere a tutti i prestiti (PostuserPostbook) associati a questo libro.
   */
  @OneToMany(() => PostuserPostbook, (puserPbook) => puserPbook.pbook)
  puserPbooks: PostuserPostbook[];
}
