export interface Model {
  id: string;
  provider: string;
  name: string;
  description?: string;
  color?: string;
}

export interface ModelGroup {
  provider: string;
  models: Model[];
}

export const allAvailableModels: ModelGroup[] = [
  {
    provider: 'GPT',
    models: [
      // GPT-5 Series
      { id: 'gpt-5.2', provider: 'GPT', name: '5.2', description: 'The best model for coding and agentic tasks', color: 'bg-violet-600' },
      { id: 'gpt-5.2-pro', provider: 'GPT', name: '5.2 Pro', description: 'Smarter and more precise responses', color: 'bg-violet-700' },
      { id: 'gpt-5.2-chat-latest', provider: 'GPT', name: '5.2 Chat', description: 'GPT-5.2 model used in ChatGPT', color: 'bg-violet-600' },
      { id: 'gpt-5.1', provider: 'GPT', name: '5.1', description: 'Configurable reasoning effort model', color: 'bg-violet-500' },
      { id: 'gpt-5.1-chat-latest', provider: 'GPT', name: '5.1 Chat', description: 'GPT-5.1 model used in ChatGPT', color: 'bg-violet-500' },
      { id: 'gpt-5', provider: 'GPT', name: '5', description: 'Intelligent reasoning model', color: 'bg-violet-400' },
      { id: 'gpt-5-pro', provider: 'GPT', name: '5 Pro', description: 'More compute for better responses', color: 'bg-violet-500' },
      { id: 'gpt-5-chat-latest', provider: 'GPT', name: '5 Chat', description: 'GPT-5 model used in ChatGPT', color: 'bg-violet-400' },
      { id: 'gpt-5-mini', provider: 'GPT', name: '5 mini', description: 'Faster, cost-efficient version', color: 'bg-violet-300' },
      { id: 'gpt-5-nano', provider: 'GPT', name: '5 nano', description: 'Fastest, most cost-efficient', color: 'bg-violet-200' },
      
      // Codex Series
      { id: 'gpt-5.1-codex-max', provider: 'GPT', name: '5.1 Codex Max', description: 'Most intelligent coding model', color: 'bg-purple-700' },
      { id: 'gpt-5.1-codex', provider: 'GPT', name: '5.1 Codex', description: 'Optimized for agentic coding', color: 'bg-purple-600' },
      { id: 'gpt-5.1-codex-mini', provider: 'GPT', name: '5.1 Codex mini', description: 'Smaller, cost-effective codex', color: 'bg-purple-500' },
      { id: 'gpt-5-codex', provider: 'GPT', name: '5 Codex', description: 'GPT-5 optimized for coding', color: 'bg-purple-500' },
      { id: 'codex-mini-latest', provider: 'GPT', name: 'Codex mini', description: 'Fast reasoning for Codex CLI', color: 'bg-purple-400' },
      
      // o3/o4 Series (Reasoning)
      { id: 'o3', provider: 'GPT', name: 'o3', description: 'Reasoning model for complex tasks', color: 'bg-pink-600' },
      { id: 'o3-pro', provider: 'GPT', name: 'o3 Pro', description: 'More compute for better responses', color: 'bg-pink-700' },
      { id: 'o3-mini', provider: 'GPT', name: 'o3 mini', description: 'Small model alternative to o3', color: 'bg-pink-500' },
      { id: 'o3-deep-research', provider: 'GPT', name: 'o3 Deep Research', description: 'Most powerful deep research', color: 'bg-pink-700' },
      { id: 'o4-mini', provider: 'GPT', name: 'o4 mini', description: 'Fast, cost-efficient reasoning', color: 'bg-pink-400' },
      { id: 'o4-mini-deep-research', provider: 'GPT', name: 'o4 mini Deep Research', description: 'Faster, affordable research', color: 'bg-pink-500' },
      
      // o1 Series (Previous)
      { id: 'o1', provider: 'GPT', name: 'o1', description: 'Previous full o-series reasoning', color: 'bg-rose-600' },
      { id: 'o1-pro', provider: 'GPT', name: 'o1 Pro', description: 'o1 with more compute', color: 'bg-rose-700' },
      { id: 'o1-mini', provider: 'GPT', name: 'o1 mini', description: 'Small alternative to o1', color: 'bg-rose-500' },
      { id: 'o1-preview', provider: 'GPT', name: 'o1 Preview', description: 'Preview of first o-series', color: 'bg-rose-400' },
      
      // GPT-4 Series
      { id: 'gpt-4.1', provider: 'GPT', name: '4.1', description: 'Smartest non-reasoning model', color: 'bg-green-600' },
      { id: 'gpt-4.1-mini', provider: 'GPT', name: '4.1 mini', description: 'Smaller, faster version', color: 'bg-green-500' },
      { id: 'gpt-4.1-nano', provider: 'GPT', name: '4.1 nano', description: 'Fastest, most cost-efficient', color: 'bg-green-400' },
      { id: 'gpt-4o', provider: 'GPT', name: '4o', description: 'Fast, intelligent, flexible model', color: 'bg-green-500' },
      { id: 'gpt-4o-mini', provider: 'GPT', name: '4o mini', description: 'Fast, affordable small model', color: 'bg-green-400' },
      { id: 'chatgpt-4o-latest', provider: 'GPT', name: 'ChatGPT-4o', description: 'GPT-4o used in ChatGPT', color: 'bg-green-500' },
      { id: 'gpt-4.5-preview', provider: 'GPT', name: '4.5 Preview', description: 'Preview of GPT-4.5', color: 'bg-green-600' },
      { id: 'gpt-4-turbo', provider: 'GPT', name: '4 Turbo', description: 'High-intelligence GPT model', color: 'bg-emerald-500' },
      { id: 'gpt-4-turbo-preview', provider: 'GPT', name: '4 Turbo Preview', description: 'Older fast GPT model', color: 'bg-emerald-400' },
      { id: 'gpt-4', provider: 'GPT', name: '4', description: 'Older high-intelligence model', color: 'bg-emerald-400' },
      { id: 'gpt-3.5-turbo', provider: 'GPT', name: '3.5 Turbo', description: 'Legacy GPT model', color: 'bg-blue-400' },
      
      // Audio Models
      { id: 'gpt-audio', provider: 'GPT', name: 'Audio', description: 'Audio inputs and outputs', color: 'bg-indigo-600' },
      { id: 'gpt-audio-mini', provider: 'GPT', name: 'Audio mini', description: 'Cost-efficient audio model', color: 'bg-indigo-500' },
      { id: 'gpt-realtime', provider: 'GPT', name: 'Realtime', description: 'Realtime text and audio', color: 'bg-indigo-700' },
      { id: 'gpt-realtime-mini', provider: 'GPT', name: 'Realtime mini', description: 'Cost-efficient realtime', color: 'bg-indigo-500' },
      { id: 'gpt-4o-audio-preview', provider: 'GPT', name: '4o Audio Preview', description: 'Audio capable GPT-4o', color: 'bg-indigo-500' },
      { id: 'gpt-4o-mini-audio-preview', provider: 'GPT', name: '4o mini Audio Preview', description: 'Audio capable mini', color: 'bg-indigo-400' },
      { id: 'gpt-4o-realtime-preview', provider: 'GPT', name: '4o Realtime Preview', description: 'Realtime text and audio', color: 'bg-indigo-500' },
      { id: 'gpt-4o-mini-realtime-preview', provider: 'GPT', name: '4o mini Realtime Preview', description: 'Realtime mini', color: 'bg-indigo-400' },
      
      // Image Generation
      { id: 'gpt-image-1', provider: 'GPT', name: 'Image 1', description: 'State-of-the-art image generation', color: 'bg-teal-600' },
      { id: 'gpt-image-1-mini', provider: 'GPT', name: 'Image 1 mini', description: 'Cost-efficient image generation', color: 'bg-teal-500' },
      { id: 'dall-e-3', provider: 'GPT', name: 'DALL·E 3', description: 'Previous generation image model', color: 'bg-teal-400' },
      { id: 'dall-e-2', provider: 'GPT', name: 'DALL·E 2', description: 'First image generation model', color: 'bg-teal-300' },
      
      // Video Generation
      { id: 'sora-2', provider: 'GPT', name: 'Sora 2', description: 'Flagship video with synced audio', color: 'bg-fuchsia-600' },
      { id: 'sora-2-pro', provider: 'GPT', name: 'Sora 2 Pro', description: 'Advanced synced-audio video', color: 'bg-fuchsia-700' },
      
      // Search Models
      { id: 'gpt-4o-search-preview', provider: 'GPT', name: '4o Search Preview', description: 'GPT model for web search', color: 'bg-cyan-500' },
      { id: 'gpt-4o-mini-search-preview', provider: 'GPT', name: '4o mini Search Preview', description: 'Fast search model', color: 'bg-cyan-400' },
      
      // Specialized
      { id: 'computer-use-preview', provider: 'GPT', name: 'Computer Use Preview', description: 'Specialized for computer use', color: 'bg-amber-500' },
      
      // Speech
      { id: 'gpt-4o-transcribe', provider: 'GPT', name: '4o Transcribe', description: 'Speech-to-text powered by 4o', color: 'bg-sky-500' },
      { id: 'gpt-4o-transcribe-diarize', provider: 'GPT', name: '4o Transcribe Diarize', description: 'Identifies who\'s speaking', color: 'bg-sky-600' },
      { id: 'gpt-4o-mini-transcribe', provider: 'GPT', name: '4o mini Transcribe', description: 'Speech-to-text mini', color: 'bg-sky-400' },
      { id: 'whisper-1', provider: 'GPT', name: 'Whisper', description: 'General speech recognition', color: 'bg-sky-500' },
      { id: 'gpt-4o-mini-tts', provider: 'GPT', name: '4o mini TTS', description: 'Text-to-speech mini', color: 'bg-sky-400' },
      { id: 'tts-1', provider: 'GPT', name: 'TTS-1', description: 'Text-to-speech optimized for speed', color: 'bg-sky-400' },
      { id: 'tts-1-hd', provider: 'GPT', name: 'TTS-1 HD', description: 'Text-to-speech optimized for quality', color: 'bg-sky-500' },
      
      // Open Source
      { id: 'gpt-oss-120b', provider: 'GPT', name: 'OSS 120B', description: 'Most powerful open-weight model', color: 'bg-slate-600' },
      { id: 'gpt-oss-20b', provider: 'GPT', name: 'OSS 20B', description: 'Medium open-weight model', color: 'bg-slate-500' },
      
      // Legacy
      { id: 'davinci-002', provider: 'GPT', name: 'Davinci-002', description: 'Replacement for GPT-3 davinci', color: 'bg-gray-400' },
      { id: 'babbage-002', provider: 'GPT', name: 'Babbage-002', description: 'Replacement for GPT-3 babbage', color: 'bg-gray-300' },
    ]
  },
  {
    provider: 'Gemini',
    models: [
      // Gemini 3.0 Series (Future)
      { id: 'gemini-3.0-pro', provider: 'Gemini', name: '3.0 Pro', description: '차세대 고성능 모델', color: 'bg-blue-800' },
      { id: 'gemini-3.0-flash', provider: 'Gemini', name: '3.0 Flash', description: '차세대 고속 모델', color: 'bg-blue-700' },
      
      // Gemini 2.5 Series
      { id: 'gemini-2.5-pro', provider: 'Gemini', name: '2.5 Pro', description: '고급 추론 및 분석', color: 'bg-blue-700' },
      { id: 'gemini-2.5-flash', provider: 'Gemini', name: '2.5 Flash', description: '빠른 차세대 모델', color: 'bg-blue-600' },
      
      // Gemini 2.0 Series
      { id: 'gemini-2.0-flash-exp', provider: 'Gemini', name: '2.0 Flash Exp', description: '실험적 최신 모델', color: 'bg-blue-600' },
      { id: 'gemini-2.0-flash-thinking-exp', provider: 'Gemini', name: '2.0 Flash Thinking Exp', description: '고급 추론 능력 (실험)', color: 'bg-blue-600' },
      { id: 'gemini-2.0-flash', provider: 'Gemini', name: '2.0 Flash', description: '멀티모달 라이브 API 지원', color: 'bg-blue-500' },
      
      // Gemini 1.5 Series
      { id: 'gemini-1.5-pro-002', provider: 'Gemini', name: '1.5 Pro (002)', description: '최신 Pro 버전', color: 'bg-blue-500' },
      { id: 'gemini-1.5-pro-001', provider: 'Gemini', name: '1.5 Pro (001)', description: 'Pro 001 버전', color: 'bg-blue-500' },
      { id: 'gemini-1.5-pro', provider: 'Gemini', name: '1.5 Pro', description: 'Google의 고성능 모델', color: 'bg-blue-400' },
      { id: 'gemini-1.5-flash-002', provider: 'Gemini', name: '1.5 Flash (002)', description: '최신 Flash 버전', color: 'bg-blue-400' },
      { id: 'gemini-1.5-flash-001', provider: 'Gemini', name: '1.5 Flash (001)', description: 'Flash 001 버전', color: 'bg-blue-400' },
      { id: 'gemini-1.5-flash', provider: 'Gemini', name: '1.5 Flash', description: '빠르고 효율적인 모델', color: 'bg-blue-300' },
      { id: 'gemini-1.5-flash-8b', provider: 'Gemini', name: '1.5 Flash 8B', description: '소형 고속 모델', color: 'bg-blue-300' },
      
      // Gemini 1.0 Series
      { id: 'gemini-1.0-pro', provider: 'Gemini', name: '1.0 Pro', description: '첫 세대 Pro 모델', color: 'bg-blue-400' },
      { id: 'gemini-1.0-pro-vision', provider: 'Gemini', name: '1.0 Pro Vision', description: '비전 기능 포함', color: 'bg-blue-400' },
      
      // Experimental
      { id: 'gemini-exp-1206', provider: 'Gemini', name: 'Experimental 1206', description: '실험적 최신 모델', color: 'bg-indigo-500' },
      { id: 'gemini-exp-1121', provider: 'Gemini', name: 'Experimental 1121', description: '실험 모델', color: 'bg-indigo-400' },
      { id: 'gemini-exp-1114', provider: 'Gemini', name: 'Experimental 1114', description: '실험 모델', color: 'bg-indigo-400' },
    ]
  },
  {
    provider: 'Claude',
    models: [
      // Claude 4.5 Series (Future)
      { id: 'claude-4.5-opus', provider: 'Claude', name: '4.5 Opus', description: '최고 성능의 차세대 모델', color: 'bg-orange-700' },
      { id: 'claude-4.5-sonnet', provider: 'Claude', name: '4.5 Sonnet', description: '차세대 균형 모델', color: 'bg-orange-600' },
      { id: 'claude-4.5-haiku', provider: 'Claude', name: '4.5 Haiku', description: '차세대 고속 모델', color: 'bg-orange-500' },
      
      // Claude 3.7 Series
      { id: 'claude-3.7-sonnet', provider: 'Claude', name: '3.7 Sonnet', description: '최신 Sonnet 모델', color: 'bg-orange-500' },
      
      // Claude 3.5 Series
      { id: 'claude-3-5-sonnet-20241022', provider: 'Claude', name: '3.5 Sonnet (20241022)', description: '최신 3.5 Sonnet', color: 'bg-orange-500' },
      { id: 'claude-3-5-sonnet-20240620', provider: 'Claude', name: '3.5 Sonnet (20240620)', description: '3.5 Sonnet 버전', color: 'bg-orange-400' },
      { id: 'claude-3.5-sonnet', provider: 'Claude', name: '3.5 Sonnet', description: 'Anthropic의 최고 성능 모델', color: 'bg-orange-400' },
      { id: 'claude-3-5-haiku-20241022', provider: 'Claude', name: '3.5 Haiku (20241022)', description: '최신 3.5 Haiku', color: 'bg-orange-400' },
      { id: 'claude-3.5-haiku', provider: 'Claude', name: '3.5 Haiku', description: '빠르고 저렴한 최신 모델', color: 'bg-orange-400' },
      
      // Claude 3 Series
      { id: 'claude-3-opus-20240229', provider: 'Claude', name: '3 Opus (20240229)', description: 'Opus 최신 버전', color: 'bg-orange-600' },
      { id: 'claude-3-opus', provider: 'Claude', name: '3 Opus', description: '복잡한 작업을 위한 강력한 모델', color: 'bg-orange-500' },
      { id: 'claude-3-sonnet-20240229', provider: 'Claude', name: '3 Sonnet (20240229)', description: 'Sonnet 최신 버전', color: 'bg-orange-400' },
      { id: 'claude-3-sonnet', provider: 'Claude', name: '3 Sonnet', description: '균형잡힌 성능의 모델', color: 'bg-orange-300' },
      { id: 'claude-3-haiku-20240307', provider: 'Claude', name: '3 Haiku (20240307)', description: 'Haiku 최신 버전', color: 'bg-orange-300' },
      { id: 'claude-3-haiku', provider: 'Claude', name: '3 Haiku', description: '빠르고 효율적인 모델', color: 'bg-orange-200' },
      
      // Claude 2 Series
      { id: 'claude-2.1', provider: 'Claude', name: '2.1', description: '개선된 Claude 2', color: 'bg-amber-400' },
      { id: 'claude-2.0', provider: 'Claude', name: '2.0', description: '2세대 Claude 모델', color: 'bg-amber-300' },
      { id: 'claude-instant-1.2', provider: 'Claude', name: 'Instant 1.2', description: '빠른 응답용 모델', color: 'bg-amber-300' },
    ]
  },
  {
    provider: 'Perplexity',
    models: [
      // Sonar Series
      { id: 'sonar-pro', provider: 'Perplexity', name: 'Sonar Pro', description: '고급 검색 기반 모델', color: 'bg-cyan-700' },
      { id: 'sonar', provider: 'Perplexity', name: 'Sonar', description: '빠른 검색 기반 응답', color: 'bg-cyan-600' },
      { id: 'sonar-reasoning', provider: 'Perplexity', name: 'Sonar Reasoning', description: '추론 능력 강화', color: 'bg-cyan-700' },
      
      // Llama Sonar Series
      { id: 'llama-3.1-sonar-huge-128k-online', provider: 'Perplexity', name: 'Llama 3.1 Sonar Huge', description: '최대 성능 온라인 모델', color: 'bg-cyan-600' },
      { id: 'llama-3.1-sonar-large-128k-online', provider: 'Perplexity', name: 'Llama 3.1 Sonar Large', description: '대형 온라인 모델', color: 'bg-cyan-500' },
      { id: 'llama-3.1-sonar-medium-128k-online', provider: 'Perplexity', name: 'Llama 3.1 Sonar Medium', description: '중형 온라인 모델', color: 'bg-cyan-400' },
      { id: 'llama-3.1-sonar-small-128k-online', provider: 'Perplexity', name: 'Llama 3.1 Sonar Small', description: '소형 온라인 모델', color: 'bg-cyan-300' },
      
      // Chat Models
      { id: 'llama-3.1-70b-instruct', provider: 'Perplexity', name: 'Llama 3.1 70B', description: '70B 파라미터 채팅', color: 'bg-cyan-500' },
      { id: 'llama-3.1-8b-instruct', provider: 'Perplexity', name: 'Llama 3.1 8B', description: '8B 파라미터 채팅', color: 'bg-cyan-400' },
    ]
  },
  {
    provider: 'Ollama',
    models: [
      { id: 'ollama-llama3.3', provider: 'Ollama', name: 'Llama 3.3', description: 'Meta의 최신 오픈소스', color: 'bg-gray-700' },
      { id: 'ollama-llama3.2', provider: 'Ollama', name: 'Llama 3.2', description: 'Meta의 오픈소스 모델', color: 'bg-gray-600' },
      { id: 'ollama-llama3.1', provider: 'Ollama', name: 'Llama 3.1', description: 'Meta의 Llama 3.1', color: 'bg-gray-600' },
      { id: 'ollama-exaone3.5', provider: 'Ollama', name: 'EXAONE 3.5', description: 'LG의 한국어 특화 모델', color: 'bg-gray-500' },
      { id: 'ollama-qwen2.5', provider: 'Ollama', name: 'Qwen 2.5', description: 'Alibaba의 다국어 모델', color: 'bg-gray-500' },
      { id: 'ollama-mistral', provider: 'Ollama', name: 'Mistral', description: '효율적인 오픈소스 모델', color: 'bg-gray-400' },
      { id: 'ollama-mixtral', provider: 'Ollama', name: 'Mixtral', description: 'Mistral의 MoE 모델', color: 'bg-gray-500' },
      { id: 'ollama-deepseek-r1', provider: 'Ollama', name: 'DeepSeek R1', description: '추론 특화 모델', color: 'bg-gray-600' },
      { id: 'ollama-phi4', provider: 'Ollama', name: 'Phi-4', description: 'Microsoft의 소형 모델', color: 'bg-gray-500' },
      { id: 'ollama-gemma2', provider: 'Ollama', name: 'Gemma 2', description: 'Google의 오픈 모델', color: 'bg-gray-500' },
      { id: 'ollama-codellama', provider: 'Ollama', name: 'Code Llama', description: '코딩 특화 Llama', color: 'bg-gray-600' },
    ]
  }
];