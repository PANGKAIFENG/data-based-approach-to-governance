import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Upload, Sparkles, AlertCircle, Filter, ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';
import { ProductAttribute } from '../types';
import AIConfigModal from '../components/AIConfigModal';
import TransmitConfirmModal from '../components/TransmitConfirmModal';
import { analyzeProductImage } from '../services/geminiService';

// Helper component for editable cell
const EditableCell = ({ value, onSave, disabled }: { value: string, onSave: (val: string) => void, disabled?: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Sync state if prop changes (e.g. from AI update)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onSave(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };
  
  if (disabled) {
     return (
        <div className="px-3 py-2 rounded-md text-sm text-gray-500 bg-gray-50 border border-transparent select-none">
            {value || '-'}
        </div>
     );
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1.5 text-sm border border-blue-500 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
      />
    );
  }

  const isEmpty = !value || value.trim() === '';
  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className={`px-3 py-2 rounded-md text-sm border cursor-pointer select-none transition-colors
        ${!isEmpty 
            ? 'border-transparent bg-yellow-50 text-gray-800 hover:bg-yellow-100' 
            : 'border-red-200 bg-red-50 hover:bg-red-100'}`}
      title="双击修改"
    >
      {isEmpty ? (
         <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12}/> 缺失</span>
      ) : (
         value
      )}
    </div>
  );
};

