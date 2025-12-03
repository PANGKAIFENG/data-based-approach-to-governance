import React, { useState } from 'react';
import { ArrowLeft, Sparkles, CheckSquare, Square, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GeneratedStyle } from '../types';
import { generateStyleDescriptions, generateStyleImage } from '../services/geminiService';

const StyleGenerator: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="flex flex-col h-screen bg-gray-50">
       <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4">
                <button onClick={() => navigate('/task/1')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">新款造数</h1>
           </div>
           <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                   已选择: <b className="text-blue-600">{generatedStyles.filter(s => s.selected).length}</b> 个新款
                </span>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition">
                    <Save size={18} />
                    确认并合并至主任务
                </button>
           </div>
       </div>

       <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
           
           {/* Control Panel */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
               <div className="md:col-span-6 space-y-2">
                   <label className="block text-sm font-medium text-gray-700">设计主题 / 种子款</label>
                   <input 
                      type="text" 
                      value={seedPrompt}
                      onChange={(e) => setSeedPrompt(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                   />
               </div>
               <div className="md:col-span-2 space-y-2">
                   <label className="block text-sm font-medium text-gray-700">生成数量</label>
                   <input 
                      type="number" 
                      min={1} max={8}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                   />
               </div>
               <div className="md:col-span-4">
                   <button 
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 shadow-md transition
                      ${isGenerating ? 'bg-blue-400 cursor-wait' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'}`}
                   >
                       {isGenerating ? (
                           <>
                             <Loader2 className="animate-spin" size={20}/>
                             {loadingStep}
                           </>
                       ) : (
                           <>
                             <Sparkles size={20}/>
                             开始生成新款
                           </>
                       )}
                   </button>
               </div>
           </div>

           {/* Results Grid */}
           <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500 px-2">
                     <div className="w-16">选择</div>
                     <div className="w-32">图片</div>
                     <div className="flex-1 px-4">生成风格</div>
                     <div className="w-40">推荐面料</div>
                     <div className="w-40">设计元素</div>
                     <div className="w-40 text-right">颜色主题</div>
                </div>

                {generatedStyles.length === 0 && !isGenerating && (
                    <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                        <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
                        <p>输入主题并点击生成以查看 AI 设计方案。</p>
                    </div>
                )}

                {generatedStyles.map((style) => (
                    <div 
                        key={style.id} 
                        onClick={() => toggleSelection(style.id)}
                        className={`bg-white rounded-xl border flex items-center p-4 transition cursor-pointer group
                        ${style.selected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'}`}
                    >
                        <div className="w-16 flex justify-center text-blue-600">
                            {style.selected ? <CheckSquare size={24} /> : <Square size={24} className="text-gray-300 group-hover:text-blue-300" />}
                        </div>
                        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                             {style.imageUrl ? (
                                 <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 animate-pulse">
                                     <Loader2 className="animate-spin" size={20} />
                                 </div>
                             )}
                        </div>
                        <div className="flex-1 px-6 space-y-1">
                             <h3 className="font-bold text-gray-900">{style.name}</h3>
                             <p className="text-sm text-gray-500 leading-relaxed">{style.description}</p>
                        </div>
                        <div className="w-40 text-sm text-gray-700 px-2">
                            {style.material}
                        </div>
                        <div className="w-40 text-sm text-gray-700 px-2">
                            {style.elements}
                        </div>
                        <div className="w-40 text-right text-sm font-medium text-gray-800 px-2">
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