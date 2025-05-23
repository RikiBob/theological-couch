import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('health')
export class HealthController {
  @Get()
  checkHealth(@Res() res: Response) {
    return res.sendStatus(HttpStatus.OK);
  }
}
