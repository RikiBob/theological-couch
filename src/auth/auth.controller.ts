import { Body, Controller, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginAdminDto } from "./dtoes/login-admin.dto";


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() data: LoginAdminDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { accessToken, refreshToken } = await this.authService.signIn(data.login, data.password);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      maxAge: 60 * 30 * 1000,
      sameSite: true,
      secure: true,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 2592000000,
      sameSite: true,
      secure: true,
    });

    return res.sendStatus(HttpStatus.OK);
  }

  @Post('logout')
  async logout(@Res() res: Response): Promise<Response> {
    await this.authService.logout();
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.sendStatus(HttpStatus.OK);
  }
}
