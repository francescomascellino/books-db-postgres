import { Postbook } from 'src/resources/postbook/entities/postbook.entity';
import { Postuser } from 'src/resources/postuser/entities/postuser.entity';
import {
  PrimaryGeneratedColumn,
  ManyToOne,
  Entity,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';

@Entity('puser_pbook')
export class PostuserPostbook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  puser_id: number;

  @Column({ unique: true, nullable: false })
  pbook_id: number;

  /**
   * Relazione molti-a-uno con Postuser.
   *
   * Ogni prestito (PostuserPostbook) fa riferimento a un singolo utente (Postuser).
   *
   * Utilizziamo puser per rappresentare questa relazione:
   * - puser è l'istanza di Postuser associata a questo prestito (PostuserPostbook).
   * - La decorazione @ManyToOne ci permette di definire una relazione molti-a-uno, indicando che molteplici istanze di PostuserPostbook
   *   possono fare riferimento a un singolo utente (Postuser).
   * - () => Postuser specifica il tipo dell'entità di destinazione (Postuser).
   * - (postuser) => postuser.puserPbooks specifica il campo in Postuser che fa riferimento a questo prestito (PostuserPostbook).
   * - @JoinColumn({ name: 'puser_id' }) specifica il nome della colonna nel database che mappa questa relazione.
   *
   * Questo campo ci permette di accedere all'utente associato a questo prestito (PostuserPostbook).
   */
  // puserPbooks è stato definito in postuser.entity.ts
  @ManyToOne(() => Postuser, (postuser) => postuser.puserPbooks)
  @JoinColumn({ name: 'puser_id' })
  puser: Postuser;

  /**
   * Relazione uno-a-uno con Postbook.
   *
   * Un prestito (PostuserPostbook) fa riferimento a un singolo libro (Postbook).
   *
   * Utilizziamo pbook per rappresentare questa relazione:
   * - pbook è l'istanza di Postbook associata a questo prestito (PostuserPostbook).
   * - La decorazione @OneToOne ci permette di definire una relazione uno-a-uno, indicando che una istanza di PostuserPostbook
   *   può fare riferimento a un singolo libro (Postbook).
   * - () => Postbook specifica il tipo dell'entità di destinazione (Postbook).
   * - (postbook) => postbook.puserPbooks specifica il campo in Postbook che fa riferimento a questo prestito (PostuserPostbook).
   * - @JoinColumn({ name: 'pbook_id' }) specifica il nome della colonna nel database che mappa questa relazione.
   *
   * Questo campo ci permette di accedere al libro associato a questo prestito (PostuserPostbook).
   */
  @OneToOne(() => Postbook, (postbook) => postbook.puserPbooks)
  @JoinColumn({ name: 'pbook_id' })
  pbook: Postbook;
}