// Generate more mock data for pagination testing
const generateMockProducts = (): ProductAttribute[] => {
  const base = [
    { id: '1', sku: 'TS-WH-001', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=60', material: '棉', color: '白色', style: '休闲', season: '夏季', category: 'T恤', collarType: '圆领', isConfirmed: false },
    { id: '2', sku: 'JN-BL-002', imageUrl: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&auto=format&fit=crop&q=60', material: '', color: '蓝色', style: '街头', season: '春秋', category: '牛仔裤', collarType: '', isConfirmed: false },
    { id: '3', sku: 'DR-BK-003', imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&auto=format&fit=crop&q=60', material: '丝绸', color: '黑色', style: '优雅', season: '夏季', category: '连衣裙', collarType: 'V领', isConfirmed: true },
    { id: '4', sku: 'SW-GY-004', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=60', material: '', color: '', style: '', season: '冬季', category: '卫衣', collarType: '连帽', isConfirmed: false },
  ];
  
  // Duplicate to create 25 items
  let result: ProductAttribute[] = [...base];
  for (let i = 0; i < 5; i++) {
     result = result.concat(base.map(p => ({ ...p, id: `${p.id}-${i}`, sku: `${p.sku}-${i}` })));
  }
  return result;
};

const TaskDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get source from navigation state
  const source = location.state?.source || 'excel';
  const taskName = location.state?.taskName || `任务 #${id || '001'}`;
  const isLibraryTask = source === 'style_library' || source === 'fabric_library';

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isTransmitModalOpen, setIsTransmitModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending'>('all');

  // Pagination & Selection State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Mock Data
  const [products, setProducts] = useState<ProductAttribute[]>(generateMockProducts());

  useEffect(() => {
    // Automatically trigger AI result loading/analysis on mount if items are not confirmed.
    if (!isAnalyzing && products.some(p => !p.isConfirmed)) {
        handleRunAI();
    }
  }, []);

  const updateProductField = (productId: string, field: keyof ProductAttribute, value: string) => {
    setProducts(products.map(p => 
        p.id === productId ? { ...p, [field]: value } : p
    ));
  };

  const handleRunAI = async () => {
    setIsAnalyzing(true);
    setProgress(10);
    
    const aiTargetFields: (keyof ProductAttribute)[] = ['material', 'color', 'style', 'season', 'category', 'collarType'];
    const itemsToProcess = products.filter(p => !p.isConfirmed);
    
    // Limit AI processing for demo to first few to save API calls/time if list is huge
    const demoItems = itemsToProcess.slice(0, 5); 
    
    const total = demoItems.length;
    let completed = 0;

    if (total === 0) {
      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress(100);
      }, 500);
      return;
    }

    const updatedProducts = [...products];

    for (const item of demoItems) {
      const analysis = await analyzeProductImage(item.imageUrl);
      
      const index = updatedProducts.findIndex(p => p.id === item.id);
      if (index !== -1) {
        const product = updatedProducts[index];
        const newProduct = { ...product };
        
        aiTargetFields.forEach(field => {
             const currentValue = newProduct[field];
             if (!currentValue || (typeof currentValue === 'string' && currentValue.trim() === '')) {
                 const newValue = analysis[field];
                 if (newValue && typeof newValue === 'string') {
                    (newProduct as any)[field] = newValue;
                 }
             }
        });
        
        updatedProducts[index] = newProduct;
      }
      
      completed++;
      setProgress(10 + Math.floor((completed / total) * 90));
      setProducts([...updatedProducts]); 
    }

    setIsAnalyzing(false);
  };

  const handleTransmitClick = () => {
    if (source === 'excel') {
        setIsTransmitModalOpen(true);
    } else {
        alert('数据回传成功！');
    }
  };

  const confirmTransmit = (folderId: string) => {
    alert(`数据已回传至文件夹 ID: ${folderId}`);
    setIsTransmitModalOpen(false);
  };

  // --- Filtering & Pagination Logic ---

  const filteredProducts = products.filter(p => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return !p.isConfirmed;
    if (filterStatus === 'confirmed') return p.isConfirmed;
    return true;
  });

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // --- Selection Logic ---

  const handleSelectAllOnPage = () => {
    const pageIds = currentItems.map(p => p.id);
    const allSelected = pageIds.every(id => selectedIds.has(id));
    
    const newSelected = new Set(selectedIds);
    if (allSelected) {
      pageIds.forEach(id => newSelected.delete(id));
    } else {
      pageIds.forEach(id => newSelected.add(id));
    }
    setSelectedIds(newSelected);
  };
  
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
        newSelected.delete(id);
    } else {
        newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchConfirm = () => {
      if (selectedIds.size === 0) return;
      
      if (window.confirm(`确认将选中的 ${selectedIds.size} 条数据标记为“已确认”吗？`)) {
          setProducts(products.map(p => {
              if (selectedIds.has(p.id)) {
                  return { ...p, isConfirmed: true };
              }
              return p;
          }));
          setSelectedIds(new Set());
      }
  };

  const isAllPageSelected = currentItems.length > 0 && currentItems.every(p => selectedIds.has(p.id));

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AIConfigModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      
      <TransmitConfirmModal
        isOpen={isTransmitModalOpen}
        onClose={() => setIsTransmitModalOpen(false)}
        onConfirm={confirmTransmit}
      />

      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/data-governance')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
             <div className="flex items-center gap-2 text-sm text-gray-500">
               <span>首页</span>
               <span>/</span>
               <span>数据治理</span>
               <span>/</span>
               <span>任务详情</span>
             </div>
             <h1 className="text-lg font-bold text-gray-800">{taskName} - 属性提取</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          
          {selectedIds.size > 0 && (
             <button 
                onClick={handleBatchConfirm}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition animate-in fade-in slide-in-from-right-2"
             >
                <CheckCircle size={16} /> 
                批量确认 ({selectedIds.size})
             </button>
          )}

          <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
                className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-blue-500 hover:bg-white hover:border-blue-300 transition appearance-none cursor-pointer"
              >
                <option value="all">全部状态</option>
                <option value="pending">待确认</option>
                <option value="confirmed">已确认</option>
              </select>
              <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>

          {/* Transmit Back Button */}
          <button 
            onClick={handleTransmitClick}
            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition"
          >
            <Upload size={16} /> 回传
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 overflow-auto p-6 flex flex-col">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
           <div className="overflow-auto flex-1">
             <table className="w-full text-left border-collapse">
               <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                 <tr>
                   <th className="p-4 border-b border-gray-200 w-16 text-center">
                      <div 
                        onClick={handleSelectAllOnPage}
                        className="flex items-center justify-center cursor-pointer text-gray-400 hover:text-blue-600 transition"
                      >
                         {isAllPageSelected ? <CheckSquare size={18} className="text-blue-600"/> : <Square size={18} />}
                      </div>
                   </th>
                   <th className="p-4 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase w-24">状态</th>
                   <th className="p-4 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase w-24">商品图</th>
                   <th className="p-4 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">SKU</th>
                   <th className="p-4 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
                      <div className="flex items-center gap-1">
                          材质 <span className="text-blue-500 text-[10px]">AI</span>
                      </div>
                   </th>
                   <th className="p-4 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
                      <div className="flex items-center gap-1">
                          颜色 <span className="text-blue-500 text-[10px]">AI</span>
                      </div>
                   </th>
                   <th className="p-4 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">风格</th>
                   <th className="p-4 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">季节</th>
                   <th className="p-4 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">品类</th>
                   <th className="p-4 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">领型</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {currentItems.length === 0 ? (
                     <tr>
                         <td colSpan={10} className="p-8 text-center text-gray-400 text-sm">
                             没有找到符合条件的记录
                         </td>
                     </tr>
                 ) : (
                 currentItems.map((product) => (
                   <tr 
                     key={product.id} 
                     className={`transition hover:bg-blue-50/30 ${selectedIds.has(product.id) ? 'bg-blue-50/50' : ''}`}
                     onClick={() => toggleSelection(product.id)}
                   >
                     <td className="p-4 text-center">
                        <div className="flex items-center justify-center cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSelection(product.id); }}>
                             {selectedIds.has(product.id) ? 
                                <CheckSquare size={18} className="text-blue-600" /> : 
                                <Square size={18} className="text-gray-300 hover:text-blue-400" />
                             }
                        </div>
                     </td>
                     <td className="p-4">
                       {product.isConfirmed ? (
                         <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                           <CheckCircle size={12} /> 已确认
                         </div>
                       ) : (
                         <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium border border-gray-200">
                           <AlertCircle size={12} /> 待确认
                         </div>
                       )}
                     </td>
                     <td className="p-4">
                       <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden border border-gray-200 relative group cursor-pointer">
                          <img src={product.imageUrl} alt={product.sku} className="w-full h-full object-cover" />
                       </div>
                     </td>
                     <td className="p-4 text-sm font-medium text-gray-900">{product.sku}</td>
                     
                     <td className="p-4" onClick={(e) => e.stopPropagation()}>
                       <EditableCell 
                          value={product.material} 
                          onSave={(val) => updateProductField(product.id, 'material', val)} 
                       />
                     </td>
                     <td className="p-4" onClick={(e) => e.stopPropagation()}>
                       <EditableCell 
                          value={product.color} 
                          onSave={(val) => updateProductField(product.id, 'color', val)} 
                       />
                     </td>
                     <td className="p-4" onClick={(e) => e.stopPropagation()}>
                       <EditableCell 
                          value={product.style} 
                          onSave={(val) => updateProductField(product.id, 'style', val)} 
                          disabled={isLibraryTask}
                       />
                     </td>
                     <td className="p-4" onClick={(e) => e.stopPropagation()}>
                       <EditableCell 
                          value={product.season} 
                          onSave={(val) => updateProductField(product.id, 'season', val)} 
                          disabled={isLibraryTask}
                       />
                     </td>
                     <td className="p-4" onClick={(e) => e.stopPropagation()}>
                       <EditableCell 
                          value={product.category} 
                          onSave={(val) => updateProductField(product.id, 'category', val)} 
                          disabled={isLibraryTask}
                       />
                     </td>
                     <td className="p-4" onClick={(e) => e.stopPropagation()}>
                       <EditableCell 
                          value={product.collarType} 
                          onSave={(val) => updateProductField(product.id, 'collarType', val)} 
                          disabled={isLibraryTask}
                       />
                     </td>
                   </tr>
                 )))}
               </tbody>
             </table>
           </div>

           {/* Pagination Footer */}
           <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
               <div className="text-sm text-gray-500">
                   显示 {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} 条，共 {totalItems} 条
               </div>
               <div className="flex items-center gap-2">
                   <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-600"
                   >
                       <ChevronLeft size={16} />
                   </button>
                   
                   <div className="flex items-center gap-1">
                       {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                           <button
                               key={page}
                               onClick={() => setCurrentPage(page)}
                               className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition
                               ${currentPage === page 
                                   ? 'bg-blue-600 text-white shadow-sm' 
                                   : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                           >
                               {page}
                           </button>
                       ))}
                   </div>

                   <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-600"
                   >
                       <ChevronRight size={16} />
                   </button>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;