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

  @OneToMany(() => PostuserPostbook, (puserPbook) => puserPbook.puser)
  puserPbooks: PostuserPostbook[];
}
