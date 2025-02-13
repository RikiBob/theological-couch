import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionEntity } from './question.entity';

@Entity('edition')
export class EditionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  url_video: string;

  @Column({ length: 255 })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => QuestionEntity, (question) => question.edition)
  questions: QuestionEntity[];
}
