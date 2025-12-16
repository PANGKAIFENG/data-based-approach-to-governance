import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Trash2, Loader2, Settings, ArrowLeft, FileText, Shirt, Layers, ChevronDown, FileSpreadsheet, Upload, RotateCw
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import AIConfigModal from '../components/AIConfigModal';
import ResourcePickerModal from '../components/ResourcePickerModal';
import UploadModal from '../components/UploadModal';
import TemplateFieldSelectionModal from '../components/TemplateFieldSelectionModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import TransmitConfirmModal from '../components/TransmitConfirmModal';

// --- Mock Data ---

const initialFieldTasks: Task[] = [
  { id: '1', name: '第一季度销售数据整理', uploader: '张三', uploadDate: '2023-10-26 14:30', totalRows: 1500, aiProgress: 100, manualProgress: 45, status: TaskStatus.Processing, source: 'excel', aiStatus: 'completed' },
  { id: '2', name: '客户信息核对任务', uploader: '李四', uploadDate: '2023-10-26 11:15', totalRows: 800, aiProgress: 100, manualProgress: 100, status: TaskStatus.Completed, source: 'excel', aiStatus: 'completed' },
  { id: '3', name: '供应商名录更新', uploader: '王五', uploadDate: '2023-10-25 09:00', totalRows: 2200, aiProgress: 100, manualProgress: 0, status: TaskStatus.Processing, source: 'excel', aiStatus: 'completed' },
  { id: '4', name: '产品库存盘点', uploader: '赵六', uploadDate: '2023-10-24 17:45', totalRows: 5000, aiProgress: 35, manualProgress: 0, status: TaskStatus.Pending, source: 'excel', aiStatus: 'processing' },
  { id: '5', name: '历史数据导入异常', uploader: '系统', uploadDate: '2023-10-24 10:00', totalRows: 120, aiProgress: 45, manualProgress: 0, status: TaskStatus.Processing, source: 'excel', aiStatus: 'failed' },
];

const TaskManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // Modals state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [resourceModalType, setResourceModalType] = useState<'style' | 'fabric' | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Transmit Modal State
  const [transmitTask, setTransmitTask] = useState<Task | null>(null);

  // UI state
  const [isNewTaskDropdownOpen, setIsNewTaskDropdownOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'style' | 'fabric'>('style');
  const [statusFilter, setStatusFilter] = useState<string>('所有状态');

  // State for tasks to allow deletion
  const [fieldTasks, setFieldTasks] = useState<Task[]>(initialFieldTasks);

  // Filter Data
  const filteredData = fieldTasks.filter(task => {
      if (statusFilter !== '所有状态' && task.status !== statusFilter) return false;
      return true;
  });
  
  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click navigation
    setTaskToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
        setFieldTasks(prev => prev.filter(task => task.id !== taskToDelete));
        setTaskToDelete(null);
        setIsDeleteModalOpen(false);
    }
  };

  const handleTransmitClick = (task: Task, e: React.MouseEvent) => {
      e.stopPropagation();
      if (task.source === 'excel') {
          setTransmitTask(task);
      } else {
          // For other sources, maybe perform direct transmit or show different message
          alert(`任务 "${task.name}" 回传成功！`);
      }
  };

  const confirmTransmit = (folderId: string) => {
      if (transmitTask) {
          setFieldTasks(prev => prev.map(t => 
              t.id === transmitTask.id ? { ...t, status: TaskStatus.Transmitted } : t
          ));
          // alert(`已将任务 "${transmitTask?.name}" 的数据回传至文件夹 ID: ${folderId}`);
      }
      setTransmitTask(null);
  };

  const handleRetry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Reset task state
    setFieldTasks(prev => prev.map(t => {
        if (t.id === id) {
            return { ...t, aiStatus: 'processing', aiProgress: 0 };
        }
        return t;
    }));
    // Restart simulation
    startSimulation(id);
  };

  // Helper to update progress
  const startSimulation = (taskId: string) => {
    const interval = setInterval(() => {
        setFieldTasks(currentTasks => {
            return currentTasks.map(t => {
                if (t.id === taskId) {
                    // Random increment
                    const increment = Math.floor(Math.random() * 15) + 5;
                    const next = Math.min(t.aiProgress + increment, 100);
                    
                    if (next >= 100) {
                        clearInterval(interval);
                        // When done, mark as Pending (waiting for manual review) and aiStatus completed
                        return { ...t, aiProgress: 100, status: TaskStatus.Pending, aiStatus: 'completed' };
                    }
                    return { ...t, aiProgress: next, aiStatus: 'processing' };
                }
                return t;
            });
        });
    }, 500);
  };

  const handleResourceConfirm = (selectedIds: string[]) => {
      if (selectedIds.length === 0) return;

      const typeName = resourceModalType === 'style' ? '款式' : '面料';
      const source = resourceModalType === 'style' ? 'style_library' : 'fabric_library';

      const newTask: Task = {
          id: Date.now().toString(),
          name: `从${typeName}库导入的任务`,
          uploader: '当前用户',
          uploadDate: new Date().toLocaleString(),
          totalRows: selectedIds.length,
          aiProgress: 0,
          manualProgress: 0,
          status: TaskStatus.Processing,
          source: source,
          aiStatus: 'processing'
      };
      
      setFieldTasks([newTask, ...fieldTasks]);
      
      // Start AI simulation in background, do NOT navigate
      startSimulation(newTask.id);
  };

  const handleFileUpload = (file: File) => {
    // Simulate upload process
    const newTask: Task = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        uploader: '当前用户',
        uploadDate: new Date().toLocaleString(),
        totalRows: Math.floor(Math.random() * 500) + 10, // Random row count
        aiProgress: 0,
        manualProgress: 0,
        status: TaskStatus.Processing,
        source: 'excel',
        aiStatus: 'processing'
    };

    setFieldTasks([newTask, ...fieldTasks]);
    setIsUploadModalOpen(false);
    
    // Start AI simulation in background, do NOT navigate
    startSimulation(newTask.id);
  };

  const handleTaskClick = (task: Task) => {
    if (task.aiStatus === 'failed') return;
    if (task.aiProgress < 100) {
        // Optional: Show a toast or small alert
        return; 
    }
    navigate(`/task/${task.id}`, { state: { source: task.source, taskName: task.name } });
  };

  const handleDownloadTemplate = () => {
      // Close the template modal
      setIsTemplateModalOpen(false);
      // Simulate download
      alert("模版下载已开始...");
  };

  // Helper for source badge
  const getSourceBadge = (source?: string) => {
    switch (source) {
        case 'style_library':
            return { label: '款式导入', className: 'bg-purple-50 text-purple-700 border-purple-200' };
        case 'fabric_library':
            return { label: '面料库导入', className: 'bg-orange-50 text-orange-700 border-orange-200' };
        case 'excel':
        default:
            return { label: 'Excel导入', className: 'bg-green-50 text-green-700 border-green-200' };
    }
  };

  // Helper for AI status display text
  const getAIStatusDisplay = (task: Task) => {
    if (task.aiStatus === 'failed') return <span className="text-red-500 font-medium text-sm">处理失败</span>;
    
    // Fallback logic for backward compatibility or initial states
    if (task.aiStatus === 'completed' || task.aiProgress === 100) return <span className="text-green-600 font-medium text-sm">处理成功</span>;
    if (task.aiProgress === 0) return <span className="text-gray-400 font-medium text-sm">排队中</span>;
    
    return <span className="text-blue-600 font-medium text-sm">处理中</span>;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
       <AIConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />
       
       <DeleteConfirmModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
       />

       <TransmitConfirmModal 
          isOpen={!!transmitTask}
          onClose={() => setTransmitTask(null)}
          onConfirm={confirmTransmit}
       />

       <ResourcePickerModal 
            isOpen={!!resourceModalType}
            type={resourceModalType || 'style'}
            title={resourceModalType === 'style' ? '选择款式' : '选择面料'}
            onClose={() => setResourceModalType(null)}
            onConfirm={handleResourceConfirm}
       />

       <UploadModal 
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onDownloadTemplate={() => setIsTemplateModalOpen(true)}
          onUpload={handleFileUpload}
       />

       <TemplateFieldSelectionModal 
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onConfirm={handleDownloadTemplate}
          initialTab={uploadType}
       />
       
       {/* Header Row 1: Breadcrumbs & Search */}
       <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <h1 className="text-xl font-bold text-gray-900 tracking-tight">数据治理</h1>
             <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 transition">
                <ArrowLeft size={20} />
             </button>
             <span className="text-sm text-gray-400 ml-1">应用中心 &gt; 在线工具 &gt; 数据治理</span>
          </div>
       </div>

       {/* Header Row 2: Actions */}
       <div className="bg-white border-b border-gray-100 px-8 flex items-center justify-between shadow-sm z-10 h-14">
          <div className="flex items-center gap-2 text-gray-800">
             <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                <FileText size={18} />
             </div>
             <span className="font-bold text-sm">任务列表</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs text-gray-400 mr-2">共有 {filteredData.length} 条数据</span>
             
             <button 
                onClick={() => setIsConfigModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition border border-transparent hover:border-blue-100"
            >
                <Settings size={16} />
                <span>Ai补全字段配置</span>
            </button>
             
             <div className="relative">
                <button 
                    onClick={() => setIsNewTaskDropdownOpen(!isNewTaskDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsNewTaskDropdownOpen(false), 200)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm transition"
                >
                    <Plus size={16} />
                    <span>新增任务</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isNewTaskDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isNewTaskDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                        <button
                            onClick={() => { setUploadType('style'); setIsUploadModalOpen(true); setIsNewTaskDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition"
                        >
                            <FileSpreadsheet size={16} />
                            <span>上传款式 Excel</span>
                        </button>
                        <button
                            onClick={() => { setUploadType('fabric'); setIsUploadModalOpen(true); setIsNewTaskDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition"
                        >
                            <FileSpreadsheet size={16} />
                            <span>上传面料 Excel</span>
                        </button>
                        <div className="h-[1px] bg-gray-100 my-1"></div>
                        <button
                            onClick={() => { setResourceModalType('style'); setIsNewTaskDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-3 transition"
                        >
                            <Shirt size={16} />
                            <span>从款式库输入</span>
                        </button>
                        <button
                            onClick={() => { setResourceModalType('fabric'); setIsNewTaskDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-3 transition"
                        >
                            <Layers size={16} />
                            <span>从面料库输入</span>
                        </button>
                    </div>
                )}
            </div>
          </div>
       </div>

       <div className="flex-1 overflow-auto p-8 max-w-[1600px] mx-auto w-full space-y-6">
          
          {/* Secondary Filters */}
          <div className="flex gap-4 items-center">
             <div className="w-48">
                 <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-gray-600 outline-none focus:border-blue-500 cursor-pointer"
                 >
                     <option value="所有状态">所有状态</option>
                     <option value={TaskStatus.Processing}>{TaskStatus.Processing}</option>
                     <option value={TaskStatus.Completed}>{TaskStatus.Completed}</option>
                     <option value={TaskStatus.Pending}>{TaskStatus.Pending}</option>
                     <option value={TaskStatus.Transmitted}>{TaskStatus.Transmitted}</option>
                 </select>
             </div>
          </div>

          {/* Task Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-400 text-xs font-medium">
                          <th className="px-6 py-4 font-normal">任务名称</th>
                          <th className="px-6 py-4 font-normal w-32">数据来源</th>
                          <th className="px-6 py-4 font-normal">上传信息</th>
                          <th className="px-6 py-4 font-normal">总行数</th>
                          <th className="px-6 py-4 w-1/6 font-normal">AI 补全进度</th>
                          <th className="px-6 py-4 font-normal">状态</th>
                          <th className="px-6 py-4 text-right font-normal">操作</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {filteredData.length === 0 ? (
                           <tr>
                               <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                                   没有找到符合条件的任务
                               </td>
                           </tr>
                      ) : (
                      filteredData.map((task: any) => {
                          const badge = getSourceBadge(task.source);
                          const isReady = task.aiProgress === 100 && task.aiStatus !== 'failed';
                          const isFailed = task.aiStatus === 'failed';

                          return (
                          <tr key={task.id} className={`transition group ${isReady ? 'hover:bg-blue-50/20' : isFailed ? 'bg-red-50/20' : 'opacity-80'}`}>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded ${isReady ? 'bg-blue-100 text-blue-600' : isFailed ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'}`}>
                                        <FileText size={18} />
                                      </div>
                                      <div 
                                        className={`font-medium transition ${isReady ? 'text-gray-800 cursor-pointer hover:text-blue-600' : 'text-gray-500 cursor-not-allowed'}`}
                                        onClick={() => handleTaskClick(task)}
                                      >
                                          {task.name}
                                          {!isReady && !isFailed && <span className="text-xs text-blue-500 ml-2 animate-pulse">(AI识别中...)</span>}
                                          {isFailed && <span className="text-xs text-red-500 ml-2">(处理失败)</span>}
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${badge.className}`}>
                                      {badge.label}
                                  </span>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="text-sm text-gray-700">{task.uploadDate}</div>
                                  <div className="text-xs text-gray-400">{task.uploader}</div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 font-mono text-sm">{task.totalRows.toLocaleString()}</td>
                              
                              {/* AI Progress Column (Text Status) */}
                              <td className="px-6 py-4">
                                  {getAIStatusDisplay(task)}
                              </td>

                              <td className="px-6 py-4">
                                 <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                                    ${task.status === TaskStatus.Completed ? 'bg-green-50 text-green-700 border-green-100' : 
                                      task.status === TaskStatus.Processing ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                      task.status === TaskStatus.Transmitted ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                      'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                    {task.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className={`flex items-center justify-end gap-2 transition-opacity ${isReady || isFailed ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
                                      {isFailed ? (
                                        <button 
                                            onClick={(e) => handleRetry(task.id, e)} 
                                            className="text-gray-500 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition" 
                                            title="重试"
                                        >
                                            <RotateCw size={16} />
                                        </button>
                                      ) : (
                                        <>
                                            <button 
                                                onClick={() => handleTaskClick(task)} 
                                                className="text-gray-500 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition" 
                                                title="进入"
                                                disabled={!isReady}
                                            >
                                                <ArrowLeft size={16} className="rotate-180"/>
                                            </button>
                                            
                                            <button 
                                                onClick={(e) => handleTransmitClick(task, e)}
                                                className="text-gray-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition" 
                                                title="回传"
                                            >
                                                <Upload size={16} />
                                            </button>
                                        </>
                                      )}

                                      <button 
                                        onClick={(e) => handleDeleteClick(task.id, e)} 
                                        className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition" 
                                        title="删除"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      );
                      }))}
                  </tbody>
              </table>
              
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-white">
                  <span className="text-xs text-gray-400">显示 1 到 {filteredData.length} 条</span>
                  <div className="flex gap-2">
                      <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400 text-xs disabled:opacity-50 hover:bg-gray-50 hover:text-gray-600"> &lt; </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white text-xs font-medium shadow-sm">1</button>
                      <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-400 text-xs disabled:opacity-50 hover:bg-gray-50 hover:text-gray-600"> &gt; </button>
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
};

export default TaskManagement;