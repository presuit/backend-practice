import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Wallet } from '../entities/wallet.entity';

@InputType()
export class AddPointInput extends PickType(Wallet, ['point', 'id']) {}

@ObjectType()
export class AddPointOutput extends CommonOutput {}
