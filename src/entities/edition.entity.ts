import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionEntity } from './question.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('edition')
export class EditionEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ length: 100 })
  @ApiProperty()
  url_video: string;

  @Column({ length: 255 })
  @ApiProperty()
  name: string;

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;

  @OneToMany(() => QuestionEntity, (question) => question.edition)
  questions: QuestionEntity[];
}
