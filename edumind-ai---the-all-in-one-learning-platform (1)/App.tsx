
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS, LANGUAGES, SYLLABUSES } from './constants';
import { UserProfile, EducationLevel, UserActivity } from './types';
import Dashboard from './views/Dashboard';
import QuizGenerator from './views/QuizGenerator';
import TestGenerator from './views/TestGenerator';
import StudyPlanner from './views/StudyPlanner';
import LearningHelper from './views/LearningHelper';
import ProfileSettings from './views/Settings';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { geminiService } from './services/gemini';
import { GraduationCap, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    level: 'School',
    language: 'English',
    syllabus: 'CBSE (India)',
    grade: '',
    board: '',
    subjects: [],
    activities: []
  });
  const [showWelcome, setShowWelcome] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('edumind_profile_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure activities and subjects arrays exist to prevent mapping errors
        setUserProfile({
          ...parsed,
          activities: Array.isArray(parsed.activities) ? parsed.activities : [],
          subjects: Array.isArray(parsed.subjects) ? parsed.subjects : []
        });
        setShowWelcome(false);
      } catch (e) {
        console.error("Error parsing profile", e);
      }
    }
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleStart = async () => {
    if (!userProfile.name.trim()) {
      setError("Please enter your name.");
      triggerShake();
      return;
    }

    const effectiveBoard = userProfile.syllabus === 'Custom/Other' 
      ? userProfile.board?.trim() 
      : userProfile.syllabus;

    if (!effectiveBoard) {
      setError("Please specify your Board/Syllabus name.");
      triggerShake();
      return;
    }

    if (!userProfile.grade?.trim()) {
      setError("Please specify your Class/Grade.");
      triggerShake();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const validation = await geminiService.validateProfile({
        level: userProfile.level,
        board: effectiveBoard,
        grade: userProfile.grade || ''
      });

      if (!validation.isValid) {
        setError(validation.message || "The information provided seems incorrect.");
        triggerShake();
        setLoading(false);
        return;
      }

      saveProfile({ ...userProfile, board: effectiveBoard });
    } catch (err) {
      saveProfile({ ...userProfile, board: effectiveBoard });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = (profile: UserProfile) => {
    const updatedProfile = {
      ...profile,
      activities: Array.isArray(profile.activities) ? profile.activities : [],
      subjects: Array.isArray(profile.subjects) ? profile.subjects : []
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('edumind_profile_v2', JSON.stringify(updatedProfile));
    setShowWelcome(false);
  };

  const logActivity = (partialActivity: Omit<UserActivity, 'id' | 'timestamp'>) => {
    const newActivity: UserActivity = {
      ...partialActivity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    const updatedProfile = {
      ...userProfile,
      activities: [...(userProfile.activities || []), newActivity]
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('edumind_profile_v2', JSON.stringify(updatedProfile));
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
        <div className={`bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in duration-300 ${shake ? 'animate-shake' : ''}`}>
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="text-indigo-600 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EduMind AI</h1>
          <p className="text-gray-500 mb-8 font-semibold">Ready to master your studies?</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-left animate-in fade-in zoom-in-95">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="text-sm font-bold">{error}</div>
            </div>
          )}

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${!userProfile.name.trim() && error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                placeholder="Enter your name"
                value={userProfile.name}
                onChange={(e) => { setUserProfile({...userProfile, name: e.target.value}); if(error) setError(null); }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Level</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                  value={userProfile.level}
                  onChange={(e) => setUserProfile({...userProfile, level: e.target.value as EducationLevel})}
                >
                  <option value="School">School</option>
                  <option value="College">College</option>
                  <option value="Competitive Exams">Competitive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Grade</label>
                <input 
                  type="text" 
                  placeholder="e.g. 10th"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm ${!userProfile.grade?.trim() && error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  value={userProfile.grade}
                  onChange={(e) => { setUserProfile({...userProfile, grade: e.target.value}); if(error) setError(null); }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Syllabus / Board</label>
              <select 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                value={userProfile.syllabus}
                onChange={(e) => {
                  const val = e.target.value;
                  setUserProfile({...userProfile, syllabus: val, board: val === 'Custom/Other' ? '' : val});
                  if(error) setError(null);
                }}
              >
                {SYLLABUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {userProfile.syllabus === 'Custom/Other' && (
                <div className="mt-3 animate-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">Type Custom Board Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cambridge, Oxford, Local Board..."
                    className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50/30 text-sm"
                    value={userProfile.board}
                    onChange={(e) => setUserProfile({...userProfile, board: e.target.value})}
                  />
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleStart}
            disabled={loading}
            className={`w-full mt-8 text-white py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
          >
            {loading ? <><Loader2 className="animate-spin w-5 h-5" /> Setting Up...</> : <><Sparkles className="w-5 h-5" /> Start Learning</>}
          </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard profile={userProfile} onNav={setActiveTab} />;
      case 'quiz': return <QuizGenerator profile={userProfile} logActivity={logActivity} />;
      case 'test': return <TestGenerator profile={userProfile} logActivity={logActivity} />;
      case 'planner': return <StudyPlanner profile={userProfile} />;
      case 'helper': return <LearningHelper profile={userProfile} logActivity={logActivity} />;
      case 'settings': return <ProfileSettings profile={userProfile} onSave={saveProfile} />;
      default: return <Dashboard profile={userProfile} onNav={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} profile={userProfile} />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
