import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
  UserProfileDto,
  UserSettingsDto,
  UserSettingsResponseDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: '이미 등록된 이메일' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@CurrentUser() user: User): Promise<{ message: string }> {
    await this.authService.logout(user.id);
    return { message: '로그아웃되었습니다.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공', type: UserProfileDto })
  async getProfile(@CurrentUser() user: User): Promise<UserProfileDto> {
    const profile = await this.authService.getProfile(user.id);
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      createdAt: profile.createdAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 설정 조회' })
  @ApiResponse({ status: 200, description: '설정 조회 성공', type: UserSettingsResponseDto })
  async getSettings(@CurrentUser() user: User): Promise<UserSettingsResponseDto> {
    return this.authService.getSettings(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 설정 저장' })
  @ApiResponse({ status: 200, description: '설정 저장 성공', type: UserSettingsResponseDto })
  async updateSettings(
    @CurrentUser() user: User,
    @Body() settingsDto: UserSettingsDto
  ): Promise<UserSettingsResponseDto> {
    return this.authService.updateSettings(user.id, settingsDto);
  }
}
