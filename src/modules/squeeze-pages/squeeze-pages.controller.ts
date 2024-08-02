import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SqueezePagesService } from './squeeze-pages.service';
import { CreateSqueezePageDto } from './dto/create-squeeze-pages.dto';
import { UpdateSqueezePageDto } from './dto/update-squeeze-pages.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetSqueezePagesResponseDto } from './dto/get-squeeze-pages-response.dto';
import { CreateSqueezePageResponseDto } from './dto/create-squeeze-pages-response.dto';
import { GetSqueezePagesUrlSlugsResponseDto } from './dto/get-squeeze-pages-url-slugs-response.dto';
import { UpdateSqueezePageResponseDto } from './dto/update-squeeze-page-response.dto';
import { DeleteSqueezePageResponseDto } from './dto/delete-squeeze-page-response.dto';

@ApiBearerAuth()
@ApiTags('Squeeze Pages')
@Controller('squeeze-pages')
export class SqueezePagesController {
  constructor(private readonly squeezePagesService: SqueezePagesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new squeeze page' })
  @ApiResponse({
    status: 201,
    description: 'The squeeze page has been successfully created.',
    type: CreateSqueezePageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal' })
  @Post()
  create(@Body() createSqueezePagesDto: CreateSqueezePageDto) {
    return this.squeezePagesService.create(createSqueezePagesDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all squeeze pages or paginated or search' })
  @ApiResponse({ status: 200, description: 'Squeeze pages fetched successfully', type: GetSqueezePagesResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get()
  findAll(@Query('title') title: string, @Query('page') pageNumber: number, @Query('limit') limit: number) {
    if (title) {
      return this.squeezePagesService.findByTitle(title);
    }
    if (pageNumber && limit) {
      return this.squeezePagesService.findPaginated(pageNumber, limit);
    }
    return this.squeezePagesService.findAll();
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all squeeze pages url slugs' })
  @ApiResponse({
    status: 200,
    description: 'Squeeze pages url slugs fetched successfully',
    type: GetSqueezePagesUrlSlugsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get('/uri-slugs')
  findByUriSlugs() {
    return this.squeezePagesService.findUriSlugs();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a squeeze page by id' })
  @ApiResponse({
    status: 200,
    description: 'The squeeze page has been successfully updated.',
    type: UpdateSqueezePageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSqueezePagesDto: UpdateSqueezePageDto) {
    return this.squeezePagesService.update(id, updateSqueezePagesDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a squeeze page by id' })
  @ApiResponse({
    status: 200,
    description: 'The squeeze page has been successfully deleted.',
    type: DeleteSqueezePageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.squeezePagesService.remove(id);
  }
}
