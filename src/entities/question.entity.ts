import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EditionEntity } from './edition.entity';

@Entity('questions')
export class QuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 2000 })
  question_text: string;

  @Column({ length: 100, nullable: true })
  url_answer: string;

  @Column({ nullable: true })
  question_summary: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  edition_id: number;

  @ManyToOne(() => EditionEntity, (edition) => edition.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'edition_id' })
  edition: EditionEntity;
}
