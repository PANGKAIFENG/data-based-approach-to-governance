import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, PenTool, Code2, FileText, 
  MonitorPlay, Shirt, Plus, Search, 
  MessageSquare, Bell, HelpCircle, Calendar,
  ChevronDown, ChevronRight, Home, Menu, Compass
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const apps = [
    {
      title: '开放设计室',
      desc: '开放设计室',
      icon: <PenTool className="text-white" size={32} />,
      color: 'bg-lime-500',
      link: '#'
    },
    {
      title: '开发者服务',
      desc: '开发接口服务及相关文档',
      icon: <Code2 className="text-white" size={32} />,
      color: 'bg-emerald-500',
      link: '#'
    },
    {
      title: 'PLM对接工具',
      desc: 'PLM对接工具',
      icon: <FileText className="text-white" size={32} />,
      color: 'bg-blue-400',
      link: '#'
    },
    {
      title: '虚拟陈列',
      desc: '虚拟陈列',
      icon: <LayoutGrid className="text-white" size={32} />,
      color: 'bg-rose-400',
      link: '#'
    },
    {
      title: '面料视频宝',
      desc: '让面料展示最真实的物理效果',
      icon: <MonitorPlay className="text-white" size={32} />,
      color: 'bg-blue-500',
      link: '#'
    },
    {
      title: '数据治理',
      desc: 'AI 驱动的 SKU 治理与新款生成',
      icon: <Shirt className="text-white" size={32} />,
      color: 'bg-indigo-600',
      link: '/data-governance'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
           <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">S</div>
             <span>Style3D</span>
             <ChevronDown size={16} className="text-gray-400"/>
           </div>
        </div>
        
        <div className="flex-1 py-6 space-y-1">
           <div className="px-6 py-2 text-gray-500 hover:bg-gray-50 hover:text-black cursor-pointer flex items-center gap-3">
              <span>首页</span>
           </div>
           
           <div className="px-6 py-2 text-gray-500 hover:bg-gray-50 hover:text-black cursor-pointer flex items-center justify-between group">
              <div className="flex items-center gap-3">
                 <span>全部菜单</span>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500"/>
           </div>

           <div className="px-6 py-2 text-gray-500 hover:bg-gray-50 hover:text-black cursor-pointer flex items-center justify-between group">
              <div className="flex items-center gap-3">
                 <span>流程引导</span>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500"/>
           </div>

           <div className="mt-8 px-6 text-xs text-gray-400 font-medium mb-2">我的菜单</div>
           
           <div className="px-6 py-2 text-blue-600 bg-blue-50 font-medium cursor-pointer flex items-center justify-between">
              <span>最近访问</span>
              <ChevronDown size={16} />
           </div>
           <div className="pl-10 pr-6 py-2 text-sm text-blue-600 cursor-pointer">在线工具</div>
           <div className="pl-10 pr-6 py-2 text-sm text-gray-500 hover:text-black cursor-pointer">MixMatch</div>
           <div className="pl-10 pr-6 py-2 text-sm text-gray-500 hover:text-black cursor-pointer">协作空间</div>
           <div className="pl-10 pr-6 py-2 text-sm text-gray-500 hover:text-black cursor-pointer">Style3D Moda</div>
           <div className="pl-10 pr-6 py-2 text-sm text-gray-500 hover:text-black cursor-pointer">Style3D面料</div>

           <div className="px-6 py-2 text-gray-500 hover:bg-gray-50 hover:text-black cursor-pointer flex items-center justify-between mt-4">
              <span>设计中心</span>
              <ChevronRight size={16} className="text-gray-300"/>
           </div>
           
           <div className="px-6 py-2 text-gray-500 hover:bg-gray-50 hover:text-black cursor-pointer flex items-center justify-between">
              <span>资源中心</span>
              <ChevronRight size={16} className="text-gray-300"/>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <div className="h-16 bg-gray-900 text-gray-300 flex items-center justify-between px-6 shadow-md">
           <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2 cursor-pointer hover:text-white">
                 <span>面料</span>
                 <ChevronDown size={14} />
              </div>
              <div className="relative max-w-md w-full ml-4">
                 <input 
                    type="text" 
                    placeholder="输入关键词搜索面料" 
                    className="w-full bg-gray-800 border border-gray-700 rounded text-sm px-4 py-1.5 focus:outline-none focus:border-gray-500 text-white placeholder-gray-500"
                 />
                 <div className="absolute right-2 top-1.5 flex items-center gap-2 text-gray-500">
                    <Search size={14} />
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-5">
              <div className="cursor-pointer hover:text-white"><LayoutGrid size={20} /></div>
              <div className="h-4 w-[1px] bg-gray-700"></div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-white text-sm">
                 <span>简体中文</span>
                 <ChevronDown size={14} />
              </div>
              <HelpCircle size={20} className="cursor-pointer hover:text-white" />
              <Calendar size={20} className="cursor-pointer hover:text-white" />
              <div className="relative cursor-pointer hover:text-white">
                 <MessageSquare size={20} />
                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">3</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium cursor-pointer">
                 b
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
           <div className="px-8 py-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                 在线工具
                 <span className="text-sm font-normal text-gray-500 ml-2 flex items-center gap-1">
                    应用中心 <ChevronRight size={14} /> 在线工具
                 </span>
              </h1>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {apps.map((app, index) => (
                    <div 
                        key={index} 
                        onClick={() => navigate(app.link)}
                        className="bg-white p-6 rounded-sm shadow-sm hover:shadow-md transition cursor-pointer flex gap-5 border border-transparent hover:border-gray-200"
                    >
                       <div className={`w-16 h-16 ${app.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-gray-200`}>
                          {app.icon}
                       </div>
                       <div className="flex flex-col justify-center">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{app.title}</h3>
                          <p className="text-sm text-gray-500">{app.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-12">
                 <h2 className="text-lg font-bold text-gray-800 mb-6">推荐应用</h2>
                 <div className="bg-gray-100 p-8 rounded-lg flex items-center gap-6 max-w-md">
                     <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        S
                     </div>
                     <div>
                        <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition bg-white text-sm font-medium">
                           立即订购
                        </button>
                     </div>
                 </div>
              </div>
           </div>
        </div>

        {/* FAB */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4">
             <button className="w-12 h-12 bg-black rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 transition">
                <Plus size={24} />
             </button>
             <button className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 transition relative">
                <SparklesIcon />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">99+</span>
             </button>
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
)

export default Dashboard;
