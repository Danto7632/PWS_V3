import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { FileText, Trash2, Upload } from 'lucide-react';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { ProjectFile } from '../types';

interface ProjectSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (files: ProjectFile[], guidelines: string, uploadPercentage: number) => void;
  isLoggedIn: boolean;
}

export function ProjectSetupDialog({ isOpen, onClose, onComplete, isLoggedIn }: ProjectSetupDialogProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [guidelines, setGuidelines] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(100);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles: ProjectFile[] = Array.from(selectedFiles).map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles) {
      const newFiles: ProjectFile[] = Array.from(droppedFiles).map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleComplete = () => {
    onComplete(files, guidelines, uploadPercentage);
    setFiles([]);
    setGuidelines('');
    setUploadPercentage(100);
    onClose();
  };

  const handleClose = () => {
    setFiles([]);
    setGuidelines('');
    setUploadPercentage(100);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              📁 자료 준비
            </span>
            {!isLoggedIn && (
              <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                ⚠️ 비회원 모드
              </span>
            )}
          </div>
          <DialogTitle className="text-xl sm:text-2xl">
            대화용 매뉴얼 업로드 또는 프롬프트 입력
          </DialogTitle>
          <DialogDescription className="sr-only">
            프로젝트에 파일을 업로드하고 지침을 작성하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left Side - File Upload */}
          <div className="space-y-4">
            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 mb-4">
                {files.map((file) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    onRemove={handleRemoveFile}
                  />
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${ 
                isDragging
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.xlsx,.xls,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-setup"
              />
              <label htmlFor="file-upload-setup" className="cursor-pointer">
                <p className="mb-4">파일을 끌어다 놓거나</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mb-4"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('file-upload-setup')?.click();
                  }}
                >
                  파일 선택
                </Button>
                <p className="text-sm text-gray-500">
                  PDF, TXT, Excel 지원 · 최대 200MB
                </p>
              </label>
            </div>

            {/* Upload Percentage Slider */}
            <div className="space-y-3 pt-4">
              <label className="text-sm">업데이 학습 수준: {uploadPercentage}%</label>
              <Slider
                value={[uploadPercentage]}
                onValueChange={(value) => setUploadPercentage(value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Right Side - Text Guidelines */}
          <div className="space-y-4">
            <div>
              <label className="text-sm mb-2 block">텍스트 프롬프트 입력 (선택)</label>
              <Textarea
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                placeholder="매뉴얼 대신 사용할 지침이나 서비스 정보를 텍스트로 입력하세요."
                className="min-h-[300px] resize-none"
              />
            </div>
            
            <Button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
            >
              매뉴얼 학습 시작
            </Button>

            <div className="space-y-2 text-sm text-gray-500">
              <p>파일 업로드 또는 텍스트 입력 중 하나는 필수입니다.</p>
              <p>아직 업로드된 매뉴얼이 없습니다. 자료를 추가해 시뮬레이션을 시작하세요.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface FileItemProps {
  file: ProjectFile;
  onRemove: (id: string) => void;
}

function FileItem({ file, onRemove }: FileItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getFileIcon = () => {
    if (file.type.includes('pdf')) {
      return (
        <div className="size-10 rounded bg-red-500 flex items-center justify-center flex-shrink-0">
          <FileText className="size-5 text-white" />
        </div>
      );
    }
    return (
      <div className="size-10 rounded bg-gray-500 flex items-center justify-center flex-shrink-0">
        <FileText className="size-5 text-white" />
      </div>
    );
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {getFileIcon()}
      <div className="flex-1 min-w-0">
        <p className="truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
      </div>
      {isHovered && (
        <button
          onClick={() => onRemove(file.id)}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="size-4 text-gray-600" />
        </button>
      )}
    </div>
  );
}