// Interface for repository methods
// May extend Entity and modify or omit certain properties to match the operation

import { IMedia } from 'src/modules/apps/media/interfaces/models/entities/media.interface';

export interface IParamsRepositorySearchMedia
  extends Partial<
    Pick<
      IMedia,
      | 'createdAt'
      | 'title'
      | 'type'
      | 'description'
      | 'durationSeconds'
      | 'views'
      | 'available'
    >
  > {
  username?: string;
  take?: number;
  skip?: number;
}
