import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Verification } from '../entities/verification.entity';

@InputType()
export class ConfirmVerificationCodeInput extends PickType(Verification, [
  'code',
]) {}

@ObjectType()
export class ConfirmVerificationCodeOutput extends CommonOutput {
  @Field((type) => Int, { nullable: true })
  userId?: number;
}
