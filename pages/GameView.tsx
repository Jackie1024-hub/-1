
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { Classroom, GameSession, EngineerLevel, StudentResult } from '../types';
import { LEVEL_CONFIG, QUESTIONS } from '../constants';

const GameView: React.FC = () => {
  const { code, nickname } = useParams<{ code: string, nickname: string }>();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [activeTask, setActiveTask] = useState<{ name: string, timeLeft: number, type: string } | null>(null);
  const [demoSpeed, setDemoSpeed] = useState(false);
  
  // Knowledge Question UI
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<typeof QUESTIONS[0] | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);

  // Result UI
  const [showSummary, setShowSummary] = useState(false);

  // Load and Init
  useEffect(() => {
    if (!code || !nickname) return;
    const cls = storage.getClassroom(code);
    if (!cls) {
      alert("班级失效");
      navigate('/student');
      return;
    }
    setClassroom(cls);

    const saved = storage.getSession(code, nickname);
    if (saved) {
      setSession(saved);
    } else {
      const initialSession: GameSession = {
        stage: 1,
        levelIndex: 0,
        points: cls.initialPoints,
        exp: 0,
        purity: 0,
        streak: 0,
        inventory: {
          rawMaterial: 0,
          crudeSilicon: 0,
          siliconIngot: 0,
          memoryWafer: 0,
          powerWafer: 0,
          memoryChip: 0,
          powerChip: 0
        },
        correctCount: 0,
        totalAnswered: 0,
        manufactureSuccess: 0,
        manufactureTotal: 0,
        startTime: Date.now(),
        isFinished: false
      };
      setSession(initialSession);
      storage.saveSession(code, nickname, initialSession);
    }
  }, [code, nickname, navigate]);

  // Sync session to localStorage
  useEffect(() => {
    if (session && code && nickname) {
      storage.saveSession(code, nickname, session);
    }
  }, [session, code, nickname]);

  // Timer logic for tasks
  useEffect(() => {
    if (!activeTask) return;
    const interval = setInterval(() => {
      setActiveTask(prev => {
        if (!prev) return null;
        if (prev.timeLeft <= 0) {
          handleTaskComplete(prev);
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - (demoSpeed ? 60 : 1) };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTask, demoSpeed]);

  const handleTaskComplete = (task: { type: string }) => {
    if (!session) return;
    setSession(prev => {
      if (!prev) return null;
      const newS = { ...prev };
      switch (task.type) {
        case 'purify':
          newS.inventory.rawMaterial -= 10;
          newS.inventory.crudeSilicon += 1;
          newS.purity = Math.min(LEVEL_CONFIG[newS.levelIndex].maxPurity, 80 + Math.random() * 10);
          break;
        case 'ingot':
          newS.inventory.crudeSilicon -= 10;
          newS.inventory.siliconIngot += 1;
          newS.purity = Math.min(LEVEL_CONFIG[newS.levelIndex].maxPurity, 90 + Math.random() * 5);
          break;
        case 'manufacture_memory':
          newS.inventory.memoryWafer -= 2;
          newS.points -= 300;
          newS.inventory.memoryChip += 1;
          newS.manufactureSuccess += 1;
          newS.manufactureTotal += 1;
          break;
        case 'manufacture_power':
          newS.inventory.powerWafer -= 2;
          newS.points -= 500;
          newS.inventory.powerChip += 1;
          newS.manufactureSuccess += 1;
          newS.manufactureTotal += 1;
          if (newS.purity >= 99.9999) {
            // Check win condition
          }
          break;
      }
      return newS;
    });
  };

  // Actions
  const buyMaterials = () => {
    if (!session) return;
    const count = 100;
    const cost = count * 10;
    if (session.points < cost) return alert("积分不足");
    setSession({
      ...session,
      points: session.points - cost,
      inventory: { ...session.inventory, rawMaterial: session.inventory.rawMaterial + count }
    });
  };

  const startTask = (type: string, name: string, duration: number) => {
    if (activeTask) return;
    // Resource checks
    if (type === 'purify' && session!.inventory.rawMaterial < 10) return alert("原料不足(需要10份)");
    if (type === 'ingot' && session!.inventory.crudeSilicon < 10) return alert("粗硅不足(需要10份)");
    if (type === 'manufacture_memory' && (session!.inventory.memoryWafer < 2 || session!.points < 300)) return alert("资源不足(需要2份硅片+300积分)");
    if (type === 'manufacture_power' && (session!.inventory.powerWafer < 2 || session!.points < 500)) return alert("资源不足(需要2份外延片+500积分)");

    setActiveTask({ name, type, timeLeft: duration });
  };

  const cutSilicon = () => {
    if (!session || session.inventory.siliconIngot <= 0) return;
    setSession(prev => {
      if (!prev) return null;
      const count = prev.inventory.siliconIngot;
      let mem = prev.inventory.memoryWafer;
      let pwr = prev.inventory.powerWafer;
      if (prev.purity < 95) {
        mem += count * 5;
      } else {
        pwr += count * 5;
      }
      return {
        ...prev,
        inventory: { ...prev.inventory, siliconIngot: 0, memoryWafer: mem, powerWafer: pwr }
      };
    });
  };

  const sellChips = () => {
    if (!session) return;
    const memVal = session.inventory.memoryChip * 500;
    const pwrVal = session.inventory.powerChip * 800;
    setSession({
      ...session,
      points: session.points + memVal + pwrVal,
      inventory: { ...session.inventory, memoryChip: 0, powerChip: 0 }
    });
  };

  // Quiz logic
  const triggerQuiz = () => {
    const pool = QUESTIONS.filter(q => q.stage <= session!.stage);
    const q = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(q);
    setQuizMode(true);
    setSelectedOption(null);
    setQuizResult(null);
  };

  const submitAnswer = () => {
    if (selectedOption === null || !currentQuestion || !session || !classroom) return;
    const isCorrect = selectedOption === currentQuestion.answer;
    setQuizResult(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setTimeout(() => {
        const newStreak = session.streak + 1;
        let bonus = 0;
        if (newStreak >= classroom.reward.streakN) {
           bonus = classroom.reward.streakBonusPoints;
           alert(`恭喜！达成${classroom.reward.streakN}连对，奖励${bonus}积分！`);
        }
        
        setSession({
          ...session,
          exp: session.exp + classroom.reward.correctExp,
          points: session.points + bonus,
          streak: newStreak >= classroom.reward.streakN ? 0 : newStreak,
          correctCount: session.correctCount + 1,
          totalAnswered: session.totalAnswered + 1
        });
        setQuizMode(false);
      }, 1000);
    } else {
      setSession({
        ...session,
        streak: 0,
        totalAnswered: session.totalAnswered + 1
      });
      alert("回答错误，请再看一遍解释。");
    }
  };

  // Promotion logic
  const checkPromotion = () => {
    if (!session) return;
    const currentLevel = LEVEL_CONFIG[session.levelIndex];
    if (session.exp >= currentLevel.expThreshold) {
      if (confirm(`经验达标！是否参加晋升考核？`)) {
        triggerQuiz(); // Simplify promotion as a random quiz for now
        setSession({ ...session, levelIndex: Math.min(session.levelIndex + 1, 3) });
      }
    }
  };

  const nextStage = () => {
    if (!session) return;
    if (session.stage === 1 && session.purity >= 90) {
      setSession({...session, stage: 2});
    } else if (session.stage === 2 && session.purity >= 99.9) {
      setSession({...session, stage: 3});
    } else {
      alert("尚未达到通关条件");
    }
  };

  const submitFinal = () => {
    if (!session || !code || !nickname) return;
    const accuracy = session.totalAnswered > 0 ? (session.correctCount / session.totalAnswered) * 100 : 0;
    const yieldRate = session.manufactureTotal > 0 ? (session.manufactureSuccess / session.manufactureTotal) * 100 : 100;
    
    const result: StudentResult = {
      nickname,
      points: session.points,
      exp: session.exp,
      level: session.levelIndex + 1,
      stage: session.stage,
      finishedAt: session.isFinished ? Date.now() : null,
      yieldRate,
      accuracy,
      lastSubmitAt: Date.now()
    };
    
    storage.updateStudentResult(code, result);
    alert("成绩已提交至班级名册！");
    setShowSummary(true);
  };

  if (!session || !classroom) return <div className="p-8">正在初始化实验室设备...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar: Profile & Status */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" /></svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-1">{nickname}</h2>
            <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">{LEVEL_CONFIG[session.levelIndex].title}</div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>职级经验 (Lv.{session.levelIndex + 1})</span>
                  <span>{session.exp} / {LEVEL_CONFIG[session.levelIndex].expThreshold}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${Math.min(100, (session.exp / (LEVEL_CONFIG[session.levelIndex].expThreshold || 1)) * 100)}%`}}></div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-slate-400 text-xs">研究经费</div>
                  <div className="text-2xl font-bold text-emerald-400 mono">{session.points.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-xs">当前阶段</div>
                  <div className="text-lg font-bold">ST-{session.stage}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> 资源库存
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-slate-500 text-xs">原材料</div>
              <div className="font-bold mono">{session.inventory.rawMaterial}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-slate-500 text-xs">粗硅</div>
              <div className="font-bold mono">{session.inventory.crudeSilicon}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-slate-500 text-xs">硅棒</div>
              <div className="font-bold mono">{session.inventory.siliconIngot}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-slate-500 text-xs">存储硅片</div>
              <div className="font-bold mono">{session.inventory.memoryWafer}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-slate-500 text-xs">外延片</div>
              <div className="font-bold mono">{session.inventory.powerWafer}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border-t-2 border-emerald-100">
              <div className="text-slate-500 text-xs">成品芯片</div>
              <div className="font-bold mono text-emerald-600">{session.inventory.memoryChip + session.inventory.powerChip}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel: Process & Actions */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Purity Indicator */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">制造工艺状态</h3>
            <div className="flex gap-2">
               <button onClick={() => setDemoSpeed(!demoSpeed)} className={`text-xs px-2 py-1 rounded border transition ${demoSpeed ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-50 text-slate-500'}`}>
                 教学加速x60 {demoSpeed ? 'ON' : 'OFF'}
               </button>
            </div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">当前晶圆提纯度</span>
              <span className="font-bold text-blue-600 mono">{session.purity.toFixed(6)}%</span>
            </div>
            <div className="h-6 bg-slate-100 rounded-full border p-1">
              <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-1000" style={{width: `${(session.purity / 100) * 100}%`}}></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 italic">※ 越高职级的工程师可达到的纯度上限越高。</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="text-xs text-blue-500 mb-1">平均良率</div>
              <div className="text-xl font-bold">{session.manufactureTotal > 0 ? ((session.manufactureSuccess/session.manufactureTotal)*100).toFixed(1) : '100'}%</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <div className="text-xs text-emerald-500 mb-1">知识正确率</div>
              <div className="text-xl font-bold">{session.totalAnswered > 0 ? ((session.correctCount/session.totalAnswered)*100).toFixed(1) : '0'}%</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <div className="text-xs text-amber-500 mb-1">连对奖励</div>
              <div className="text-xl font-bold">{session.streak} / {classroom.reward.streakN}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">实验室代码</div>
              <div className="text-xl font-bold mono">{code}</div>
            </div>
          </div>
        </div>

        {/* Task Board */}
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-900 text-white font-bold flex justify-between items-center">
             <span>实验室控制台 - 阶段 {session.stage}</span>
             {activeTask && (
               <div className="text-xs text-emerald-400 animate-pulse flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                 {activeTask.name} 运行中 ({Math.ceil(activeTask.timeLeft)}s)
               </div>
             )}
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Stage 1 Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-1">原材料与提纯</h4>
              <button onClick={buyMaterials} className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 transition group">
                <div className="font-bold text-slate-900">采购原料</div>
                <div className="text-xs text-slate-500">消耗 1000 积分 兑换 100 份原料</div>
              </button>
              <button 
                onClick={() => startTask('purify', '硅提纯', LEVEL_CONFIG[session.levelIndex].baseDuration)}
                disabled={!!activeTask || session.inventory.rawMaterial < 10}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 transition disabled:opacity-50 disabled:hover:border-slate-100"
              >
                <div className="font-bold text-slate-900">硅提纯 (沙子→粗硅)</div>
                <div className="text-xs text-slate-500">消耗 10 份原料 | 需 {LEVEL_CONFIG[session.levelIndex].baseDuration}s</div>
              </button>
            </div>

            {/* Stage 2 Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-1">制造与分类</h4>
              <button 
                onClick={() => startTask('ingot', '硅棒拉晶', LEVEL_CONFIG[session.levelIndex].baseDuration * 1.5)}
                disabled={!!activeTask || session.inventory.crudeSilicon < 10 || session.stage < 2}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 transition disabled:opacity-50 disabled:hover:border-slate-100"
              >
                <div className="font-bold text-slate-900">拉晶工艺 (粗硅→硅棒)</div>
                <div className="text-xs text-slate-500">需要阶段2 | 消耗 10 份粗硅</div>
              </button>
              <button 
                onClick={cutSilicon}
                disabled={session.inventory.siliconIngot <= 0}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 transition disabled:opacity-50"
              >
                <div className="font-bold text-slate-900">精密切割 (硅棒→硅片)</div>
                <div className="text-xs text-slate-500">按纯度自动分类为 存储/外延片</div>
              </button>
            </div>

            {/* Stage 3 Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-1">芯片成品</h4>
              <button 
                 onClick={() => startTask('manufacture_memory', '存储器制造', 900)}
                 disabled={!!activeTask || session.stage < 3 || session.inventory.memoryWafer < 2}
                 className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-purple-500 transition disabled:opacity-50"
              >
                <div className="font-bold text-slate-900">存储器芯片制造</div>
                <div className="text-xs text-slate-500">-2硅片 -300积分 | 售出+500</div>
              </button>
              <button 
                onClick={() => startTask('manufacture_power', '高功率制造', 1200)}
                disabled={!!activeTask || session.stage < 3 || session.inventory.powerWafer < 2}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-purple-500 transition disabled:opacity-50"
              >
                <div className="font-bold text-slate-900">高功率芯片制造</div>
                <div className="text-xs text-slate-500">-2外延 -500积分 | 售出+800</div>
              </button>
              <button 
                onClick={sellChips}
                className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-700 transition"
              >
                结算并卖出所有成品芯片
              </button>
            </div>

          </div>
        </div>

        {/* Global Control Bar */}
        <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-100 p-4 rounded-2xl border">
           <div className="flex gap-2">
              <button onClick={triggerQuiz} className="bg-white border px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.813a1 1 0 00-.788 0l-7 3a1 1 0 000 1.848l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.848l-7-3z" />
                  <path d="M4.293 10.707a1 1 0 011.414 0L10 15.01l4.293-4.303a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414z" />
                </svg>
                知识问答 (Exp+)
              </button>
              <button onClick={checkPromotion} className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-200 transition">
                晋升考核
              </button>
           </div>
           
           <div className="flex gap-2">
              {session.stage < 3 && (
                <button onClick={nextStage} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition">
                  进入下一阶段 ST-{session.stage + 1}
                </button>
              )}
              <button onClick={submitFinal} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition">
                提交成绩
              </button>
           </div>
        </div>

      </div>

      {/* Quiz Modal */}
      {quizMode && currentQuestion && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">知识巩固 ST-{currentQuestion.stage}</span>
              <button onClick={() => setQuizMode(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">{currentQuestion.text}</h3>
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(i)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${selectedOption === i ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              ))}
            </div>
            {quizResult && (
               <div className={`p-4 rounded-xl mb-6 text-sm ${quizResult === 'correct' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                 <div className="font-bold mb-1">{quizResult === 'correct' ? '回答正确！' : '回答错误，请再试一次。'}</div>
                 <p className="opacity-80">{currentQuestion.explanation}</p>
               </div>
            )}
            <button 
              onClick={submitAnswer}
              disabled={selectedOption === null || quizResult === 'correct'}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50"
            >
              提交答案
            </button>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-10 text-center shadow-2xl relative">
            <div className="bg-emerald-500 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
               </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">实验已结束</h2>
            <p className="text-slate-500 mb-8">你的成绩已成功归档到班级 {code}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="p-4 bg-slate-50 rounded-2xl">
                 <div className="text-xs text-slate-400 mb-1">最终积分</div>
                 <div className="text-2xl font-bold text-blue-600">{session.points.toLocaleString()}</div>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl">
                 <div className="text-xs text-slate-400 mb-1">制造良率</div>
                 <div className="text-2xl font-bold text-emerald-600">{session.manufactureTotal > 0 ? ((session.manufactureSuccess/session.manufactureTotal)*100).toFixed(1) : '100'}%</div>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl">
                 <div className="text-xs text-slate-400 mb-1">累计经验</div>
                 <div className="text-2xl font-bold text-amber-600">{session.exp}</div>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl">
                 <div className="text-xs text-slate-400 mb-1">知识正确率</div>
                 <div className="text-2xl font-bold text-slate-900">{session.totalAnswered > 0 ? ((session.correctCount/session.totalAnswered)*100).toFixed(1) : '0'}%</div>
               </div>
            </div>

            <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition">
              返回大厅
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default GameView;
