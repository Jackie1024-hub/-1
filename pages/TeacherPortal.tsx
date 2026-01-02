
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Classroom, StudentResult } from '../types';

const TeacherPortal: React.FC = () => {
  const [activeClassrooms, setActiveClassrooms] = useState<Classroom[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [roster, setRoster] = useState<StudentResult[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [sortField, setSortField] = useState<'points' | 'exp'>('points');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form State
  const [newClassName, setNewClassName] = useState('');
  const [validHours, setValidHours] = useState(4);
  const [initialPoints, setInitialPoints] = useState(1000);

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('classroom:'));
    const classes = keys.map(k => JSON.parse(localStorage.getItem(k) || '{}'));
    setActiveClassrooms(classes);
    if (classes.length > 0 && !selectedCode) {
      handleSelectClass(classes[0].code);
    }
  };

  const handleSelectClass = (code: string) => {
    setSelectedCode(code);
    setRoster(storage.getRoster(code));
  };

  const createClassroom = () => {
    if (!newClassName) return alert("请输入班级名");
    
    const code = 'XN-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const now = Date.now();
    const classroom: Classroom = {
      code,
      className: newClassName,
      createdAt: now,
      expireAt: now + (validHours * 60 * 60 * 1000),
      initialPoints: initialPoints,
      unlockMode: "SEQUENTIAL",
      reward: {
        correctExp: 1,
        streakN: 5,
        streakBonusPoints: 200
      }
    };
    
    storage.saveClassroom(classroom);
    loadClassrooms();
    setShowCreate(false);
    setSelectedCode(code);
    setRoster([]);
  };

  const exportCSV = () => {
    if (roster.length === 0) return alert("无数据导出");
    const headers = "nickname,points,exp,level,stage,finishedAt,yieldRate,accuracy,lastSubmitAt\n";
    const rows = roster.map(r => 
      `${r.nickname},${r.points},${r.exp},${r.level},${r.stage},${r.finishedAt || ''},${r.yieldRate},${r.accuracy},${r.lastSubmitAt}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `芯农实验室_${selectedCode}_成绩单.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedRoster = [...roster].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const clearData = () => {
    if (confirm("确定要清空所有数据吗？此操作不可逆！")) {
      storage.clearAll();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">班级管理中心</h1>
          <p className="text-slate-500">管理您的《芯农实验室》虚拟班级</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + 创建新班级
          </button>
          <button 
            onClick={clearData}
            className="border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition text-sm"
          >
            清空本机数据
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold mb-4">创建课程</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">班级名称</label>
              <input 
                type="text" 
                value={newClassName} 
                onChange={e => setNewClassName(e.target.value)}
                placeholder="例如：2024芯片应用1班"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">有效时长 (小时)</label>
              <input 
                type="number" 
                value={validHours} 
                onChange={e => setValidHours(parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">初始积分</label>
              <input 
                type="number" 
                value={initialPoints} 
                onChange={e => setInitialPoints(parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-slate-600">取消</button>
            <button onClick={createClassroom} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">确认创建</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Class List */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">活跃班级</h3>
          <div className="flex flex-col gap-2">
            {activeClassrooms.map(c => (
              <button
                key={c.code}
                onClick={() => handleSelectClass(c.code)}
                className={`text-left p-3 rounded-lg transition border ${selectedCode === c.code ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'}`}
              >
                <div className="text-sm truncate">{c.className}</div>
                <div className="text-xs opacity-70 mono">{c.code}</div>
              </button>
            ))}
            {activeClassrooms.length === 0 && <div className="text-slate-400 text-sm italic">暂无活跃班级</div>}
          </div>
        </div>

        {/* Dashboard */}
        <div className="lg:col-span-3">
          {selectedCode ? (
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {activeClassrooms.find(c => c.code === selectedCode)?.className}
                  </h2>
                  <p className="text-sm text-slate-500">邀请码: <span className="mono font-bold text-blue-600 select-all">{selectedCode}</span></p>
                </div>
                <button 
                  onClick={exportCSV}
                  className="bg-white border text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition text-sm font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  导出成绩 (CSV)
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">昵称</th>
                      <th className="px-6 py-4 font-semibold">
                        <button onClick={() => { setSortField('points'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }} className="hover:text-blue-600 flex items-center gap-1">
                          积分 {sortField === 'points' && (sortOrder === 'desc' ? '↓' : '↑')}
                        </button>
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        <button onClick={() => { setSortField('exp'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }} className="hover:text-blue-600 flex items-center gap-1">
                          经验 {sortField === 'exp' && (sortOrder === 'desc' ? '↓' : '↑')}
                        </button>
                      </th>
                      <th className="px-6 py-4 font-semibold">等级</th>
                      <th className="px-6 py-4 font-semibold">阶段</th>
                      <th className="px-6 py-4 font-semibold">良率</th>
                      <th className="px-6 py-4 font-semibold">正确率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedRoster.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900">{s.nickname}</td>
                        <td className="px-6 py-4 text-blue-600 font-bold">{s.points.toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-600">{s.exp}</td>
                        <td className="px-6 py-4">
                           <span className="bg-slate-100 px-2 py-1 rounded text-xs">{s.level}级</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-xs ${s.stage === 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>阶段 {s.stage}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{s.yieldRate.toFixed(1)}%</td>
                        <td className="px-6 py-4 text-slate-600">{s.accuracy.toFixed(1)}%</td>
                      </tr>
                    ))}
                    {sortedRoster.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                          还没有学生提交成绩
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
              请在左侧选择或创建一个班级
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPortal;
