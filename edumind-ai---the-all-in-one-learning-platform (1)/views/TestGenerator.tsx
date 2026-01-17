
import React, { useState } from 'react';
import { UserProfile, TestPaper } from '../types';
import { geminiService } from '../services/gemini';
import { pdfService } from '../services/pdf';
import { 
  FileText, Loader2, Download, Timer, ListChecks, Zap, 
  AlertCircle, PlusCircle, MessageSquare, FileKey, 
  Eye, EyeOff, GraduationCap, ChevronDown 
} from 'lucide-react';

interface TestGeneratorProps {
  profile: UserProfile;
  logActivity?: (activity: any) => void;
}

const TestGenerator: React.FC<TestGeneratorProps> = ({ profile, logActivity }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [testPaper, setTestPaper] = useState<TestPaper | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [form, setForm] = useState({
    board: profile?.board || profile?.syllabus || '',
    grade: profile?.grade || '',
    subject: '',
    chapters: '',
    duration: '3 Hours',
    difficulty: 'Medium',
    totalMarks: 100,
    customInstructions: ''
  });

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const generate = async () => {
    if (!form.board.trim() || !form.subject.trim() || !form.chapters.trim() || !form.grade.trim()) {
      setError("Grade, Subject, Board, and Chapters are mandatory.");
      triggerShake();
      return;
    }

    setLoading(true);
    setError(null);
    setShowAnswers(false);
    try {
      const data = await geminiService.generateTest({
        ...form,
        language: profile?.language || 'English'
      });
      setTestPaper(data);
      if (logActivity) {
        logActivity({
          type: 'test',
          title: `${form.subject} Exam (${form.grade})`,
          metadata: { 
            board: form.board, 
            marks: form.totalMarks, 
            difficulty: form.difficulty,
            subject: form.subject
          }
        });
      }
    } catch (err: any) {
      setError(err.message || "Exam generation failed. Try specifying fewer chapters.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10 ${shake ? 'animate-shake' : ''}`}>
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative transition-all duration-300">
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <Zap className="text-indigo-600 w-8 h-8 fill-indigo-600" /> Exam Architect
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Grade / Class *
              </label>
              <input 
                type="text" 
                placeholder="e.g., FSC Part-2, Grade 12" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                value={form.grade}
                onChange={e => setForm({...form, grade: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Board / Syllabus *</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                value={form.board}
                onChange={e => setForm({...form, board: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Subject *</label>
              <input 
                type="text" 
                placeholder="e.g., Physics, Maths"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                value={form.subject}
                onChange={e => setForm({...form, subject: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Total Marks *</label>
                <input 
                  type="number" 
                  min="10" max="500"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  value={form.totalMarks}
                  onChange={e => setForm({...form, totalMarks: parseInt(e.target.value) || 0})}
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
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Chapters *</label>
              <input 
                type="text" 
                placeholder="e.g., Ch 1-4, Whole Book" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                value={form.chapters}
                onChange={e => setForm({...form, chapters: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Extra Logic
              </label>
              <textarea 
                placeholder="e.g., Board pattern, focus on derivations..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px]"
                value={form.customInstructions}
                onChange={e => setForm({...form, customInstructions: e.target.value})}
              />
            </div>
            <button 
              onClick={generate}
              disabled={loading}
              className="w-full text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><PlusCircle className="w-4 h-4" /> Build My Exam Paper</>}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 animate-in fade-in">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-xs font-bold leading-relaxed">{error}</div>
          </div>
        )}
      </div>

      {testPaper && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in zoom-in-95">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-6 mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900">{testPaper?.title}</h3>
              <div className="flex gap-4 text-[10px] font-black uppercase text-slate-400 mt-2">
                <span className="flex items-center gap-1 tracking-widest"><Timer className="w-3 h-3" /> {testPaper?.duration}</span>
                <span className="flex items-center gap-1 tracking-widest"><ListChecks className="w-3 h-3" /> {testPaper?.totalMarks} Marks</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setShowAnswers(!showAnswers)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all text-xs"
              >
                {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showAnswers ? 'Hide' : 'Key'}
              </button>
              <button 
                onClick={() => pdfService.generateTestPDF(testPaper)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 text-xs shadow-sm"
              >
                <Download className="w-4 h-4" /> Paper PDF
              </button>
              <button 
                onClick={() => pdfService.generateTestAnswerKeyPDF(testPaper)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-xs shadow-sm"
              >
                <FileKey className="w-4 h-4" /> Key PDF
              </button>
            </div>
          </div>

          <div className="space-y-10">
            {testPaper?.sections?.map((section, sidx) => (
              <div key={sidx} className="animate-in fade-in duration-500" style={{ animationDelay: `${sidx * 150}ms` }}>
                <h4 className="text-[11px] font-black text-slate-400 border-b-2 border-slate-100 pb-2 mb-6 uppercase tracking-[0.2em]">{section?.sectionTitle}</h4>
                <div className="space-y-8">
                  {section?.questions?.map((q, qidx) => (
                    <div key={qidx} className="flex gap-4 group border-b border-slate-50 pb-6 last:border-0">
                      <span className="font-black text-slate-300 text-sm mt-1">{q.id}.</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800 leading-relaxed mb-4">{q.text}</p>
                        
                        {q?.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className={`text-xs p-3 rounded-xl border flex gap-2 items-center ${showAnswers && opt === q.answer ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold' : 'bg-slate-50 border-transparent text-slate-600'}`}>
                                <span className="font-black text-[9px] w-5 h-5 rounded-full bg-white flex items-center justify-center border border-slate-100 text-slate-400">
                                  {String.fromCharCode(65 + oi)}
                                </span> 
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {showAnswers && (
                          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 animate-in fade-in slide-in-from-top-1 font-medium">
                            <span className="font-black uppercase tracking-widest text-indigo-500 block mb-1 text-[9px]">Model Answer:</span> {q.answer}
                            {q.explanation && <p className="mt-2 opacity-80 italic">{q.explanation}</p>}
                          </div>
                        )}
                        <div className="mt-4 text-[9px] uppercase font-black text-slate-400 flex items-center justify-between tracking-widest">
                           <span className="bg-slate-100 px-2 py-0.5 rounded">Marks: {q.marks}</span>
                           <span className="opacity-0 group-hover:opacity-100 transition-opacity">Format: {q.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestGenerator;
