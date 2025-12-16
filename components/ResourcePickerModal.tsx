import React, { useState } from 'react';
import { Search, Camera, Filter, ChevronDown, Trash2, CheckSquare, Square, AlertCircle, CheckCircle } from 'lucide-react';

interface ResourceItem {
  id: string;
  name: string;
  imageUrl: string;
  code: string;
  brand: string;
  aiStatus: 'completed' | 'pending';
  weight?: string;
  composition?: string;
  price?: string;
  updateTime?: string;
  category?: string;
  season?: string;
}

// Generate realistic mock data for table view
const MOCK_RESOURCES: ResourceItem[] = Array.from({ length: 15 }).map((_, i) => ({
  id: String(i + 1),
  name: i % 3 === 0 ? (i % 2 === 0 ? '休闲格纹衬衫' : '红白格纹面料') : i % 3 === 1 ? '纯棉T恤' : '高腰阔腿裤',
  imageUrl: `https://picsum.photos/seed/${i + 520}/100/100`,
  code: `SKU-${2024000 + i}`,
  brand: ['Zara', 'Uniqlo', 'H&M', 'UR'][i % 4],
  aiStatus: i % 3 === 0 ? 'completed' : 'pending',
  weight: `${120 + i * 5}GSM`,
  composition: ['100%棉', '95%棉 5%氨纶', '100%聚酯纤维', '50%棉 50%麻'][i % 4],
  price: `¥${(20 + i * 1.5).toFixed(2)}`,
  updateTime: `2023-11-${String((i % 30) + 1).padStart(2, '0')} 16:00:00`,
  category: ['上装', '下装', '连衣裙', '面料'][i % 4],
  season: ['2024春', '2024夏', '2024秋', '四季'][i % 4]
}));

interface ResourcePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'style' | 'fabric';
  onConfirm: (selectedIds: string[]) => void;
}

