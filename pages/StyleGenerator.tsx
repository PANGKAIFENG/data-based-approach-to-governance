import React, { useState } from 'react';
import { ArrowLeft, Sparkles, CheckSquare, Square, Loader2, Save, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { GeneratedStyle } from '../types';
import { generateStyleDescriptions, generateStyleImage } from '../services/geminiService';

const StyleGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [seedPrompt, setSeedPrompt] = useState('轻奢连衣裙 A-2024');
  const [quantity, setQuantity] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStyles, setGeneratedStyles] = useState<GeneratedStyle[]>([]);
  const [loadingStep, setLoadingStep] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedStyles([]);
    
    // Step 1: Generate Text Descriptions
    setLoadingStep('正在生成款式概念...');
    const descriptions = await generateStyleDescriptions(seedPrompt, quantity);
    
    if (descriptions.length === 0) {
        setIsGenerating(false);
        alert('生成失败，请检查 API Key。');
        return;
    }

    const newStyles: GeneratedStyle[] = descriptions.map((d: any, idx: number) => ({
      id: idx.toString(),
      name: d.name || `款式 ${idx + 1}`,
      description: d.description,
      material: d.material,
      elements: d.elements,
      colorTheme: d.colorTheme,
      imageUrl: '', // To be filled
      selected: false
    }));
    
    setGeneratedStyles(newStyles);

    // Step 2: Generate Images for each
    setLoadingStep('正在渲染视觉图...');
    
    // Create a new array to update state progressively
    const stylesWithImages = [...newStyles];
    
    // Parallel requests might be too heavy or hit rate limits, but let's try concurrent with `Promise.all` 
    // or sequential. Sequential is safer for demo rate limits.
    for (let i = 0; i < stylesWithImages.length; i++) {
        const prompt = descriptions[i].promptForImage || `A high quality fashion photography of a ${descriptions[i].name}, ${descriptions[i].description}, ${descriptions[i].colorTheme}`;
        const base64Image = await generateStyleImage(prompt);
        if (base64Image) {
            stylesWithImages[i].imageUrl = base64Image;
            setGeneratedStyles([...stylesWithImages]); // Update UI progressively
        }
    }

    setIsGenerating(false);
    setLoadingStep('');
  };

  const toggleSelection = (id: string) => {
    setGeneratedStyles(styles => 
      styles.map(s => s.id === id ? { ...s, selected: !s.selected } : s)
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
       <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4">
                <button onClick={() => navigate('/data-governance')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col">
                   <div className="flex items-center gap-2 text-sm text-gray-400">
                     <span>首页</span>
                     <span>/</span>
                     <span>数据治理</span>
                     <span>/</span>
                     <span>造新款</span>
                   </div>
                   <h1 className="text-lg font-bold text-gray-900 mt-0.5">新款造数任务 #{id || 'New'}</h1>
                </div>
           </div>
           <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium">
                    <Download size={16} />
                    下载种子款 Excel
                </button>
                <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
                <span className="text-sm text-gray-500">
                   已选择: <b className="text-blue-600">{generatedStyles.filter(s => s.selected).length}</b> 个新款
                </span>
                <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition text-sm font-medium">
                    <Save size={18} />
                    确认并合并至主任务
                </button>
           </div>
       </div>

       <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-auto">
           
           {/* Control Panel */}
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
               <div className="md:col-span-6 space-y-2">
                   <label className="block text-sm font-medium text-gray-700">设计主题 / 种子款</label>
                   <input 
                      type="text" 
                      value={seedPrompt}
                      onChange={(e) => setSeedPrompt(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                      placeholder="例如：2024 春夏碎花连衣裙"
                   />
               </div>
               <div className="md:col-span-2 space-y-2">
                   <label className="block text-sm font-medium text-gray-700">生成数量</label>
                   <input 
                      type="number" 
                      min={1} max={8}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                   />
               </div>
               <div className="md:col-span-4">
                   <button 
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className={`w-full py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-2 shadow-md transition
                      ${isGenerating ? 'bg-blue-400 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
                   >
                       {isGenerating ? (
                           <>
                             <Loader2 className="animate-spin" size={20}/>
                             {loadingStep}
                           </>
                       ) : (
                           <>
                             <Sparkles size={18}/>
                             开始生成新款
                           </>
                       )}
                   </button>
               </div>
           </div>

           {/* Results Grid */}
           <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                     <div className="w-16 text-center">选择</div>
                     <div className="w-32">视觉预览</div>
                     <div className="flex-1 px-4">生成风格描述</div>
                     <div className="w-40">推荐面料</div>
                     <div className="w-40">设计元素</div>
                     <div className="w-40 text-right">颜色主题</div>
                </div>

                {generatedStyles.length === 0 && !isGenerating && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-lg border border-dashed border-gray-200">
                        <Sparkles size={40} className="mb-4 text-blue-100" />
                        <p className="text-sm">输入主题并点击生成，AI 将为您推荐新款设计方案。</p>
                    </div>
                )}

                {generatedStyles.map((style) => (
                    <div 
                        key={style.id} 
                        onClick={() => toggleSelection(style.id)}
                        className={`bg-white rounded-lg border flex items-center p-3 transition cursor-pointer group
                        ${style.selected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10' : 'border-gray-100 hover:border-blue-200 hover:shadow-sm'}`}
                    >
                        <div className="w-16 flex justify-center text-blue-600">
                            {style.selected ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-200 group-hover:text-blue-400 transition" />}
                        </div>
                        <div className="w-32 h-32 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 relative border border-gray-100">
                             {style.imageUrl ? (
                                 <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 animate-pulse">
                                     <Loader2 className="animate-spin" size={16} />
                                 </div>
                             )}
                        </div>
                        <div className="flex-1 px-6 space-y-1">
                             <h3 className="font-bold text-gray-900 text-base">{style.name}</h3>
                             <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{style.description}</p>
                        </div>
                        <div className="w-40 text-sm text-gray-600 px-2 font-medium">
                            {style.material}
                        </div>
                        <div className="w-40 text-sm text-gray-600 px-2">
                            {style.elements}
                        </div>
                        <div className="w-40 text-right text-sm font-medium text-gray-900 px-2">
                            {style.colorTheme}
                        </div>
                    </div>
                ))}
           </div>

       </div>
    </div>
  );
};

export default StyleGenerator;