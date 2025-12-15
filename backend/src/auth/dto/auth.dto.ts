import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호 (최소 6자)' })
  @IsString()
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  password: string;

  @ApiProperty({ example: '홍길동', description: '사용자 이름', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호' })
  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '리프레시 토큰' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken: string;

  @ApiProperty({ description: '리프레시 토큰' })
  refreshToken: string;

  @ApiProperty({ description: '사용자 정보' })
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;
}

export class ApiKeysDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gpt?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gemini?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  claude?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  perplexity?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ollama?: string;
}

export class UserSettingsDto {
  @ApiProperty({ required: false, type: ApiKeysDto })
  @IsOptional()
  apiKeys?: ApiKeysDto;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  enabledModels?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  selectedModel?: string;
}

export class UserSettingsResponseDto {
  @ApiProperty({ type: ApiKeysDto })
  apiKeys: ApiKeysDto;

  @ApiProperty({ type: [String] })
  enabledModels: string[];

  @ApiProperty()
  selectedModel: string;
}
