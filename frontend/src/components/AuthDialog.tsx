import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function AuthDialog({ isOpen, onClose, onLogin }: AuthDialogProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoginMode) {
      // 로그인 로직
      console.log('로그인:', { email: formData.email, password: formData.password });
    } else {
      // 회원가입 로직
      if (formData.password !== formData.confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
      console.log('회원가입:', formData);
    }
    
    onLogin();
    handleClose();
  };

  const handleClose = () => {
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsLoginMode(true);
    onClose();
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} 로그인`);
    onLogin();
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto p-0">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <DialogHeader className="text-center mb-4 sm:mb-6">
            <div className="size-12 sm:size-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-white text-xl sm:text-2xl">CS</span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl mb-1 sm:mb-2">
              {isLoginMode ? '로그인' : '회원가입'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-500">
              CS 업무 시뮬레이터에 오신 것을 환영합니다
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm transition-all cursor-pointer ${
                isLoginMode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm transition-all cursor-pointer ${
                !isLoginMode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {!isLoginMode && (
              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-gray-700">이름</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="이름을 입력하세요"
                    className="pl-9 sm:pl-10 text-sm sm:text-base"
                    required={!isLoginMode}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs sm:text-sm text-gray-700">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="pl-9 sm:pl-10 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm text-gray-700">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="비밀번호를 입력하세요"
                  className="pl-9 sm:pl-10 pr-9 sm:pr-10 text-sm sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4 sm:size-5" /> : <Eye className="size-4 sm:size-5" />}
                </button>
              </div>
            </div>

            {!isLoginMode && (
              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-gray-700">비밀번호 확인</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="비밀번호를 다시 입력하세요"
                    className="pl-9 sm:pl-10 pr-9 sm:pr-10 text-sm sm:text-base"
                    required={!isLoginMode}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4 sm:size-5" /> : <Eye className="size-4 sm:size-5" />}
                  </button>
                </div>
              </div>
            )}

            {isLoginMode && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">로그인 상태 유지</span>
                </label>
                <button type="button" className="text-cyan-600 hover:text-cyan-700 cursor-pointer">
                  비밀번호 찾기
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white py-5 sm:py-6 text-sm sm:text-base"
            >
              {isLoginMode ? '로그인' : '회원가입'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-4 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-2 sm:space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="w-full flex items-center justify-center gap-3 py-2.5 sm:py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base cursor-pointer"
            >
              <svg className="size-4 sm:size-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google로 계속하기</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('GitHub')}
              className="w-full flex items-center justify-center gap-3 py-2.5 sm:py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base cursor-pointer"
            >
              <svg className="size-4 sm:size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub로 계속하기</span>
            </button>
          </div>

          {/* Terms */}
          {!isLoginMode && (
            <p className="text-[10px] sm:text-xs text-center text-gray-500 mt-4 sm:mt-6">
              회원가입 시{' '}
              <button type="button" className="text-cyan-600 hover:underline cursor-pointer">
                이용약관
              </button>
              {' '}및{' '}
              <button type="button" className="text-cyan-600 hover:underline cursor-pointer">
                개인정보처리방침
              </button>
              에 동의하게 됩니다.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}