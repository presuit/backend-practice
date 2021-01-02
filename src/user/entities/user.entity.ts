import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Common } from 'src/common/entities/common.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';

@InputType('UserEntityInput', { isAbstract: true })
@Entity()
@ObjectType()
export class User extends Common {
  @Column({ unique: true })
  @Field((type) => String)
  email: string;

  @Column()
  @Field((type) => String)
  password: string;

  @Column({ default: false })
  @Field((type) => Boolean, { defaultValue: false })
  isVerified: boolean;

  @Column()
  @Field((type) => String)
  username: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(targetPwd: string): Promise<boolean> {
    if (this.password) {
      return await bcrypt.compare(targetPwd, this.password);
    }
    return false;
  }
}
