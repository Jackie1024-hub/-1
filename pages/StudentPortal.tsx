
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';

const StudentPortal: React.FC = () => {
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!code || !nickname) {
      setError("请填写所有字段");
      return;
    }

    const classroom = storage.getClassroom(code.toUpperCase());
    if (!classroom) {
      setError("未找到该邀请码，请确认输入是否正确");
      return;
    }

    if (classroom.expireAt < Date.now()) {
      setError("该邀请码已过期，请联系老师");
      return;
    }

    // Check if nickname already exists in roster
    const roster = storage.getRoster(classroom.code);
    const existing = roster.find(r => r.nickname === nickname);
    
    if (existing) {
      if (confirm(`欢迎回来, ${nickname}! 是否继续之前的游戏进度？`)) {
        navigate(`/game/${classroom.code}/${nickname}`);
      }
    } else {
      navigate(`/game/${classroom.code}/${nickname}`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 h-full flex flex-col justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 border">
        <div className="text-center mb-8">
          <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9l11 12m-1-5v2m-5-4v4m1-8v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">加入实验室</h1>
          <p className="text-slate-500">开启你的半导体工艺晋升之路</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">班级邀请码</label>
            <input 
              type="text" 
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="XN-XXXXX"
              className="w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg mono font-bold uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">你的昵称</label>
            <input 
              type="text" 
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="请输入你在实验室的代号"
              className="w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
            />
          </div>
          <button 
            onClick={handleJoin}
            className="w-full bg-slate-900 text-white rounded-xl py-4 font-bold text-lg hover:bg-slate-800 transition shadow-lg active:scale-95"
          >
            开始实验室任务
          </button>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-xs text-slate-400">
          <p>温馨提示：如果老师已经结束了班级，你将无法再进入。</p>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
