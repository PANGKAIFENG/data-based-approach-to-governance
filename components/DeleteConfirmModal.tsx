import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "确认删除", 
  description = "确认删除此任务吗？删除后数据将无法恢复。" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-lg shadow-xl w-[400px] transform transition-all animate-in fade-in zoom-in duration-200 p-8 flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
        
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="min-w-[80px] px-4 py-2 bg-white border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
          >
            取 消
          </button>
          <button
            onClick={onConfirm}
            className="min-w-[80px] px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition shadow-sm"
          >
            确 定
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;