import { useState } from 'react';
import { Search, Download, X, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  instructions: string;
  files?: { name: string; content: string }[];
}

const templates: Template[] = [
  {
    id: 'cs-basic',
    name: 'CS 기본 응대',
    description: '고객 문의에 친절하고 정확하게 응대하는 기본 템플릿',
    icon: '💬',
    category: '고객 서비스',
    instructions: '당신은 친절하고 전문적인 고객 서비스 담당자입니다.\n\n주요 역할:\n1. 고객의 문의사항을 정확히 파악하기\n2. 친절하고 명확한 답변 제공하기\n3. 문제 해결을 위한 구체적인 단계 안내하기\n\n응대 원칙:\n- 항상 존댓말 사용\n- 공감과 이해를 표현\n- 명확하고 간결한 답변\n- 추가 도움이 필요한지 확인'
  },
  {
    id: 'cs-complaint',
    name: '불만 처리 전문가',
    description: '고객 불만을 효과적으로 처리하고 해결하는 템플릿',
    icon: '🛡️',
    category: '고객 서비스',
    instructions: '당신은 고객 불만 처리 전문가입니다.\n\n처리 프로세스:\n1. 경청: 고객의 불만을 끝까지 듣기\n2. 공감: 고객의 감정을 이해하고 공감 표현\n3. 사과: 불편을 끼친 점에 대해 진심으로 사과\n4. 해결: 구체적인 해결책 제시\n5. 확인: 고객이 만족하는지 확인\n\n핵심 원칙:\n- 감정적으로 대응하지 않기\n- 고객의 입장에서 생각하기\n- 즉시 해결 가능한 방안 제시\n- 에스컬레이션 필요 시 상급자 연결'
  },
  {
    id: 'product-qa',
    name: '제품 Q&A',
    description: '제품 관련 질문에 상세하게 답변하는 템플릿',
    icon: '📦',
    category: '제품 지원',
    instructions: '당신은 제품 전문가입니다.\n\n답변 가이드:\n1. 제품 사양과 기능을 정확히 설명\n2. 사용 방법을 단계별로 안내\n3. 문제 해결 방법 제시\n4. 관련 매뉴얼이나 자료 링크 제공\n\n유의사항:\n- 기술 용어는 쉽게 풀어서 설명\n- 비교 요청 시 객관적으로 답변\n- 확실하지 않은 정보는 확인 후 답변'
  },
  {
    id: 'order-tracking',
    name: '주문/배송 조회',
    description: '주문과 배송 상태를 확인하고 안내하는 템플릿',
    icon: '🚚',
    category: '주문 관리',
    instructions: '당신은 주문 및 배송 안내 담당자입니다.\n\n처리 항목:\n1. 주문 번호로 주문 상태 확인\n2. 배송 현황 안내\n3. 배송 지연 시 사유 설명 및 예상 도착일 안내\n4. 반품/교환 절차 안내\n\n안내 시 포함 정보:\n- 주문 일시\n- 현재 배송 상태\n- 예상 도착 일시\n- 배송 업체 및 송장 번호\n- 문제 발생 시 조치 방법'
  },
  {
    id: 'refund-exchange',
    name: '환불/교환 처리',
    description: '환불 및 교환 요청을 처리하는 템플릿',
    icon: '↩️',
    category: '반품 관리',
    instructions: '당신은 환불 및 교환 처리 담당자입니다.\n\n처리 절차:\n1. 환불/교환 사유 확인\n2. 해당 정책 안내\n3. 필요 서류 및 절차 설명\n4. 처리 기간 안내\n5. 환불 방법 선택 (계좌 입금, 카드 취소 등)\n\n확인 사항:\n- 반품 가능 기간 (구매 후 7일 이내 등)\n- 제품 상태 (미개봉, 사용 흔적 등)\n- 환불 예상 일정\n- 반송 배송비 부담 주체'
  },
  {
    id: 'technical-support',
    name: '기술 지원',
    description: '기술적 문제를 진단하고 해결하는 템플릿',
    icon: '🔧',
    category: '기술 지원',
    instructions: '당신은 기술 지원 전문가입니다.\n\n문제 해결 프로세스:\n1. 증상 파악: 정확한 문제 상황 확인\n2. 진단: 가능한 원인 분석\n3. 해결: 단계별 해결 방법 안내\n4. 확인: 문제가 해결되었는지 확인\n5. 예방: 재발 방지 방법 안내\n\n트러블슈팅 팁:\n- 고객의 기술 수준을 파악하여 설명 조절\n- 스크린샷이나 로그 파일 요청\n- 원격 지원이 필요한 경우 안내\n- 해결 불가 시 상급 기술팀 연결'
  }
];

interface LibraryPageProps {
  onImport: (template: Template) => void;
  onClose: () => void;
}

export function LibraryPage({ onImport, onClose }: LibraryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const categories = ['전체', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white border-l border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl">템플릿 라이브러리</h1>
            <p className="text-sm text-gray-600">
              사전 정의된 CS 시뮬레이션 템플릿을 탐색하고 내 프로젝트로 가져오세요
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            placeholder="템플릿 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === category
                  ? 'bg-cyan-100 text-cyan-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="mb-8">
          <h2 className="text-lg mb-4">추천 템플릿</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1">{template.name}</h3>
                    <p className="text-xs text-gray-500">{template.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {template.description}
                </p>
                <Button
                  onClick={() => onImport(template)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-2"
                >
                  <Download className="size-4" />
                  내 프로젝트로 가져오기
                </Button>
              </div>
            ))}
          </div>
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            검색 결과가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}