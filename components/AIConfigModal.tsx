import React, { useState } from 'react';
import { X, Trash2, Edit2, GripVertical, Check, RotateCcw } from 'lucide-react';
import { AIFieldConfig } from '../types';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIConfigModal: React.FC<AIConfigModalProps> = ({ isOpen, onClose }) => {
  const [fields, setFields] = useState<AIFieldConfig[]>([
    { id: '1', name: '版型' },
    { id: '2', name: '领型' },
    { id: '3', name: '袖型' },
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!isOpen) return null;

  const handleAddField = () => {
    if (newFieldName.trim()) {
      setFields([...fields, { id: Date.now().toString(), name: newFieldName.trim() }]);
      setNewFieldName('');
    }
  };

  const handleDelete = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const startEdit = (field: AIFieldConfig) => {
    setEditingId(field.id);
    setEditValue(field.name);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
        setFields(fields.map(f => f.id === editingId ? { ...f, name: editValue.trim() } : f));
        setEditingId(null);
        setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">配置 AI 识别字段</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition rounded-full p-1 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm hover:border-blue-100 transition group">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-gray-300 cursor-grab active:cursor-grabbing group-hover:text-gray-400">
                    <GripVertical size={16} />
                  </span>
                  
                  {editingId === field.id ? (
                      <input 
                        type="text" 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-blue-400 rounded outline-none focus:ring-1 focus:ring-blue-400 text-gray-700"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                  ) : (
                      <span className="text-gray-700 font-medium">{field.name}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {editingId === field.id ? (
                      <>
                        <button onClick={saveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition" title="保存">
                            <Check size={16} />
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition" title="取消">
                            <RotateCcw size={16} />
                        </button>
                      </>
                  ) : (
                      <>
                        <button onClick={() => startEdit(field)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="编辑">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(field.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="删除">
                            <Trash2 size={16} />
                        </button>
                      </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New */}
          <div className="mt-6">
            <div className="relative">
                <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="请输入新字段名称"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-sm pr-20"
                onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
                />
                <button
                onClick={handleAddField}
                className="absolute right-2 top-2 px-3 py-1.5 text-blue-600 font-medium text-sm hover:bg-blue-50 rounded-md transition"
                >
                确认添加
                </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            取消
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm shadow-blue-200"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConfigModal;