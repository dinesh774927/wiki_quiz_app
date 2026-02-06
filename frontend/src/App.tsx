import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, History } from 'lucide-react';
import QuizGenerator from './components/QuizGenerator';
import QuizHistory from './components/QuizHistory';

function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">W</span>
            <span className="font-bold text-xl text-slate-800 tracking-tight">WikiQuiz</span>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="flex p-1 bg-white rounded-xl border border-slate-200 w-fit mx-auto mb-12 shadow-sm">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'generate'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            <Wand2 size={16} /> Generate
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            <History size={16} /> History
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'generate' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'generate' ? <QuizGenerator /> : <QuizHistory />}
        </motion.div>
      </main>
    </div>
  );
}

export default App;
