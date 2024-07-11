import { Postbook } from 'src/resources/postbook/entities/postbook.entity';
import { Postuser } from 'src/resources/postuser/entities/postuser.entity';
import {
  PrimaryGeneratedColumn,
  ManyToOne,
  Entity,
  Column,
  JoinColumn,
} from 'typeorm';

@Entity('puser_pbook')
export class PostuserPostbook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  puser_id: number;

  @Column()
  pbook_id: number;

  @ManyToOne(() => Postuser, (postuser) => postuser.puserPbooks)
  @JoinColumn({ name: 'puser_id' })
  puser: Postuser;

  @ManyToOne(() => Postbook, (postbook) => postbook.puserPbooks)
  @JoinColumn({ name: 'pbook_id' })
  pbook: Postbook;
}
