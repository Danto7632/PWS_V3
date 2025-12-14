import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Key, Eye, EyeOff } from 'lucide-react';

interface ApiKeys {
  gpt: string;
  gemini: string;
  claude: string;
  perplexity: string;
  ollama: string;
}

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSaveApiKeys: (keys: ApiKeys) => void;
}

export function ApiKeySettings({ isOpen, onClose, apiKeys, onSaveApiKeys }: ApiKeySettingsProps) {
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
    gpt: false,
    gemini: false,
    claude: false,
    perplexity: false,
    ollama: false,
  });

  useEffect(() => {
    setKeys(apiKeys);
  }, [apiKeys]);

  const handleSave = () => {
    onSaveApiKeys(keys);
    onClose();
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5" />
            API 키 설정
          </DialogTitle>
          <DialogDescription>
            API 키를 설정하여 모델에 접근할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* GPT API Key */}
          <div className="space-y-2">
            <Label htmlFor="gpt-key" className="flex items-center gap-2">
              <span className="text-gray-900">OpenAI API Key</span>
              <span className="text-xs text-gray-500">(GPT 모델용)</span>
            </Label>
            <div className="relative">
              <Input
                id="gpt-key"
                type={showKeys.gpt ? 'text' : 'password'}
                value={keys.gpt}
                onChange={(e) => setKeys({ ...keys, gpt: e.target.value })}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('gpt')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showKeys.gpt ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:underline"
              >
                platform.openai.com
              </a>
              에서 발급받을 수 있습니다.
            </p>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-2">
            <Label htmlFor="gemini-key" className="flex items-center gap-2">
              <span className="text-gray-900">Google API Key</span>
              <span className="text-xs text-gray-500">(Gemini 모델용)</span>
            </Label>
            <div className="relative">
              <Input
                id="gemini-key"
                type={showKeys.gemini ? 'text' : 'password'}
                value={keys.gemini}
                onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
                placeholder="AI..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('gemini')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showKeys.gemini ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:underline"
              >
                Google AI Studio
              </a>
              에서 발급받을 수 있습니다.
            </p>
          </div>

          {/* Claude API Key */}
          <div className="space-y-2">
            <Label htmlFor="claude-key" className="flex items-center gap-2">
              <span className="text-gray-900">Anthropic API Key</span>
              <span className="text-xs text-gray-500">(Claude 모델용)</span>
            </Label>
            <div className="relative">
              <Input
                id="claude-key"
                type={showKeys.claude ? 'text' : 'password'}
                value={keys.claude}
                onChange={(e) => setKeys({ ...keys, claude: e.target.value })}
                placeholder="sk-ant-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('claude')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showKeys.claude ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:underline"
              >
                Anthropic Console
              </a>
              에서 발급받을 수 있습니다.
            </p>
          </div>

          {/* Perplexity API Key */}
          <div className="space-y-2">
            <Label htmlFor="perplexity-key" className="flex items-center gap-2">
              <span className="text-gray-900">Perplexity API Key</span>
              <span className="text-xs text-gray-500">(Perplexity 모델용)</span>
            </Label>
            <div className="relative">
              <Input
                id="perplexity-key"
                type={showKeys.perplexity ? 'text' : 'password'}
                value={keys.perplexity}
                onChange={(e) => setKeys({ ...keys, perplexity: e.target.value })}
                placeholder="pplx-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('perplexity')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showKeys.perplexity ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              <a
                href="https://www.perplexity.ai/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:underline"
              >
                Perplexity Settings
              </a>
              에서 발급받을 수 있습니다.
            </p>
          </div>

          {/* Ollama URL */}
          <div className="space-y-2">
            <Label htmlFor="ollama-key" className="flex items-center gap-2">
              <span className="text-gray-900">Ollama URL</span>
              <span className="text-xs text-gray-500">(Ollama 모델용)</span>
            </Label>
            <div className="relative">
              <Input
                id="ollama-key"
                type={showKeys.ollama ? 'text' : 'password'}
                value={keys.ollama}
                onChange={(e) => setKeys({ ...keys, ollama: e.target.value })}
                placeholder="http://localhost:11434"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('ollama')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showKeys.ollama ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              로컬 Ollama 서버 URL입니다. 기본값은 http://localhost:11434 입니다.
            </p>
          </div>

          {/* Info */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
            <p className="text-sm text-cyan-900">
              <strong>참고:</strong> API 키는 브라우저에 안전하게 저장되며, 외부로 전송되지 않습니다.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700">
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}