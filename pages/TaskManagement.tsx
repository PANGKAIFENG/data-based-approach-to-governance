import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Trash2, ChevronRight, 
  CheckCircle, Loader2, Settings, FileSpreadsheet 
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import AIConfigModal from '../components/AIConfigModal';

const mockTasks: Task[] = [
  { id: '1', name: '第一季度销售数据整理', uploader: '张三', uploadDate: '2023-10-26 14:30', totalRows: 1500, aiProgress: 100, manualProgress: 45, status: TaskStatus.Processing },
  { id: '2', name: '客户信息核对任务', uploader: '李四', uploadDate: '2023-10-26 11:15', totalRows: 800, aiProgress: 100, manualProgress: 100, status: TaskStatus.Completed },
  { id: '3', name: '供应商名录更新', uploader: '王五', uploadDate: '2023-10-25 09:00', totalRows: 2200, aiProgress: 100, manualProgress: 0, status: TaskStatus.Processing },
  { id: '4', name: '产品库存盘点', uploader: '赵六', uploadDate: '2023-10-24 17:45', totalRows: 5000, aiProgress: 35, manualProgress: 0, status: TaskStatus.Pending },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

const TaskManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Stats Data
  const statsData = [
    { name: '进行中', value: mockTasks.filter(t => t.status === TaskStatus.Processing).length },
    { name: '已完成', value: mockTasks.filter(t => t.status === TaskStatus.Completed).length },
    { name: '待处理', value: mockTasks.filter(t => t.status === TaskStatus.Pending).length },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      <AIConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">任务管理</h1>
          <p className="text-gray-500 text-sm mt-1">管理和监控您的 AI 数据治理任务。</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setIsConfigModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition"
            >
                <Settings size={18} />
                <span>AI 识别配置</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition">
                <Plus size={18} />
                <span>上传 Excel</span>
            </button>
        </div>
      </div>

      {/* Stats Widget */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
         <div className="space-y-1">
             <h3 className="text-lg font-semibold">任务概览</h3>
             <p className="text-gray-500 text-sm">数据处理实时状态</p>
         </div>
         <div className="h-24 w-64">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={statsData} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                        {statsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
             </ResponsiveContainer>
         </div>
         <div className="flex gap-4 text-sm">
             {statsData.map((stat, i) => (
                 <div key={stat.name} className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                     <span className="text-gray-600">{stat.name}: <b>{stat.value}</b></span>
                 </div>
             ))}
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 relative">
            <input 
                type="text" 
                placeholder="输入任务名称..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <div className="md:col-span-1">
             <select className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 outline-none text-gray-600">
                 <option>所有状态</option>
                 <option>进行中</option>
                 <option>已完成</option>
                 <option>待处理</option>
             </select>
        </div>
         <div className="md:col-span-1">
             <input type="text" placeholder="上传人姓名" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
         </div>
         <div className="md:col-span-1">
             <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">查询</button>
         </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
                      <th className="px-6 py-4">任务名称</th>
                      <th className="px-6 py-4">上传信息</th>
                      <th className="px-6 py-4">总行数</th>
                      <th className="px-6 py-4 w-1/6">AI 补全进度</th>
                      <th className="px-6 py-4 w-1/6">人工确认进度</th>
                      <th className="px-6 py-4">状态</th>
                      <th className="px-6 py-4 text-right">操作</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {mockTasks.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((task) => (
                      <tr key={task.id} className="hover:bg-blue-50/30 transition group">
                          <td className="px-6 py-4">
                              <div className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/task/${task.id}`)}>{task.name}</div>
                          </td>
                          <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{task.uploadDate}</div>
                              <div className="text-xs text-gray-400">{task.uploader}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{task.totalRows.toLocaleString()}</td>
                          <td className="px-6 py-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-blue-600">{task.aiProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${task.aiProgress}%` }}></div>
                                </div>
                          </td>
                          <td className="px-6 py-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-green-600">{task.manualProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${task.manualProgress}%` }}></div>
                                </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${task.status === TaskStatus.Completed ? 'bg-green-100 text-green-800' : 
                                  task.status === TaskStatus.Processing ? 'bg-blue-100 text-blue-800' : 
                                  'bg-gray-100 text-gray-800'}`}>
                                {task.status === TaskStatus.Processing && <Loader2 size={12} className="mr-1 animate-spin" />}
                                {task.status}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => navigate(`/task/${task.id}`)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">进入治理</button>
                                  <button className="text-gray-400 hover:text-gray-600"><Download size={16} /></button>
                                  <button className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <span className="text-sm text-gray-500">已展示 4 个任务</span>
              <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 text-sm disabled:opacity-50 hover:bg-gray-50"> &lt; </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-blue-500 bg-blue-500 text-white text-sm">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 text-sm disabled:opacity-50 hover:bg-gray-50"> &gt; </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default TaskManagement;