import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Logger } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPost } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import UserService from '../user/user.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { skipAuth } from 'src/helpers/skipAuth';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly userService: UserService
  ) {}

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({ description: 'User Registration' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized..' })
  @skipAuth()
  @Post()
  create(@Body() createBlogDto: CreateBlogPost) {
    Logger.log('blog controller user');
    return this.blogService.create(createBlogDto, 'userId');
  }
  // @Post()
  // create(@Body() createBlogDto: CreateBlogPost) {
  //   return this.blogService.create(createBlogDto);
  // }

  @skipAuth()
  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @skipAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.getBlogById(id);
  }

  @skipAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.updateBlogPost(id, updateBlogDto);
  }

  @skipAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.deleteBlogPost(id);
  }
}
