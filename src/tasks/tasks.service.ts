import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/tasks.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  // ✅ Create task for the requesting user
   async create(dto: CreateTaskDto, userId: string): Promise<Task> {
    const task = new this.taskModel({ ...dto, owner: userId });
    return task.save();
  }

  // ✅ Admin gets all, user gets only their tasks
  async findAll(userId: string, isAdmin: boolean): Promise<Task[]> {
    return isAdmin
      ? this.taskModel.find().exec()
      : this.taskModel.find({ owner: userId }).exec();
  }

  // ✅ Get a task by ID — assumes access check is done in controller
  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  // ✅ Update task if owner or admin
  async update(
    id: string,
    updateDto: UpdateTaskDto,
    userId: string,
    isAdmin: boolean,
  ): Promise<Task> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Task not found');

    if (!isAdmin && task.owner.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to update this task');
    }

    Object.assign(task, updateDto);
    return task.save();
  }

  // ✅ Delete task if owner or admin
  async delete(id: string, userId: string, isAdmin: boolean): Promise<{ message: string }> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Task not found');

    if (!isAdmin && task.owner.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this task');
    }

    await task.deleteOne();
    return { message: 'Task deleted successfully' };
  }

  // ✅ Mark task as completed
  async markAsDone(id: string, userId: string, isAdmin: boolean): Promise<Task> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Task not found');

    if (!isAdmin && task.owner.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to mark this task as done');
    }

    task.status = 'completed';
    return task.save();
  }
}