const ResourcePickerModal: React.FC<ResourcePickerModalProps> = ({ isOpen, onClose, title, type, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [aiFilter, setAiFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
      if (selectedIds.size === filteredData.length && filteredData.length > 0) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(filteredData.map(i => i.id)));
      }
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
    setSelectedIds(new Set());
    onClose();
  };

  const filteredData = MOCK_RESOURCES.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAi = aiFilter ? item.aiStatus === aiFilter : true;
      return matchesSearch && matchesAi;
  });

  const isAllSelected = filteredData.length > 0 && selectedIds.size === filteredData.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-7xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex gap-8 text-sm font-bold text-gray-500">
                <span className="text-gray-900 border-b-2 border-black pb-4 -mb-4 px-1 cursor-pointer">公开{type === 'style' ? '款式' : '面料'}</span>
                <span className="hover:text-gray-900 cursor-pointer px-1">我的{type === 'style' ? '款式' : '面料'}</span>
                <span className="hover:text-gray-900 cursor-pointer px-1">客户{type === 'style' ? '款式' : '面料'}</span>
                <span className="hover:text-gray-900 cursor-pointer px-1">我的协作</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="搜索名称或编码" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-3 pr-10 py-1.5 border border-gray-300 rounded text-sm w-64 focus:outline-none focus:border-blue-500 transition"
                    />
                    <Search size={16} className="absolute right-3 top-2 text-gray-400"/>
                </div>
                <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600" title="以图搜图"><Camera size={16}/></button>
                <button className="p-1.5 border border-blue-500 text-blue-500 bg-blue-50 rounded hover:bg-blue-100"><Filter size={16}/></button>
            </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white text-xs text-gray-600 flex flex-col gap-3 flex-shrink-0 shadow-sm z-10">
             {/* First Row */}
             <div className="flex items-center gap-6 w-full flex-wrap">
                <FilterDropdown label="源文件" />
                <FilterDropdown label={type === 'style' ? "是否有样衣" : "是否有实物"} />
                <FilterDropdown label="创建时间" />
                <FilterDropdown label={type === 'style' ? "款式类型" : "面料类型"} />
                
                {/* AI Governance Filter - Highlighted */}
                <div className="relative group flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-1 rounded border border-blue-100">
                    <span className={aiFilter ? "text-blue-700 font-bold" : "text-blue-600 font-medium"}>AI治理</span>
                    <ChevronDown size={12} className="text-blue-600"/>
                     <select 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        value={aiFilter}
                        onChange={(e) => setAiFilter(e.target.value)}
                     >
                        <option value="">全部</option>
                        <option value="completed">完成治理</option>
                        <option value="pending">未治理</option>
                     </select>
                </div>
                
                <FilterDropdown label="显示权限" />
                <FilterDropdown label="客户是否可见" />
                <FilterDropdown label="内部编码" />
                
                <div className="flex-1"></div>
                <button className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition"><Trash2 size={14}/></button>
             </div>
             
             {/* Second row of filters */}
             <div className="flex items-center gap-6 w-full flex-wrap">
                <FilterDropdown label="名称" />
                <FilterDropdown label="品牌" />
                <FilterDropdown label="封面图" />
                {type === 'style' && <FilterDropdown label="附件-3D工程文件" />}
                <FilterDropdown label="主料成分" />
                <FilterDropdown label="克重" />
                <FilterDropdown label="颜色" />
                {type === 'style' && <FilterDropdown label="样衣归还时间" />}
             </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                        <th className="px-4 py-3 border-b border-gray-200 w-12 text-center">
                            <div onClick={handleSelectAll} className="cursor-pointer flex justify-center text-gray-400 hover:text-blue-600">
                                {isAllSelected ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16}/>}
                            </div>
                        </th>
                        <th className="px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500 w-20">缩略图</th>
                        <th className="px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500">内部编码</th>
                        <th className="px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500">名称</th>
                        <th className="px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500">品牌</th>
                        
                        {type === 'style' ? (
                            <>
                                <th className="px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500">季节</th>
                                <th className="px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500">品类</th>
                            </>
                        ) : (
                            <>
                                <th className="px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500">克重</th>
                                <th className="px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500">成分</th>
                                <th className="px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500">价格</th>
                            </>
                        )}
                        
                        <th className="px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500 w-24">AI治理</th>
                        <th className="px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500 w-40">更新时间</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredData.length === 0 ? (
                        <tr>
                            <td colSpan={10} className="p-20 text-center text-gray-400">
                                <Search size={48} className="mx-auto mb-4 text-gray-200"/>
                                <p>没有找到相关资源</p>
                            </td>
                        </tr>
                    ) : (
                        filteredData.map(item => (
                            <tr 
                                key={item.id} 
                                onClick={() => toggleSelection(item.id)}
                                className={`hover:bg-blue-50/30 transition cursor-pointer text-sm text-gray-700
                                ${selectedIds.has(item.id) ? 'bg-blue-50/50' : ''}`}
                            >
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center text-gray-300 hover:text-blue-500">
                                        {selectedIds.has(item.id) ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16}/>}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-gray-500 text-xs">{item.code}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                                <td className="px-4 py-3">{item.brand}</td>
                                
                                {type === 'style' ? (
                                    <>
                                        <td className="px-4 py-3">{item.season}</td>
                                        <td className="px-4 py-3">{item.category}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-4 py-3">{item.weight}</td>
                                        <td className="px-4 py-3 truncate max-w-[150px]" title={item.composition}>{item.composition}</td>
                                        <td className="px-4 py-3">{item.price}</td>
                                    </>
                                )}

                                <td className="px-4 py-3">
                                    {item.aiStatus === 'completed' ? (
                                        <div className="inline-flex items-center gap-1 text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                            <CheckCircle size={10} /> 已治理
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1 text-orange-500 text-xs bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                            <AlertCircle size={10} /> 未治理
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-400 text-xs">{item.updateTime}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300 cursor-pointer" 
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600 select-none cursor-pointer" onClick={handleSelectAll}>当前页全选</span>
                <span className="text-sm text-gray-400 ml-4 border-l pl-4 border-gray-200">已选: <span className="text-blue-600 font-bold">{selectedIds.size}</span></span>
            </div>
            
            <div className="flex items-center gap-2">
               {/* Pagination Simulation */}
               <div className="flex items-center gap-1">
                   <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-400 text-xs" disabled>&lt;</button>
                   <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded text-xs font-bold shadow-sm">1</button>
                   <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-600 text-xs">2</button>
                   <span className="text-gray-300 text-xs px-1">...</span>
                   <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-600 text-xs">13</button>
                   <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-600 text-xs">&gt;</button>
               </div>
               <div className="ml-4 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition flex items-center gap-1">
                  100 条/页 <ChevronDown size={10} />
               </div>
            </div>

            <div className="flex items-center gap-3">
                <button onClick={onClose} className="px-5 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition">取消</button>
                <button 
                    onClick={handleConfirm}
                    disabled={selectedIds.size === 0}
                    className={`px-6 py-2 rounded text-sm text-white font-medium transition shadow-sm
                    ${selectedIds.size > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    下一步
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const FilterDropdown = ({ label }: { label: string }) => (
    <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition text-gray-600">
        <span>{label}</span>
        <ChevronDown size={12} className="text-gray-300" />
    </div>
);

export default ResourcePickerModal;