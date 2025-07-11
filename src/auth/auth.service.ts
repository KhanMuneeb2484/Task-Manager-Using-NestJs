import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ token: string }> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersService.create({
      ...dto,
      password: dto.password,
    });

    const token = this.jwtService.sign({
      sub: (user as UserDocument)._id.toString(),
      role: user.role,
    });

    return { token };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
  const user = await this.usersService.findByEmail(dto.email);
  if (!user) {
    console.log('User not found for email:', dto.email);
    throw new UnauthorizedException('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(dto.password, user.password);
  console.log('Password match:', isMatch);

  if (!isMatch) throw new UnauthorizedException('Invalid credentials');

  const payload = {
    sub: (user as any)._id.toString(),
    role: user.role,
  };

  const token = this.jwtService.sign(payload);
  return { access_token: token };
}
}
