import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { allAvailableModels } from '../types/models';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  enabledModels: string[];
}

export function ModelSelector({ selectedModel, onSelectModel, enabledModels }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter models based on enabled models
  const filteredGroups = allAvailableModels.map(group => ({
    ...group,
    models: group.models.filter(model => enabledModels.includes(model.id))
  })).filter(group => group.models.length > 0);

  const allModels = filteredGroups.flatMap(group => group.models);
  const currentModel = allModels.find(m => m.id === selectedModel) || allModels[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="text-gray-900">{currentModel.provider}</span>
        <span className="text-gray-500">{currentModel.name}</span>
        <ChevronDown className="size-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="max-h-[480px] overflow-y-auto py-2">
            {filteredGroups.map((group, idx) => (
              <div key={group.provider}>
                {idx > 0 && <div className="my-2 mx-4 border-t border-gray-200" />}
                <div className="px-4 py-2 text-sm text-gray-500">{group.provider}</div>
                
                <div className="space-y-1 px-2">
                  {group.models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model.id);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <div className={`${model.color || 'bg-gray-400'} size-2.5 rounded-full flex-shrink-0`} />
                      <div className="flex-1">
                        <div className="text-gray-900 mb-0.5">{model.name}</div>
                        {model.description && (
                          <div className="text-xs text-gray-500 line-clamp-1">{model.description}</div>
                        )}
                      </div>
                      {selectedModel === model.id && (
                        <Check className="size-5 text-cyan-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}