import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { LoginAdminDto } from './dtoes/login-admin.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() data: LoginAdminDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { accessToken, refreshToken } = await this.authService.signIn(data);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      maxAge: 60 * 30 * 1000,
      sameSite: 'none',
      secure: true,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 2592000000,
      sameSite: 'none',
      secure: true,
    });

    return res.sendStatus(HttpStatus.OK);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const newTokens = await this.authService.refreshTokens(refreshToken);

    res.cookie('access_token', newTokens.accessToken, {
      httpOnly: true,
      maxAge: 60 * 30 * 1000,
      sameSite: 'none',
      secure: true,
    });

    return res.json(newTokens);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res() res: Response, @Req() req): Promise<Response> {
    const adminId = req.user?.admin?.id;

    if (!adminId) {
      throw new UnauthorizedException('Admin ID not found');
    }
    await this.authService.logout(adminId);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.sendStatus(HttpStatus.OK);
  }
}
