
import React, { useState } from 'react';
import { UserProfile, EducationLevel } from '../types';
import { SYLLABUSES, LANGUAGES } from '../constants';
import { Settings, User, Book, Globe, Save, CheckCircle2, Layout, AlertCircle } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
}

const ProfileSettings: React.FC<Props> = ({ profile, onSave }) => {
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!form.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    if (!form.grade.trim()) {
      setError("Please specify your current class or grade.");
      return;
    }
    if (form.syllabus === 'Custom/Other' && !form.board?.trim()) {
      setError("Please type your custom board name.");
      return;
    }

    onSave(form);
    setSaved(true);
    setError(null);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-600 p-10 text-white relative">
        <h2 className="text-3xl font-bold mb-2">Profile Personalization</h2>
        <p className="text-indigo-100 font-medium">Tailor your AI Tutor to your specific Board and level.</p>
        <div className="absolute -bottom-6 right-10 w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center text-indigo-600">
           <Settings className="w-10 h-10" />
        </div>
      </div>

      <div className="p-10 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 animate-in fade-in zoom-in-95">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-sm font-bold">{error}</div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <User className="text-slate-400 w-6 h-6" />
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Full Name *</label>
              <input 
                type="text" 
                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all ${!form.name.trim() && error ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}
                value={form.name}
                onChange={e => { setForm({...form, name: e.target.value}); if(error) setError(null); }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <Layout className="text-slate-400 w-6 h-6" />
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Board / Curriculum *</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.syllabus}
                onChange={e => setForm({...form, syllabus: e.target.value, board: e.target.value})}
              >
                {SYLLABUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {form.syllabus === 'Custom/Other' && (
                <input 
                  type="text"
                  placeholder="Type your board name here"
                  className={`w-full mt-2 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 ${!form.board?.trim() && error ? 'border-red-300' : 'border-slate-200'}`}
                  value={form.board}
                  onChange={e => { setForm({...form, board: e.target.value}); if(error) setError(null); }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-4">
              <Book className="text-slate-400 w-6 h-6" />
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">Class / Grade *</label>
                <input 
                  type="text"
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all ${!form.grade.trim() && error ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}
                  value={form.grade}
                  onChange={e => { setForm({...form, grade: e.target.value}); if(error) setError(null); }}
                  placeholder="e.g. 10th, 12th"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Globe className="text-slate-400 w-6 h-6" />
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">Preferred Language</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.language}
                  onChange={e => setForm({...form, language: e.target.value})}
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
            saved ? 'bg-emerald-500 text-white shadow-lg scale-[1.02]' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95'
          }`}
        >
          {saved ? <><CheckCircle2 className="w-6 h-6" /> Settings Saved!</> : <><Save className="w-6 h-6" /> Update Dashboard Resources</>}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
