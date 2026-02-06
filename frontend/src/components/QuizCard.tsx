import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';

interface QuizCardProps {
    data: {
        question: string;
        options: string[];
        answer: string;
        explanation: string;
        difficulty: string;
        user_answer?: string;
    };
    index: number;
    selectedAnswer?: string;
    onSelect?: (answer: string) => void;
    showResults?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ data, index, selectedAnswer, onSelect, showResults }) => {
    const isSubmitted = showResults || !!data.user_answer;
    const currentSelection = selectedAnswer || data.user_answer;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white rounded-xl shadow-md border border-slate-100 p-6 mb-6 hover:shadow-lg transition-shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                    {index + 1}. {data.question}
                </h3>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                    ${data.difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        data.difficulty?.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                    {data.difficulty}
                </span>
            </div>

            <div className="space-y-3">
                {data.options.map((option, idx) => {
                    const isSelected = currentSelection === option;
                    const isCorrect = option?.trim() === data.answer?.trim();

                    let optionClass = "w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center justify-between ";

                    if (isSubmitted) {
                        if (isCorrect) {
                            optionClass += "bg-green-50 border-green-500 text-green-800 font-medium";
                        } else if (isSelected) {
                            optionClass += "bg-red-50 border-red-500 text-red-800";
                        } else {
                            optionClass += "bg-gray-50 border-gray-200 opacity-50";
                        }
                    } else {
                        if (isSelected) {
                            optionClass += "bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-100";
                        } else {
                            optionClass += "bg-white border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer";
                        }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => onSelect?.(option)}
                            disabled={isSubmitted}
                            className={optionClass}
                        >
                            <span>{String.fromCharCode(65 + idx)}. {option}</span>
                            {isSubmitted && isCorrect && <Check className="w-5 h-5 text-green-600" />}
                            {isSubmitted && isSelected && !isCorrect && <X className="w-5 h-5 text-red-600" />}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence>
                {isSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-slate-100 bg-blue-50 rounded-b-lg -mx-6 -mb-6 p-4"
                    >
                        <div className="flex items-start gap-2 text-blue-800">
                            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-sm">Explanation</p>
                                <p className="text-sm mt-1">{data.explanation}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default QuizCard;
