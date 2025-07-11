import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

// ✅ Local interface to fix TS error
interface AuthRequest extends Request {
  user: {
    userId: string;
    role: 'user' | 'admin';
  };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

 @Post()
@Roles('user', 'admin')
create(@Body() dto: CreateTaskDto, @Req() req: AuthRequest) {
  console.log('DTO received:', dto);
  return this.tasksService.create(dto, req.user.userId);
}

  // ✅ Get all tasks (user = own, admin = all)
  @Get()
  @Roles('user', 'admin')
  findAll(@Req() req: AuthRequest) {
    const { userId, role } = req.user;
    return this.tasksService.findAll(userId, role === 'admin');
  }

  // ✅ Get one task (only if owned or admin)
  @Get(':id')
  @Roles('user', 'admin')
  async findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const task = await this.tasksService.findOne(id);
    const { userId, role } = req.user;

    if (role !== 'admin' && task.owner.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to access this task');
    }

    return task;
  }

  // ✅ Update task (only if owned or admin)
  @Patch(':id')
  @Roles('user', 'admin')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req: AuthRequest) {
    const { userId, role } = req.user;
    return this.tasksService.update(id, dto, userId, role === 'admin');
  }

  // ✅ Delete task (only if owned or admin)
  @Delete(':id')
  @Roles('user', 'admin')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    const { userId, role } = req.user;
    return this.tasksService.delete(id, userId, role === 'admin');
  }

  // ✅ Mark as done (only if owned or admin)
  @Patch(':id/done')
  @Roles('user', 'admin')
  markAsDone(@Param('id') id: string, @Req() req: AuthRequest) {
    const { userId, role } = req.user;
    return this.tasksService.markAsDone(id, userId, role === 'admin');
  }
}
