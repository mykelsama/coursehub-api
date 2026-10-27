import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { JwtPayload } from './types/jwt-payload.type.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  // Hash de relleno: permite comparar aunque el correo no exista.
  private readonly dummyHash = bcrypt.hashSync('contrasena-de-relleno', 12);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create(dto.email, passwordHash);
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  async login(dto: LoginDto) {
    const user = await this.validateCredentials(dto.email, dto.password);
    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }

  private async validateCredentials(email: string, password: string) {
    const user = await this.usersService.findByEmailWithPassword(email);

    const passwordMatches = await bcrypt.compare(
      password,
      user?.passwordHash ?? this.dummyHash,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }
}