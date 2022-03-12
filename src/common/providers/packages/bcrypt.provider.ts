// Wrapping npm package as custom provider, allowing DI
// TODO: move to a 'global' conext?

import { Provider } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BCRYPT_PROVIDER } from '../constants';

export type TypeBcryptProvider = typeof bcrypt;
const BcryptProviderToken = BCRYPT_PROVIDER;

export const BcryptCustomProvider: Provider<typeof bcrypt> = {
  provide: BcryptProviderToken,
  useValue: bcrypt,
};
