import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { AdminEntity } from '../entities/admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../strategies/jwt.strategy';
import { LoginAdminDto } from './dtoes/login-admin.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private async generateJwt(
    payload: JwtPayload,
    req: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const tokenPair = {
        accessToken: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN_ACCESS,
        }),
        refreshToken: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN_REFRESH,
        }),
      };

      await this.cacheManager.set(
        `refresh_token_${payload.sub}_${req.headers['user-agent']}`,
        tokenPair.refreshToken,
        2592000000,
      );

      return tokenPair;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async checkAdminExists(login: string): Promise<AdminEntity> {
    const existingAdmin = await this.adminRepository.findOneBy({
      login: login,
    });

    if (!existingAdmin) {
      throw new BadRequestException('Invalid email');
    }

    return existingAdmin;
  }

  private async isPasswordValid(
    password: string,
    admin: AdminEntity,
  ): Promise<boolean> {
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    return isPasswordValid;
  }

  async signIn(
    data: LoginAdminDto,
    req: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const existingAdmin = await this.checkAdminExists(data.login);
      await this.isPasswordValid(data.password, existingAdmin);

      return this.generateJwt(
        {
          sub: existingAdmin.id,
          login: existingAdmin.login,
        },
        req,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async refreshTokens(refreshToken: string, req: Request) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      const admin = await this.adminRepository.findOneBy({
        login: payload.login,
      });

      if (!admin) {
        throw new UnauthorizedException('User not found');
      }

      const storedToken = await this.cacheManager.get(
        `refresh_token_${admin.id}_${req.headers['user-agent']}`,
      );

      if (storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.jwtService.sign(
        { sub: admin.id, login: admin.login },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN_ACCESS,
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(adminId: number, req: Request): Promise<void> {
    try {
      await this.cacheManager.del(
        `refresh_token_${adminId}_${req.headers['user-agent']}`,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
