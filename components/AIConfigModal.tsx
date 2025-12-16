import React, { useState } from 'react';
import { X, Search, Check, GripVertical, Shirt, Layers } from 'lucide-react';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Predefined available fields based on the user's request
const AVAILABLE_STYLE_FIELDS = [
  'Internal Code', 'Category', 'Name', 'Create Time',
  'Season', 'Block', '款式库字段', 'Scheme Name',
  'Creator', 'Brand', '加工费', 'Version Name',
  'Main Fabric Content', '克重', 'Editor', 'Update Time',
  'Year', 'Price', 'Style Introduction', '版师',
  'Weave Classification', '品牌', '品牌1', 'color',
  'sub brand', '来源', 'Design Element', '样衣归还时间',
  '胸围', '测试222', 'Avatar Tag', 'Component'
];

const AVAILABLE_FABRIC_FIELDS = [
  'Internal Code', 'Category', 'Name', '成分',
  '克重', '幅宽', '有效幅宽', '供应商',
  '供应商编码', '价格', '大货价格', '剪样价格',
  'Color', '花型', '缩率', '产地',
  '纱支', '密度', '后整理', '测试指标',
  '库存', '起订量', '货期'
];

const AIConfigModal: React.FC<AIConfigModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'style' | 'fabric'>('style');
  const [searchQuery, setSearchQuery] = useState('');

  // Store selected fields as arrays of strings
  const [selectedStyleFields, setSelectedStyleFields] = useState<string[]>([
    'Internal Code', 'Season', 'Year', 'Price'
  ]);
  const [selectedFabricFields, setSelectedFabricFields] = useState<string[]>([
    'Internal Code', 'Name', '成分', '克重'
  ]);

  if (!isOpen) return null;

  const currentAvailable = activeTab === 'style' ? AVAILABLE_STYLE_FIELDS : AVAILABLE_FABRIC_FIELDS;
  const currentSelected = activeTab === 'style' ? selectedStyleFields : selectedFabricFields;
  const setCurrentSelected = activeTab === 'style' ? setSelectedStyleFields : setSelectedFabricFields;

  // Filter available fields based on search
  const filteredAvailable = currentAvailable.filter(field => 
    field.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleField = (field: string) => {
    if (currentSelected.includes(field)) {
      setCurrentSelected(currentSelected.filter(f => f !== field));
    } else {
      setCurrentSelected([...currentSelected, field]);
    }
  };

  const removeField = (field: string) => {
    setCurrentSelected(currentSelected.filter(f => f !== field));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden transform transition-all scale-100 flex flex-col h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-800">配置 AI 识别字段</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition rounded-full p-1 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
            <button 
                onClick={() => { setActiveTab('style'); setSearchQuery(''); }}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition relative
                ${activeTab === 'style' ? 'text-blue-600 bg-white border-t-2 border-t-blue-600' : 'text-gray-500 hover:bg-gray-100 border-t-2 border-t-transparent'}`}
            >
                <Shirt size={16} />
                <span>款式库配置</span>
            </button>
            <button 
                onClick={() => { setActiveTab('fabric'); setSearchQuery(''); }}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition relative
                ${activeTab === 'fabric' ? 'text-blue-600 bg-white border-t-2 border-t-blue-600' : 'text-gray-500 hover:bg-gray-100 border-t-2 border-t-transparent'}`}
            >
                <Layers size={16} />
                <span>面料库配置</span>
            </button>
        </div>

        {/* Content Body - Split View */}
        <div className="flex flex-1 overflow-hidden">
            {/* Left Column: All Fields */}
            <div className="w-2/3 p-6 border-r border-gray-100 flex flex-col">
                <h4 className="font-bold text-gray-800 mb-4">全部字段</h4>
                
                {/* Search */}
                <div className="relative mb-4">
                    <input 
                        type="text" 
                        placeholder="搜索" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                    <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                </div>

                {/* Grid of Checkboxes */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-2">
                        {filteredAvailable.map(field => {
                            const isSelected = currentSelected.includes(field);
                            return (
                                <label key={field} className="flex items-center gap-2 cursor-pointer group select-none">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition flex-shrink-0
                                        ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                                        {isSelected && <Check size={12} className="text-white" />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={isSelected} 
                                        onChange={() => toggleField(field)}
                                    />
                                    <span className={`text-sm truncate ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-600'}`} title={field}>{field}</span>
                                </label>
                            );
                        })}
                    </div>
                    {filteredAvailable.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm">无搜索结果</div>
                    )}
                </div>
            </div>

            {/* Right Column: Selected Fields */}
            <div className="w-1/3 p-6 flex flex-col bg-gray-50/30">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-800">已选字段({currentSelected.length}/{currentAvailable.length})</h4>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {currentSelected.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                            暂无已选字段
                        </div>
                    ) : (
                        currentSelected.map((field) => (
                            <div key={field} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm group hover:border-blue-200 transition animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className="flex items-center gap-3">
                                    <GripVertical size={14} className="text-gray-300 cursor-grab active:cursor-grabbing" />
                                    <span className="text-sm font-medium text-gray-700">{field}</span>
                                </div>
                                <button 
                                    onClick={() => removeField(field)}
                                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConfigModal;