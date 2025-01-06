import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { EditionEntity } from "./edition.entity";

@Entity('questions')
export class QuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({length: 255})
  email: string

  @Column({length: 2000})
  question_text: string

  @Column({length: 100})
  url_response: string

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => EditionEntity, (edition) => edition.questions)
  edition: EditionEntity
}