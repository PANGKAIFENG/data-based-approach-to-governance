import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Shirt, Layers } from 'lucide-react';

interface TemplateFieldSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  initialTab?: 'style' | 'fabric';
}

type TabType = 'style' | 'fabric';

// --- Field Definitions ---

const STYLE_REQUIRED = ['内部编码', '类目', '名称'];
const STYLE_OPTIONAL = [
  '版本名称', '季节', '廓形分类', '款式库字段',
  '品牌', '加工费', '主料成分', '克重', '年份',
  '价格', '款式描述', '版师', '面料', '品牌1', 
  '颜色', '子品牌', '来源', '设计元素',
  '样衣归还时间', '辅料测试', '模特标签',
  '成分', '来源工厂', '尺寸', '功能',
  '尺寸规格'
];

const FABRIC_REQUIRED = ['内部编码', '类目', '名称'];
const FABRIC_OPTIONAL = [
  '成分', '克重', '幅宽', '有效幅宽', '供应商', 
  '供应商编码', '价格', '大货价格', '剪样价格',
  '颜色', '潘通色号', '花型', '缩率', '产地', 
  '纱支', '密度', '后整理', '测试指标', 
  '库存', '起订量', '货期'
];

const TemplateFieldSelectionModal: React.FC<TemplateFieldSelectionModalProps> = ({ isOpen, onClose, onConfirm, initialTab = 'style' }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  // Maintain separate selection states for each tab
  const [styleSelected, setStyleSelected] = useState<Set<string>>(new Set(STYLE_OPTIONAL));
  const [fabricSelected, setFabricSelected] = useState<Set<string>>(new Set(FABRIC_OPTIONAL));

  useEffect(() => {
    if (isOpen) {
        setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Derive current view data based on active tab
  const currentRequired = activeTab === 'style' ? STYLE_REQUIRED : FABRIC_REQUIRED;
  const currentOptional = activeTab === 'style' ? STYLE_OPTIONAL : FABRIC_OPTIONAL;
  const currentSelected = activeTab === 'style' ? styleSelected : fabricSelected;
  const setCurrentSelected = activeTab === 'style' ? setStyleSelected : setFabricSelected;

  const toggleField = (field: string) => {
    const newSet = new Set(currentSelected);
    if (newSet.has(field)) {
      newSet.delete(field);
    } else {
      newSet.add(field);
    }
    setCurrentSelected(newSet);
  };

  const toggleAll = () => {
    if (currentSelected.size === currentOptional.length) {
      setCurrentSelected(new Set());
    } else {
      setCurrentSelected(new Set(currentOptional));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">模版字段选择</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition relative
                ${activeTab === 'style' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Shirt size={16} />
                <span>款式字段</span>
                {activeTab === 'style' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 mx-10 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('fabric')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition relative
                ${activeTab === 'fabric' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Layers size={16} />
                <span>面料字段</span>
                {activeTab === 'fabric' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 mx-10 rounded-t-full"></div>}
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Required Fields */}
            <div>
                <h4 className="font-bold text-gray-800 mb-3 text-sm">必须字段 <span className="text-gray-400 font-normal ml-2 text-xs">默认包含在模版中</span></h4>
                <div className="flex flex-wrap gap-4">
                    {currentRequired.map(field => (
                        <div key={field} className="flex items-center gap-2 cursor-not-allowed opacity-60 bg-gray-50 px-3 py-1.5 rounded border border-gray-100">
                            <CheckSquare size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-500">{field}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Optional Fields */}
            <div>
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                    <h4 className="font-bold text-gray-800 text-sm">选填字段</h4>
                    <button 
                        onClick={toggleAll}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                    >
                        {currentSelected.size === currentOptional.length ? <CheckSquare size={16} /> : <Square size={16} />}
                        全选
                    </button>
                </div>
                <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                    {currentOptional.map(field => {
                        const isSelected = currentSelected.has(field);
                        return (
                            <div 
                                key={field} 
                                onClick={() => toggleField(field)}
                                className="flex items-center gap-2 cursor-pointer group select-none"
                            >
                                <div className={`transition ${isSelected ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                    {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                </div>
                                <span className={`text-sm transition ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>
                                    {field}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg flex justify-between items-center">
            <div className="text-xs text-gray-400">
                当前选择: <span className="font-medium text-blue-600">{activeTab === 'style' ? '款式' : '面料'}</span> 模版
                <span className="mx-2">|</span>
                已选 {currentSelected.size + currentRequired.length} 个字段
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                    取 消
                </button>
                <button 
                    onClick={onConfirm}
                    className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                >
                    下载{activeTab === 'style' ? '款式' : '面料'}模版
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateFieldSelectionModal;