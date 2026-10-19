import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    try {
      const user = this.usersRepository.create({ email, passwordHash });
      return await this.usersRepository.save(user);
    } catch (error) {
      const e = error as { code?: string; driverError?: { code?: string } };
      if (e.code === '23505' || e.driverError?.code === '23505') {
        throw new ConflictException('Ya existe una cuenta con ese correo');
      }
      throw error;
    }
  }
}