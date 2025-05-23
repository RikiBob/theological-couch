import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { LoginAdminDto } from './dtoes/login-admin.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Sing in',
    description: 'Starting a session and setting access and refresh tokens',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin successfully logged in',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  @ApiBody({ type: LoginAdminDto })
  async login(
    @Body() data: LoginAdminDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const { accessToken, refreshToken } = await this.authService.signIn(
      data,
      req,
    );

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
  @ApiOperation({
    summary: 'Access token renewal',
    description: 'Updates access token via refresh token passed in cookies',
  })
  @ApiCookieAuth()
  @ApiResponse({ status: HttpStatus.OK, description: 'Refresh token renewal' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token missing or invalid',
  })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const newTokens = await this.authService.refreshTokens(refreshToken, req);

    res.cookie('access_token', newTokens.accessToken, {
      httpOnly: true,
      maxAge: 60 * 30 * 1000,
      sameSite: 'none',
      secure: true,
    });

    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: 'Sign out',
    description:
      'Clears access token and refresh token from cookies and ends the session',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged out',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No access or user is not authorized',
  })
  async logout(@Res() res: Response, @Req() req): Promise<Response> {
    const adminId = req.user?.admin?.id;

    if (!adminId) {
      throw new UnauthorizedException('Admin ID not found');
    }
    await this.authService.logout(adminId, req);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return res.sendStatus(HttpStatus.OK);
  }
}
