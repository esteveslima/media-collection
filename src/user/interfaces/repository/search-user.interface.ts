// Interface for repository methods
// May extend Entity and modify or omit certain properties to match the operation

import { UserEntity } from 'src/user/user.entity';

export type IParamsRepositorySearchUser = Partial<
  Pick<UserEntity, 'username' | 'email'>
>;
