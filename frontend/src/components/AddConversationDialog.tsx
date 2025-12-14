import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { User, Briefcase } from 'lucide-react';

interface AddConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'customer' | 'employee') => void;
  projectName?: string;
}

export function AddConversationDialog({ 
  isOpen, 
  onClose, 
  onSelectRole,
  projectName 
}: AddConversationDialogProps) {
  const handleRoleSelect = (role: 'customer' | 'employee') => {
    onSelectRole(role);
    onClose(); // Close dialog after role selection
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">역할 선택</DialogTitle>
          <DialogDescription className="text-sm">
            시뮬레이션할 역할을 선택하세요
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-4">
          {/* Customer Role */}
          <button
            onClick={() => handleRoleSelect('customer')}
            className="group p-4 sm:p-6 rounded-xl border-2 border-cyan-200 hover:border-cyan-500 hover:shadow-lg transition-all bg-gradient-to-br from-cyan-50 to-white cursor-pointer"
          >
            <div className="size-16 rounded-full bg-cyan-100 group-hover:bg-cyan-200 flex items-center justify-center transition-colors">
              <User className="size-8 text-cyan-600" />
            </div>
            <div className="text-center">
              <h3 className="mb-1">고객 역할</h3>
              <p className="text-sm text-gray-500">
                고객 입장에서 대화를 진행합니다
              </p>
            </div>
          </button>

          {/* Employee Role */}
          <button
            onClick={() => handleRoleSelect('employee')}
            className="group p-4 sm:p-6 rounded-xl border-2 border-amber-200 hover:border-amber-500 hover:shadow-lg transition-all bg-gradient-to-br from-amber-50 to-white cursor-pointer"
          >
            <div className="size-16 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
              <Briefcase className="size-8 text-amber-600" />
            </div>
            <div className="text-center">
              <h3 className="mb-1">직원 역할</h3>
              <p className="text-sm text-gray-500">
                직원 입장에서 대화를 진행합니다
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}