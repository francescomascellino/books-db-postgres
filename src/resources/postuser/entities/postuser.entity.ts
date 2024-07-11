import { PrimaryGeneratedColumn, Column, OneToMany, Entity } from 'typeorm';
import { PostuserPostbook } from 'src/resources/postuser_postbook/entities/postuser_postbook.entity';

@Entity('puser')
export class Postuser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  name: string;

  /**
   * Relazione uno-a-molti con PostuserPostbook.
   *
   * Ogni utente può avere molti prestiti rappresentati da istanze di PostuserPostbook.
   *
   * Utilizziamo puserPbooks per rappresentare questa relazione:
   * - puserPbooks è un array di istanze di PostuserPostbook associato a questo utente.
   * - La decorazione @OneToMany ci permette di definire una relazione uno-a-molti, indicando che ogni istanza di Postuser
   *   può avere molteplici istanze di PostuserPostbook.
   * - () => PostuserPostbook specifica il tipo dell'entità di destinazione (PostuserPostbook).
   * - (puserPbook) => puserPbook.puser specifica il campo in PostuserPostbook che fa riferimento a questo utente.
   *
   * Il nome "puser" è stato scelto convenzionalmente per rappresentare questa relazione, non è legato a un nome obbligatorio dell'entità Postuser.
   * È buona prassi seguire le convenzioni per mantenere il codice comprensibile e consistente.
   *
   * Questo campo ci permette di accedere a tutti i prestiti (PostuserPostbook) associati a questo utente.
   */
  @OneToMany(() => PostuserPostbook, (puserPbook) => puserPbook.puser)
  puserPbooks: PostuserPostbook[];
}
