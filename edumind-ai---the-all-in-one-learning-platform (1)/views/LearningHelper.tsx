
import React, { useState } from 'react';
import { UserProfile, LearningContent } from '../types';
import { geminiService } from '../services/gemini';
import { BookOpen, Search, Loader2, ListChecks, Lightbulb, Image as ImageIcon, Zap, Pointer, Hand, CheckCircle, AlertCircle } from 'lucide-react';

interface LearningHelperProps {
  profile: UserProfile;
  logActivity?: (activity: any) => void;
}

const LearningHelper: React.FC<LearningHelperProps> = ({ profile, logActivity }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState<LearningContent | null>(null);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const validate = () => {
    if (!topic.trim()) return "Please enter an educational topic.";
    if (topic.length < 2) return "Topic name is too short. Try 'Mitosis' or 'Quantum Theory'.";
    if (/^[0-9]+$/.test(topic.trim())) return "Numbers alone are not valid topics. Please use words.";
    return null;
  };

  const learn = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      triggerShake();
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await geminiService.getLearningHelper(topic, profile);
      setContent(data);
      if (logActivity) {
        logActivity({
          type: 'helper',
          title: `Learned: ${topic}`,
          metadata: { topic }
        });
      }
    } catch (err: any) {
      setError(err.message || "Could not clarify this concept. Please try a different topic.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 ${shake ? 'animate-shake' : ''}`}>
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl overflow-hidden relative transition-all duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <BookOpen className="w-40 h-40" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center gap-3">
          <Zap className="text-amber-500 w-8 h-8 fill-amber-500" /> Concept Clarifier
        </h2>
        <p className="text-slate-500 mb-8 max-w-xl font-medium leading-relaxed">Type any topic from your syllabus, and I'll explain it using simplified logic and visuals adapted for your level.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 animate-in fade-in zoom-in-95">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-sm font-bold">{error}</div>
            <button onClick={() => setError(null)} className="ml-auto text-xs font-bold uppercase hover:underline">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="e.g., Photosynthesis, Newton's 2nd Law, Cell Division" 
              className={`w-full pl-12 pr-4 py-5 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-lg transition-all font-medium ${!topic.trim() && error ? 'border-red-400' : 'border-slate-200'}`}
              value={topic}
              onChange={e => { setTopic(e.target.value); if(error) setError(null); }}
              onKeyDown={e => e.key === 'Enter' && learn()}
            />
          </div>
          <button 
            onClick={learn}
            disabled={loading}
            className={`px-10 py-5 text-white font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg ${loading ? 'bg-slate-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
          >
            {loading ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : (
              <>
                <Hand className="w-5 h-5" /> 
                <span>Tap to Explain</span>
              </>
            )}
          </button>
        </div>
      </div>

      {content && (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-indigo-600 mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6" /> Simple Explanation
            </h3>
            <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line font-medium">
              {content.explanation}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-emerald-600 mb-6 flex items-center gap-3">
                <ListChecks className="w-6 h-6" /> Step-by-Step Breakdown
              </h3>
              <div className="space-y-4">
                {(content.steps || []).map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold shrink-0 shadow-sm">{idx + 1}</span>
                    <p className="text-slate-700 pt-1 font-semibold">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-900 p-8 rounded-3xl shadow-lg text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-sky-400" /> Visual Mental Model
              </h3>
              <div className="bg-indigo-800/50 p-6 rounded-2xl border border-indigo-700">
                <p className="text-indigo-100 leading-relaxed text-sm italic font-medium">
                  "{content.visualDescription}"
                </p>
              </div>
              <p className="mt-4 text-xs text-indigo-300 uppercase tracking-widest font-bold">Try sketching this diagram</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 shadow-sm">
              <h3 className="text-xl font-bold text-amber-700 mb-4 flex items-center gap-3">
                <Lightbulb className="w-6 h-6" /> Practical Examples
              </h3>
              <ul className="space-y-3">
                {(content.examples || []).map((ex, i) => (
                  <li key={i} className="flex gap-3 items-start text-amber-800 font-semibold">
                    <span className="text-amber-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span> {ex}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-3xl shadow-sm text-white flex flex-col justify-center border-l-8 border-indigo-500">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-indigo-400 uppercase tracking-widest">
                <CheckCircle className="w-6 h-6" /> Quick Summary
              </h3>
              <p className="text-slate-300 text-lg italic leading-relaxed font-medium">
                {content.summary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningHelper;
