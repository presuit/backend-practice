import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@InputType('VerificationEntityInput', { isAbstract: true })
@Entity()
@ObjectType()
export class Verification extends Common {
  @Column()
  @Field((type) => String)
  code: string;

  @OneToOne((type) => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Field((type) => User)
  user: User;

  @BeforeInsert()
  generateCode() {
    this.code = uuidv4();
  }
}
