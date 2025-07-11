// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/users.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: 'user' | 'admin';
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Admin-only: Create user manually
  @Post('create')
  @Roles('admin')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  // ✅ Admin-only: Get all users
  @Get()
  @Roles('admin')
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // ✅ Authenticated user: Get own profile
  @Get('me')
  @Roles('user', 'admin')
  async getMyProfile(@Req() req: AuthenticatedRequest): Promise<User> {
    return this.usersService.findById(req.user.userId);
  }


  // ✅ Admin-only: Find user by ID
  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  // ✅ Admin-only: Update any user
  @Patch(':id')
  @Roles('admin')
  async updateUser(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto
  ): Promise<User> {
    return this.usersService.update(id, updateDto);
  }

  // ✅ Admin-only: Delete user
  @Delete(':id')
  @Roles('admin')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }
}
