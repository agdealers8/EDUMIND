
import React, { useState } from 'react';
import { UserProfile, QuizData } from '../types';
import { geminiService } from '../services/gemini';
import { pdfService } from '../services/pdf';
import { Brain, Loader2, Download, CheckCircle2, AlertCircle, Eye, EyeOff, FileKey, ListOrdered, GraduationCap, ChevronDown } from 'lucide-react';

interface QuizGeneratorProps {
  profile: UserProfile;
  logActivity?: (activity: any) => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ profile, logActivity }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [form, setForm] = useState({
    syllabus: profile?.syllabus || '',
    grade: profile?.grade || '',
    book: '',
    chapter: '',
    topic: '',
    count: 10,
    difficulty: 'Medium'
  });

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const generate = async () => {
    if (!form.book.trim() || !form.chapter.trim() || !form.grade.trim()) {
      setError("Please fill in Grade, Book, and Chapter.");
      triggerShake();
      return;
    }

    setLoading(true);
    setError(null);
    setShowAnswers(false);
    try {
      const data = await geminiService.generateQuiz({
        ...form,
        language: profile?.language || 'English'
      });
      setQuizData(data);
      if (logActivity) {
        logActivity({
          type: 'quiz',
          title: `${form.chapter} Quiz (${form.grade})`,
          metadata: { 
            book: form.book, 
            grade: form.grade, 
            difficulty: form.difficulty,
            count: form.count 
          }
        });
      }
    } catch (err: any) {
      setError(err.message || "Generation failed. Try a smaller question count.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10 ${shake ? 'animate-shake' : ''}`}>
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300">
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <Brain className="text-indigo-600 w-8 h-8" /> Smart AI Quiz
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Target Grade / Class *
              </label>
              <input 
                type="text" 
                placeholder="e.g., Class 10, Year 1" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                value={form.grade}
                onChange={e => setForm({...form, grade: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Book Name *</label>
              <input 
                type="text" 
                placeholder="e.g., Chemistry Part-II" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                value={form.book}
                onChange={e => setForm({...form, book: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Chapter / Topic *</label>
              <input 
                type="text" 
                placeholder="e.g., Periodic Table" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                value={form.chapter}
                onChange={e => setForm({...form, chapter: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-1">
                  <ListOrdered className="w-3 h-3" /> Question Count
                </label>
                <input 
                  type="number" 
                  min="1" max="40"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  value={form.count}
                  onChange={e => setForm({...form, count: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Difficulty</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none"
                  value={form.difficulty}
                  onChange={e => setForm({...form, difficulty: e.target.value})}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <ChevronDown className="absolute right-4 bottom-4 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-end pt-4">
              <button 
                onClick={generate}
                disabled={loading}
                className="w-full text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : `Build My ${form.count} MCQ Quiz`}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 animate-in fade-in">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-xs font-bold leading-relaxed">{error}</div>
          </div>
        )}
      </div>

      {quizData && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in zoom-in-95">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">{quizData?.title}</h3>
              <div className="flex gap-2 mt-1">
                <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-widest">{form.difficulty}</span>
                <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded uppercase tracking-widest">{form.grade}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setShowAnswers(!showAnswers)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all text-xs"
              >
                {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showAnswers ? 'Hide' : 'Show'}
              </button>
              <button 
                onClick={() => pdfService.generateQuizPDF(quizData)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 text-xs"
              >
                <Download className="w-4 h-4" /> Exam PDF
              </button>
              <button 
                onClick={() => pdfService.generateQuizAnswerKeyPDF(quizData)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-xs"
              >
                <FileKey className="w-4 h-4" /> Keys PDF
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {quizData?.questions?.map((q, idx) => (
              <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                <p className="text-sm font-bold text-slate-800 mb-4 leading-relaxed">
                  <span className="text-indigo-600 mr-2">Q{idx + 1}.</span> {q.question}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {q?.options?.map((opt, oi) => (
                    <div key={oi} className={`p-4 rounded-xl border flex items-center gap-3 bg-white transition-all ${showAnswers && opt === q.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500 font-bold' : 'border-slate-200 text-slate-600'}`}>
                      <span className="font-bold text-[10px] w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 text-slate-500">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="text-xs">{opt}</span>
                    </div>
                  ))}
                </div>
                {showAnswers && (
                  <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] border border-emerald-100 animate-in fade-in slide-in-from-top-2 font-medium">
                    <strong className="block mb-1 text-[10px] uppercase tracking-widest text-emerald-600">Learning Insight:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
