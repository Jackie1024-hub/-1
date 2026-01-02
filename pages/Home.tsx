
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 h-full flex flex-col justify-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">欢迎来到芯农实验室</h1>
        <p className="text-lg text-slate-600">探索半导体制造奥秘，从沙子到超级芯片的进阶之旅</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div 
          onClick={() => navigate('/teacher')}
          className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all group"
        >
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">我是老师</h2>
          <p className="text-slate-500">创建班级、分发邀请码、查看学生进度及导出成绩数据。</p>
        </div>

        <div 
          onClick={() => navigate('/student')}
          className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-emerald-500 hover:shadow-lg cursor-pointer transition-all group"
        >
          <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">我是学生</h2>
          <p className="text-slate-500">输入邀请码加入班级，开启芯片制造模拟挑战，赚取积分提升职级。</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
