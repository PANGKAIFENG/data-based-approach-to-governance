import React, { useState } from 'react';
import { X, Search, Folder, ChevronRight, ChevronDown, MoreVertical, Plus } from 'lucide-react';

interface FolderItem {
  id: string;
  name: string;
  children?: FolderItem[];
  isOpen?: boolean;
}

interface TransmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (folderId: string) => void;
}

const INITIAL_FOLDERS: FolderItem[] = [
  { id: '1', name: '我的款式', children: [] },
  { id: '2', name: '我的协作', children: [] },
  { 
    id: '3', 
    name: '客户款式', 
    isOpen: true,
    children: [
      { id: '3-1', name: '未命名' },
      { id: '3-2', name: '000skx' },
      { id: '3-3', name: '0123465' },
      { id: '3-4', name: '05190' },
      { id: '3-5', name: '1' },
      { id: '3-6', name: '1' },
      { id: '3-7', name: '11' },
      { id: '3-8', name: '111' },
      { id: '3-9', name: '111' },
      { id: '3-10', name: '1111' },
      { id: '3-11', name: '11111' },
      { id: '3-12', name: '1112' },
      { id: '3-13', name: '1212' },
      { id: '3-14', name: '12132123' },
      { id: '3-15', name: '122321' },
      { id: '3-16', name: '123' },
    ] 
  }
];

const TransmitConfirmModal: React.FC<TransmitConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderMenu, setShowNewFolderMenu] = useState(false);

  if (!isOpen) return null;

  const toggleFolder = (id: string) => {
    const updateFolders = (list: FolderItem[]): FolderItem[] => {
      return list.map(item => {
        if (item.id === id) {
          return { ...item, isOpen: !item.isOpen };
        }
        if (item.children) {
          return { ...item, children: updateFolders(item.children) };
        }
        return item;
      });
    };
    setFolders(updateFolders(folders));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const FolderTree = ({ items, level = 0 }: { items: FolderItem[], level?: number }) => {
    return (
      <div className="flex flex-col">
        {items.map(item => {
           // Simple search filter
           if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && (!item.children || item.children.length === 0)) {
               // Only hide leaf nodes that don't match. For parent nodes, logic should be more complex but keeping simple for UI demo.
               // If it's a root folder with matching children, we might want to show it.
               // For this demo, let's just filter by name match on current item only for simplicity
               if (!item.name.toLowerCase().includes(searchQuery.toLowerCase()) && level > 0) return null; 
           }

           const isSelected = selectedId === item.id;
           const hasChildren = item.children && item.children.length > 0;
           
           return (
             <div key={item.id}>
                <div 
                   className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition select-none
                   ${isSelected ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}`}
                   style={{ paddingLeft: `${level * 20 + 16}px` }}
                   onClick={() => handleSelect(item.id)}
                >
                   <div 
                     className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
                     onClick={(e) => { e.stopPropagation(); toggleFolder(item.id); }}
                   >
                      {hasChildren ? (
                          item.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                      ) : (
                          <div className="w-3.5" /> // Spacer
                      )}
                   </div>
                   
                   <Folder size={18} className={isSelected ? 'fill-blue-100' : 'fill-gray-50'} />
                   <span className="text-sm truncate">{item.name}</span>
                </div>
                {hasChildren && item.isOpen && (
                   <FolderTree items={item.children!} level={level + 1} />
                )}
             </div>
           );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[500px] h-[700px] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">移动到</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 flex items-center justify-between">
           <span className="font-bold text-gray-700">文件夹</span>
           <div className="flex items-center gap-3">
              <Search size={18} className="text-gray-400 cursor-pointer hover:text-gray-600" />
              <div className="relative">
                 <MoreVertical 
                    size={18} 
                    className="text-gray-400 cursor-pointer hover:text-gray-600" 
                    onClick={() => setShowNewFolderMenu(!showNewFolderMenu)}
                 />
                 {showNewFolderMenu && (
                     <div className="absolute right-0 top-6 bg-white shadow-lg border border-gray-100 rounded-md py-1 w-32 z-10">
                         <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                             <Plus size={14} /> 新建文件夹
                         </button>
                     </div>
                 )}
              </div>
           </div>
        </div>

        {/* Tree Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           <FolderTree items={folders} />
           
           {/* Fallback space for better scrolling experience */}
           <div className="h-10"></div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition"
            >
                取 消
            </button>
            <button 
                onClick={() => selectedId && onConfirm(selectedId)}
                disabled={!selectedId}
                className={`px-6 py-2 rounded text-sm text-white font-medium transition shadow-sm
                ${selectedId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
                确 定
            </button>
        </div>

      </div>
    </div>
  );
};

export default TransmitConfirmModal;