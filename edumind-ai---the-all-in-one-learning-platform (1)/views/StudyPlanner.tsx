
import React, { useState } from 'react';
import { UserProfile, DailySchedule } from '../types';
import { geminiService } from '../services/gemini';
import { Calendar, Loader2, Sparkles, Clock, Target, CheckCircle } from 'lucide-react';

const StudyPlanner: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<DailySchedule[] | null>(null);
  const [form, setForm] = useState({
    freeHours: 4,
    targetSyllabus: profile.syllabus,
    examDate: '',
    intensity: 'Medium' as 'Low' | 'Medium' | 'High'
  });

  const generate = async () => {
    setLoading(true);
    try {
      const data = await geminiService.generateStudyPlan({
        userProfile: profile,
        ...form
      });
      setSchedule(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {!schedule ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center max-w-2xl mx-auto">
          <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="text-emerald-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">AI Smart Study Planner</h2>
          <p className="text-slate-500 mb-8">Tell us your goals, and we'll create the perfect balance of study, revision, and rest.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Free Hours Per Day</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number" 
                  className="w-full pl-10 pr-4 py-2 border rounded-xl"
                  value={form.freeHours}
                  onChange={e => setForm({...form, freeHours: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Exam Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 border rounded-xl"
                onChange={e => setForm({...form, examDate: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Study Intensity</label>
              <div className="grid grid-cols-3 gap-3">
                {['Low', 'Medium', 'High'].map(level => (
                  <button
                    key={level}
                    onClick={() => setForm({...form, intensity: level as any})}
                    className={`py-2 px-4 rounded-xl text-sm font-semibold transition-all ${
                      form.intensity === level 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={generate}
            disabled={loading || !form.examDate}
            className="w-full mt-8 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin w-5 h-5" /> Orchestrating Schedule...</> : <><Sparkles className="w-5 h-5" /> Generate My Weekly Plan</>}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Your Study Masterplan</h2>
              <p className="text-slate-500">Customized for {profile.name} • {form.intensity} Intensity</p>
            </div>
            <button 
              onClick={() => setSchedule(null)}
              className="text-slate-500 hover:text-indigo-600 font-medium"
            >
              Adjust Parameters
            </button>
          </div>

          <div className="grid gap-6">
            {(schedule || []).map((day, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" /> {day.day}
                  </h3>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {(day.sessions || []).length} Sessions
                  </span>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                        <th className="px-6 py-3 border-b border-slate-100">Time</th>
                        <th className="px-6 py-3 border-b border-slate-100">Subject / Topic</th>
                        <th className="px-6 py-3 border-b border-slate-100">Activity</th>
                        <th className="px-6 py-3 border-b border-slate-100 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(day.sessions || []).map((session, sidx) => (
                        <tr key={sidx} className="hover:bg-indigo-50/30 transition-colors border-b border-slate-100 last:border-0">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">{session.time}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-800">{session.subject}</p>
                            <p className="text-xs text-slate-500">{session.topic}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                              session.activity.toLowerCase().includes('break') ? 'bg-amber-100 text-amber-700' : 
                              session.activity.toLowerCase().includes('revision') ? 'bg-emerald-100 text-emerald-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {session.activity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-1.5 rounded-full hover:bg-slate-200 text-slate-300">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
