import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminDto {
  @ApiProperty({ example: 'login', description: 'Login for authorization' })
  @IsNotEmpty()
  login: string;
  @ApiProperty({ example: '12345', description: 'Password for authorization' })
  @IsNotEmpty()
  password: string;
}
