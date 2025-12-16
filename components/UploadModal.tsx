import React, { useRef, useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadTemplate: () => void;
  onUpload: (file: File) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onDownloadTemplate, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">导入 Excel 数据</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 bg-gray-50/50">
            {/* Section 1: Download Template */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <FileSpreadsheet size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">1、下载新增模版</h4>
                        <p className="text-sm text-gray-500 mb-4">
                            模版中最多不能超过1000条数据，大小不超过1G，如超出请分批上传 
                            <a href="#" className="text-blue-600 ml-2 hover:underline">查看帮助说明</a>
                        </p>
                        <button 
                            onClick={onDownloadTemplate}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition text-sm font-medium text-gray-700"
                        >
                            <Download size={16} />
                            下载模版
                        </button>
                    </div>
                </div>
            </div>

            {/* Section 2: Upload */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Upload size={24} />
                    </div>
                    <h4 className="font-bold text-gray-900">2、上传 <span className="text-red-500">*</span></h4>
                </div>
                
                <div 
                    className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center transition-all cursor-pointer
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 bg-white'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                    />
                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <Upload size={32} className="text-gray-400" />
                    </div>
                    <button className="px-6 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 hover:text-blue-600 hover:border-blue-400 transition mb-3">
                        选择文件
                    </button>
                    <p className="text-sm text-gray-400 text-center max-w-md leading-relaxed">
                        下载模版并完善信息后，可直接将文件拖到此处进行上传；<br/>
                        格式支持 xls、xlsx、zip、csv
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;