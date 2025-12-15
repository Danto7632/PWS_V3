import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Project } from '../types';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export function ExportDialog({ isOpen, onClose, project }: ExportDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const exportData = {
    name: project.name,
    instructions: project.instructions || '',
    files: project.files || [],
    conversations: project.conversations.map(conv => ({
      title: conv.title,
      messages: conv.messages || []
    })),
    exportedAt: new Date().toISOString()
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>프로젝트 내보내기</DialogTitle>
          <DialogDescription>프로젝트를 JSON 형식으로 내보냅니다.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">프로젝트 정보</div>
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-500">이름:</span> {project.name}</div>
              <div><span className="text-gray-500">대화 수:</span> {project.conversations.length}개</div>
              <div><span className="text-gray-500">파일 수:</span> {project.files?.length || 0}개</div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-xs text-gray-100 whitespace-pre-wrap break-all">
              {jsonString}
            </pre>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  JSON 복사
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
            >
              <Download className="size-4" />
              다운로드
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}