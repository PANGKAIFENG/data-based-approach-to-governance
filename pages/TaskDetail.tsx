import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, RotateCcw, Download, Sparkles, AlertCircle } from 'lucide-react';
import { ProductAttribute } from '../types';
import AIConfigModal from '../components/AIConfigModal';
import { analyzeProductImage } from '../services/geminiService';

// Helper component for editable cell
const EditableCell = ({ value, onSave }: { value: string, onSave: (val: string) => void }) => {
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

const TaskDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock Data for the Grid
  const [products, setProducts] = useState<ProductAttribute[]>([
    { id: '1', sku: 'TS-WH-001', imageUrl: 'https://picsum.photos/id/1/200/200', material: '棉', color: '白色', style: '休闲', season: '夏季', category: 'T恤', collarType: '圆领', isConfirmed: false },
    { id: '2', sku: 'JN-BL-002', imageUrl: 'https://picsum.photos/id/20/200/200', material: '', color: '蓝色', style: '街头', season: '春秋', category: '牛仔裤', collarType: '', isConfirmed: false },
    { id: '3', sku: 'DR-BK-003', imageUrl: 'https://picsum.photos/id/21/200/200', material: '丝绸', color: '黑色', style: '优雅', season: '夏季', category: '连衣裙', collarType: 'V领', isConfirmed: true },
    { id: '4', sku: 'SW-GY-004', imageUrl: 'https://picsum.photos/id/22/200/200', material: '', color: '', style: '', season: '冬季', category: '卫衣', collarType: '连帽', isConfirmed: false },
  ]);

  const toggleConfirm = (productId: string) => {
    setProducts(products.map(p => 
        p.id === productId ? { ...p, isConfirmed: !p.isConfirmed } : p
    ));
  };

  const updateProductField = (productId: string, field: keyof ProductAttribute, value: string) => {
    setProducts(products.map(p => 
        p.id === productId ? { ...p, [field]: value } : p
    ));
  };

  const handleRunAI = async () => {
    setIsAnalyzing(true);
    setProgress(10);
    
    // Only target columns that have "AI" indicator in the UI
    const aiTargetFields: (keyof ProductAttribute)[] = ['material', 'color'];

    // Process items that have missing fields in the target columns
    const itemsToProcess = products.filter(p => 
        aiTargetFields.some(field => !p[field] || p[field].toString().trim() === '')
    );
    
    const total = itemsToProcess.length;
    let completed = 0;

    if (total === 0) {
      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress(100);
      }, 500);
      return;
    }

    const updatedProducts = [...products];

    // Simple sequential processing to show progress
    for (const item of itemsToProcess) {
      const analysis = await analyzeProductImage(item.imageUrl);
      
      const index = updatedProducts.findIndex(p => p.id === item.id);
      if (index !== -1) {
        const product = updatedProducts[index];
        const newProduct = { ...product };
        
        // Only update targeted AI fields if they are empty
        aiTargetFields.forEach(field => {
             const currentValue = newProduct[field];
             // Check if empty string or null/undefined
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
      setProducts([...updatedProducts]); // Trigger re-render per item for visual effect
    }

    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AIConfigModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
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
             <h1 className="text-lg font-bold text-gray-800">任务 #{id || '001'} - 属性提取</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <RotateCcw size={16} /> 撤销
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <Download size={16} /> 导出
          </button>
          <button 
            onClick={handleRunAI}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition ${isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Sparkles size={18} />
            {isAnalyzing ? 'AI 识别进行中...' : 'AI 补全'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isAnalyzing && (
        <div className="bg-blue-50 px-6 py-2 border-b border-blue-100 flex items-center gap-4">
           <span className="text-sm text-blue-700 font-medium animate-pulse">AI 识别进行中...</span>
           <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
           </div>
           <span className="text-sm text-blue-700 font-bold">{progress}%</span>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
           <table className="w-full text-left border-collapse">
             <thead className="bg-gray-50 sticky top-0 z-0">
               <tr>
                 <th className="p-4 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase w-32">状态</th>
                 <th className="p-4 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase w-32">商品图</th>
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
               {products.map((product) => (
                 <tr key={product.id} className="hover:bg-gray-50/80 transition">
                   <td className="p-4">
                     {product.isConfirmed ? (
                       <div 
                         onClick={() => toggleConfirm(product.id)}
                         className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 cursor-pointer hover:bg-green-100 transition"
                         title="点击取消确认"
                       >
                         <CheckCircle size={18} />
                       </div>
                     ) : (
                        <button 
                            onClick={() => toggleConfirm(product.id)}
                            className="w-10 h-10 rounded-full bg-white border border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center transition text-xs font-medium"
                        >
                          确认
                        </button>
                     )}
                   </td>
                   <td className="p-4">
                     <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden border border-gray-200 relative group cursor-pointer">
                        <img src={product.imageUrl} alt={product.sku} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition"></div>
                     </div>
                   </td>
                   <td className="p-4 text-sm font-medium text-gray-900">{product.sku}</td>
                   
                   {/* Editable Cells */}
                   <td className="p-4">
                     <EditableCell 
                        value={product.material} 
                        onSave={(val) => updateProductField(product.id, 'material', val)} 
                     />
                   </td>
                   <td className="p-4">
                     <EditableCell 
                        value={product.color} 
                        onSave={(val) => updateProductField(product.id, 'color', val)} 
                     />
                   </td>
                   <td className="p-4">
                     <EditableCell 
                        value={product.style} 
                        onSave={(val) => updateProductField(product.id, 'style', val)} 
                     />
                   </td>
                   <td className="p-4">
                     <EditableCell 
                        value={product.season} 
                        onSave={(val) => updateProductField(product.id, 'season', val)} 
                     />
                   </td>
                   <td className="p-4">
                     <EditableCell 
                        value={product.category} 
                        onSave={(val) => updateProductField(product.id, 'category', val)} 
                     />
                   </td>
                   <td className="p-4">
                     <EditableCell 
                        value={product.collarType} 
                        onSave={(val) => updateProductField(product.id, 'collarType', val)} 
                     />
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
        
        <div className="mt-8 flex justify-end">
             <button 
                onClick={() => navigate('/style-generator')} 
                className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow hover:bg-black transition flex items-center gap-2"
             >
                下一步：AI 款式生成 <ArrowLeft className="rotate-180" size={18}/>
             </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;