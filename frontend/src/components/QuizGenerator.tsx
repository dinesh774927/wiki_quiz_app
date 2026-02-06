import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, BookOpen, Link as LinkIcon, Sparkles, MessageCircleQuestion } from 'lucide-react';
import { createQuizSession, submitAssessmentAnswers } from '../api';
import QuizCard from './QuizCard';

const QuizGenerator: React.FC = () => {
    const [url, setUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [showScorePopup, setShowScorePopup] = useState<number | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setQuizData(null);
        setAnswers({});

        try {
            const data = await createQuizSession(url, apiKey || undefined);
            setQuizData(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to generate quiz. Please check the URL and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (index: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [index]: answer }));
    };

    const handleSubmit = async () => {
        if (!quizData) return;
        setSubmitting(true);
        try {
            const data = await submitAssessmentAnswers(quizData.id, answers);
            setQuizData(data);
            setShowScorePopup(data.score);
        } catch (err) {
            console.error("Failed to submit quiz", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = async () => {
        if (!quizData) return;
        try {
            const data = await submitAssessmentAnswers(quizData.id, {});
            setQuizData(data);
            setAnswers({});
        } catch (err) {
            console.error("Failed to reset quiz", err);
        }
    };

    const isFinished = quizData && (quizData.score !== null && quizData.score !== undefined);

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1400px] mx-auto">
            {/* Left Column: Generator Tool */}
            <div className="w-full lg:w-[380px] shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 lg:sticky lg:top-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 tracking-tight">Quiz Control</h2>
                            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Generator Options</p>
                        </div>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Wiki Article URL</label>
                            <div className="relative">
                                <input
                                    type="url"
                                    placeholder="Paste Wikipedia link..."
                                    required
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm"
                                />
                                <LinkIcon className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
                            </div>
                        </div>

                        <div className="space-y-2 text-indigo-900 border-indigo-900">
                            <label className="text-sm font-bold text-slate-700 ml-1 uppercase">Custom API Key</label>
                            <input
                                type="password"
                                placeholder="..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm"
                            />
                            <p className="text-[10px] text-slate-400 font-medium px-1">Highly recommended for stable generation.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search size={18} />}
                            {loading ? 'Processing...' : 'Generate Quiz'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold animate-pulse">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Content Area */}
            <div className="flex-grow min-h-[500px]">
                <AnimatePresence mode="wait">
                    {!quizData && !loading && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full bg-white border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 p-12 text-center"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <BookOpen size={40} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Learn?</h3>
                            <p className="max-w-xs mx-auto font-medium">Enter a Wikipedia URL on the left to generate an interactive quiz from accurate topic data.</p>
                        </motion.div>
                    )}

                    {loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center"
                        >
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-20 scale-150" />
                                <div className="relative w-20 h-20 bg-white border-4 border-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                    <Loader2 size={32} className="animate-spin text-indigo-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">Compiling Intelligence</h2>
                            <p className="text-slate-500 font-medium">Extracting facts and generating questions for you...</p>
                        </motion.div>
                    )}

                    {quizData && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            {/* Summary Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-indigo-600 px-8 py-10 text-white relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black tracking-widest uppercase">Verified Knowledge</span>
                                            </div>
                                            <h1 className="text-5xl font-black tracking-tight leading-none mb-4">{quizData.title}</h1>
                                        </div>
                                        {isFinished && (
                                            <div className="bg-white text-indigo-600 px-8 py-6 rounded-2xl font-black text-center shadow-2xl min-w-[140px]">
                                                <div className="text-[10px] uppercase opacity-60 mb-1 tracking-widest">Final Grade</div>
                                                <div className="text-5xl">{quizData.score}%</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-8 border-t border-slate-100 bg-slate-50/30">
                                    <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">{quizData.summary}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {quizData.key_entities?.people?.map((p: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm">{p}</span>
                                        ))}
                                        {quizData.key_entities?.organizations?.map((o: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm">{o}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quiz Cards */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                        <MessageCircleQuestion size={18} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Knowledge Assessment</h3>
                                </div>

                                <div className="space-y-4">
                                    {quizData.quiz.map((q: any, i: number) => (
                                        <QuizCard
                                            key={i}
                                            data={q}
                                            index={i}
                                            selectedAnswer={answers[i]}
                                            onSelect={(ans) => handleSelect(i, ans)}
                                            showResults={isFinished}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Footer Submit/Reset */}
                            {!isFinished ? (
                                <motion.div
                                    layout
                                    className="sticky bottom-6 p-6 bg-slate-900 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 overflow-hidden">
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: Object.keys(answers).length / quizData.quiz.length }}
                                            className="h-full bg-white origin-left"
                                        />
                                    </div>
                                    <div className="relative z-10 text-center md:text-left">
                                        <div className="text-white font-bold">Submit Assessment</div>
                                        <div className="text-slate-400 text-xs uppercase font-black tracking-widest mt-1">
                                            {Object.keys(answers).length} / {quizData.quiz.length} Answered
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || Object.keys(answers).length === 0}
                                        className="relative z-10 bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-black hover:bg-indigo-500 disabled:opacity-30 transition-all text-sm w-full md:w-auto shadow-lg"
                                    >
                                        {submitting ? "Processing..." : "Finish Attempt"}
                                    </button>
                                </motion.div>
                            ) : (
                                <button
                                    onClick={handleReset}
                                    className="w-full bg-white border-2 border-slate-200 p-6 rounded-2xl text-slate-800 font-black text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 shadow-sm group"
                                >
                                    <Loader2 size={24} className="group-hover:animate-spin" />
                                    Try Different Answers
                                </button>
                            )}

                            {quizData.related_topics && (
                                <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200">
                                    <h4 className="font-black text-slate-400 mb-6 uppercase tracking-widest text-xs">Recommended Topics</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {quizData.related_topics.map((t: string, i: number) => (
                                            <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold hover:shadow-md cursor-pointer transition-all">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Score Popup */}
            <AnimatePresence>
                {showScorePopup !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-md"
                        onClick={() => setShowScorePopup(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 100, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.5, y: 100, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border-4 border-indigo-100"
                        >
                            <div className="text-6xl mb-6">
                                {showScorePopup >= 80 ? '🎉' : showScorePopup >= 50 ? '👏' : '📚'}
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 mb-2">Quiz Complete!</h3>
                            <p className="text-slate-500 mb-8 font-medium">You scored a fantastic</p>

                            <div className="text-7xl font-black text-indigo-600 mb-8 flex items-center justify-center">
                                {showScorePopup}<span className="text-3xl text-indigo-300 ml-1">%</span>
                            </div>

                            <button
                                onClick={() => setShowScorePopup(null)}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg"
                            >
                                Nice!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizGenerator;
