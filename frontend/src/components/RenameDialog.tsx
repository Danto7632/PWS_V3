import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  target: { type: 'project' | 'conversation'; id: string; currentName: string } | null;
  onRename: (newName: string) => void;
}

export function RenameDialog({ isOpen, onClose, target, onRename }: RenameDialogProps) {
  const [name, setName] = useState('');

  // Update name when target changes
  useState(() => {
    if (target) {
      setName(target.currentName);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(name.trim());
      onClose();
    }
  };

  if (!target) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {target.type === 'project' ? '프로젝트 이름 바꾸기' : '대화 이름 바꾸기'}
          </DialogTitle>
          <DialogDescription>
            {target.type === 'project' ? '프로젝트의 새 이름을 입력하세요.' : '대화의 새 제목을 입력하세요.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder={target.type === 'project' ? '프로젝트 이름' : '대화 제목'}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              저장
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}