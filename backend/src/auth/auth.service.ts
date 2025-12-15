import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // 이메일 중복 확인
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }

    // 비밀번호 해시화
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
    });

    await this.usersRepository.save(user);

    // 토큰 생성
    const tokens = await this.generateTokens(user);

    // 리프레시 토큰 저장
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // 사용자 찾기
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 토큰 생성
    const tokens = await this.generateTokens(user);

    // 리프레시 토큰 저장
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // 리프레시 토큰 검증
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'cs-simulator-refresh-secret-2024',
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      // 저장된 리프레시 토큰과 비교
      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      // 새 토큰 생성
      const tokens = await this.generateTokens(user);

      // 새 리프레시 토큰 저장
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: null });
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  // 사용자 설정 조회
  async getSettings(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'apiKeys', 'enabledModels', 'selectedModel'],
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    // 기본값 설정
    return {
      apiKeys: user.apiKeys || {
        gpt: '',
        gemini: '',
        claude: '',
        perplexity: '',
        ollama: 'http://localhost:11434'
      },
      enabledModels: user.enabledModels || [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gemini-2.0-flash',
        'gemini-1.5-pro',
        'claude-3.5-sonnet',
        'claude-3-opus',
        'perplexity-sonar-pro',
        'ollama-llama3.3'
      ],
      selectedModel: user.selectedModel || 'gpt-4o'
    };
  }

  // 사용자 설정 저장
  async updateSettings(userId: string, settings: {
    apiKeys?: any;
    enabledModels?: string[];
    selectedModel?: string;
  }) {
    const updateData: any = {};
    
    if (settings.apiKeys !== undefined) {
      updateData.apiKeys = settings.apiKeys;
    }
    if (settings.enabledModels !== undefined) {
      updateData.enabledModels = settings.enabledModels;
    }
    if (settings.selectedModel !== undefined) {
      updateData.selectedModel = settings.selectedModel;
    }

    await this.usersRepository.update(userId, updateData);
    return this.getSettings(userId);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'cs-simulator-secret-key-2024',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'cs-simulator-refresh-secret-2024',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, { refreshToken: hashedRefreshToken });
  }
}
