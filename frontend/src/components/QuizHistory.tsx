import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, X } from 'lucide-react';
import { fetchQuizHistory, fetchQuizDetails, submitAssessmentAnswers } from '../api';
import QuizCard from './QuizCard';

const QuizHistory: React.FC = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [showScorePopup, setShowScorePopup] = useState<number | null>(null);

    const fetchHistory = async () => {
        try {
            const data = await fetchQuizHistory();
            setHistory(data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSelect = (index: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [index]: answer }));
    };

    const handleSubmit = async () => {
        if (!selectedQuiz) return;
        setSubmitting(true);
        try {
            const data = await submitAssessmentAnswers(selectedQuiz.id, answers);
            setSelectedQuiz(data);
            setShowScorePopup(data.score);
            fetchHistory();
        } catch (err) {
            console.error("Failed to submit quiz", err);
        } finally {
            setSubmitting(false);
        }
    };

    const openDetails = async (id: number) => {
        try {
            const data = await fetchQuizDetails(id);
            setSelectedQuiz(data);
            setAnswers({});
        } catch (err) {
            console.error("Failed to fetch details", err);
        }
    };

    const handleReset = async () => {
        if (!selectedQuiz) return;
        try {
            const data = await submitAssessmentAnswers(selectedQuiz.id, {});
            setSelectedQuiz(data);
            setAnswers({});
            fetchHistory();
        } catch (err) {
            console.error("Failed to reset quiz", err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Generated Quizzes</h2>

            {loading ? (
                <p className="text-center py-12 text-slate-400">Loading history...</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Article Title</th>
                                <th className="p-4 font-semibold text-slate-600 text-center">Score</th>
                                <th className="p-4 font-semibold text-slate-600">Date Generated</th>
                                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {history.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium text-slate-800">{item.title}</td>
                                    <td className="p-4 text-center">
                                        {item.score !== null ? (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                item.score >= 50 ? 'bg-amber-100 text-amber-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                {item.score}%
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => openDetails(item.id)}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-end gap-1 ml-auto"
                                        >
                                            {item.score !== null ? 'Review' : 'Take Quiz'} <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {history.length === 0 && <p className="p-12 text-center text-slate-400">No quizzes generated yet.</p>}
                </div>
            )}

            <AnimatePresence>
                {selectedQuiz && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setSelectedQuiz(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
                        >
                            <button
                                onClick={() => setSelectedQuiz(null)}
                                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedQuiz.title}</h2>
                                    {selectedQuiz.score !== null && (
                                        <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">
                                            {selectedQuiz.score}%
                                        </div>
                                    )}
                                </div>
                                <p className="text-slate-500 mb-8">{selectedQuiz.summary}</p>

                                <div className="space-y-4">
                                    {selectedQuiz.quiz.map((q: any, i: number) => (
                                        <QuizCard
                                            key={i}
                                            data={q}
                                            index={i}
                                            selectedAnswer={answers[i]}
                                            onSelect={(ans) => handleSelect(i, ans)}
                                            showResults={selectedQuiz.score !== null}
                                        />
                                    ))}
                                </div>

                                {selectedQuiz.score === null && (
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting || Object.keys(answers).length === 0}
                                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
                                        >
                                            {submitting ? "Saving..." : "Submit Results"}
                                        </button>
                                    </div>
                                )}

                                {selectedQuiz.score !== null && (
                                    <div className="mt-8 text-center border-t pt-8">
                                        <p className="text-slate-500 mb-4 text-sm font-medium">Want to try again?</p>
                                        <button
                                            onClick={handleReset}
                                            className="bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all font-inter"
                                        >
                                            Reset Score & Retry
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            <h3 className="text-3xl font-black text-slate-800 mb-2 font-inter">Quiz Complete!</h3>
                            <p className="text-slate-500 mb-8 font-medium">You scored a fantastic</p>

                            <div className="text-7xl font-black text-indigo-600 mb-8 flex items-center justify-center font-inter">
                                {showScorePopup}<span className="text-3xl text-indigo-300 ml-1">%</span>
                            </div>

                            <button
                                onClick={() => setShowScorePopup(null)}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 font-inter"
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

export default QuizHistory;
