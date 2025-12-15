import { useState } from 'react';
import { X, Search, Check, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { allAvailableModels, Model } from '../types/models';

interface ModelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  enabledModels: string[];
  onSaveEnabledModels: (modelIds: string[]) => void;
}

export function ModelSettings({
  isOpen,
  onClose,
  enabledModels,
  onSaveEnabledModels
}: ModelSettingsProps) {
  const [selectedModels, setSelectedModels] = useState<string[]>(enabledModels);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProviders, setExpandedProviders] = useState<Record<string, number>>({});

  const handleToggleModel = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const handleSelectAll = (providerModels: Model[]) => {
    const modelIds = providerModels.map(m => m.id);
    const allSelected = modelIds.every(id => selectedModels.includes(id));
    
    if (allSelected) {
      setSelectedModels(prev => prev.filter(id => !modelIds.includes(id)));
    } else {
      setSelectedModels(prev => {
        const newIds = modelIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  const handleSave = () => {
    onSaveEnabledModels(selectedModels);
    onClose();
  };

  const handleShowMore = (provider: string, currentCount: number) => {
    setExpandedProviders(prev => ({
      ...prev,
      [provider]: currentCount + 4
    }));
  };

  const filteredGroups = allAvailableModels.map(group => ({
    ...group,
    models: group.models.filter(model =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.provider.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.models.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl">모델 설정</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            모델 선택기에 표시할 모델을 선택하세요
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="모델 검색..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 transition-all"
            />
          </div>
        </div>

        {/* Model List */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-6">
            {filteredGroups.map((group) => {
              const allSelected = group.models.every(m => selectedModels.includes(m.id));
              const someSelected = group.models.some(m => selectedModels.includes(m.id));
              const initialShowCount = 6;
              const showCount = expandedProviders[group.provider] || initialShowCount;
              const visibleModels = group.models.slice(0, showCount);
              const hasMore = group.models.length > showCount;

              return (
                <div key={group.provider} className="space-y-2">
                  {/* Provider Header */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900">{group.provider}</h3>
                    <button
                      onClick={() => handleSelectAll(group.models)}
                      className="text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
                    >
                      {allSelected ? '모두 해제' : '모두 선택'}
                    </button>
                  </div>

                  {/* Models */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {visibleModels.map((model) => {
                      const isSelected = selectedModels.includes(model.id);
                      
                      return (
                        <button
                          key={model.id}
                          onClick={() => handleToggleModel(model.id)}
                          className={`
                            flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left
                            ${isSelected
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                            }
                          `}
                        >
                          {/* Color Dot */}
                          <div className={`${model.color || 'bg-gray-400'} size-3 rounded-full mt-1 flex-shrink-0`} />
                          
                          {/* Model Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{model.name}</span>
                            </div>
                            {model.description && (
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                                {model.description}
                              </p>
                            )}
                          </div>

                          {/* Check Icon */}
                          {isSelected && (
                            <Check className="size-5 text-cyan-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Show More Button */}
                  {hasMore && (
                    <button
                      onClick={() => handleShowMore(group.provider, showCount)}
                      className="w-full py-2 text-sm text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      더보기 ({group.models.length - showCount}개 더)
                      <ChevronDown className="size-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {selectedModels.length}개 모델 선택됨
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={selectedModels.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all"
            >
              저장
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}