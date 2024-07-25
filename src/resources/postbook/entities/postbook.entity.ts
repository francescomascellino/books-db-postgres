import { PostuserPostbook } from 'src/resources/postuser_postbook/entities/postuser_postbook.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
  CreateDateColumn,
  OneToOne,
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

  @CreateDateColumn()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Esempio di colonna timestamp con valore di default corrente
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  /**
   * Relazione uno-a-uno con PostuserPostbook.
   *
   * Un libro può avere un solo prestito rappresentato da una singola istanza di PostuserPostbook.
   *
   * Utilizziamo puserPbook per rappresentare questa relazione:
   * - puserPbook è un'istanza di PostuserPostbook associata a questo libro.
   * - La decorazione @OneToOne ci permette di definire una relazione uno-a-uno, indicando che ogni istanza di Postbook
   *   può avere una singola istanza di PostuserPostbook.
   * - () => PostuserPostbook specifica il tipo dell'entità di destinazione (PostuserPostbook).
   * - (puserPbook) => puserPbook.pbook specifica il campo in PostuserPostbook che fa riferimento a questo libro.
   *
   * Il nome "pbook" è stato scelto convenzionalmente per rappresentare questa relazione, non è legato a un nome obbligatorio dell'entità Postbook.
   * È buona prassi seguire le convenzioni per mantenere il codice comprensibile e consistente.
   *
   * Questo campo ci permette di accedere al prestito (PostuserPostbook) associato a questo libro.
   */
  // 1 Postbook ha molti PostuserPostbook.
  @OneToOne(() => PostuserPostbook, (puserPbook) => puserPbook.pbook)
  puserPbook: PostuserPostbook;
}
