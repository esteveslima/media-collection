// Responsible for routing public requests

import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SearchMediaDTO } from './dto/search-media.dto';
import { MediaService } from './media.service';
import { IResultServiceGetMedia } from './interfaces/service/media/get-media.interface';
import { IResultServiceSearchMedia } from './interfaces/service/media/search-media.interface';

@Controller('public/media')
// Pipes for DTO validations
@UsePipes(
  new ValidationPipe({
    whitelist: true,
  }),
)
// Interceptor for outputs serialization(applying decorators rules)
@UseInterceptors(ClassSerializerInterceptor)
export class MediaPublicController {
  // Get services and modules from DI
  constructor(private mediaService: MediaService) {}

  // Define and map routes to services

  @Get('/:uuid')
  async getMediaById(
    @Param('uuid', ParseUUIDPipe) mediaUuid,
  ): Promise<IResultServiceGetMedia> {
    return this.mediaService.getMediaById(mediaUuid);
  }

  @Get()
  async searchMedia(
    @Query() searchMediaFilters: SearchMediaDTO,
  ): Promise<IResultServiceSearchMedia[]> {
    return this.mediaService.searchMedia(searchMediaFilters);
  }
}