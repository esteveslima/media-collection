// Helper methods decoupled to be used only internally and not exposed to users

import { Injectable } from '@nestjs/common';
import { SearchUserReqDTO } from '../../dtos/rest/req/search-user-req.dto';
import { UserEntity } from '../../models/user.entity';
import { UserRepository } from '../adapters/database/repositories/user.repository';
import { HashService } from '../adapters/clients/hash.service';
import { CustomException } from 'src/common/internals/enhancers/filters/exceptions/custom-exception';

@Injectable()
export class UserInternalService {
  // Get services and repositories from DI
  constructor(
    private userRepository: UserRepository,
    private hashService: HashService,
  ) {}

  // Define methods containing business logic

  async searchUserEntity(
    searchUserFilters: SearchUserReqDTO,
  ): Promise<UserEntity> {
    if (Object.keys(searchUserFilters).length <= 0) {
      throw new CustomException('UserSearchInvalidFilters');
    }

    const usersFound = await this.userRepository.searchUser(searchUserFilters);
    const userFound = usersFound[0];
    if (!userFound) throw new CustomException('UserNotFound');

    return userFound;
  }

  async verifyUserPassword(
    username: string,
    password: string,
  ): Promise<boolean> {
    if (!username || !password) return false;

    const usersFound = await this.userRepository.searchUser({ username });
    const userFound = usersFound[0];
    if (!userFound) return false;

    const userHashPassword = userFound.password;
    const isValidPassword = await this.hashService.compareHash(
      password,
      userHashPassword,
    );

    return isValidPassword;
  }
}
