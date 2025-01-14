import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { AdminEntity } from "../entities/admin.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { JwtPayload } from "../strategies/jwt.strategy";
import { LoginAdminDto } from "./dtoes/login-admin.dto";

dotenv.config();

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
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const tokenPair = {
        accessToken: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN_ACCESS
        }),
        refreshToken: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN_REFRESH
        })
      };

      await this.cacheManager.set(
        "refresh_token",
        tokenPair.refreshToken,
        2592000
      );

      return tokenPair;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async checkAdminExists(login: string): Promise<AdminEntity> {
      const existingAdmin = await this.adminRepository.findOneBy({login: login});

      if (!existingAdmin) {
        throw new BadRequestException('Invalid email');
      }

      return existingAdmin;
  }

  private async isPasswordValid(password: string, admin: AdminEntity): Promise<boolean> {
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    return isPasswordValid;
  }

  async signIn(data: LoginAdminDto): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const existingAdmin = await this.checkAdminExists(data.login);
      await this.isPasswordValid(data.password, existingAdmin);

      return this.generateJwt({
        sub: existingAdmin.id,
        login: existingAdmin.login
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.cacheManager.del("refresh_token");
    } catch (error) {
     throw new BadRequestException(error.message);
   }
  }
}
