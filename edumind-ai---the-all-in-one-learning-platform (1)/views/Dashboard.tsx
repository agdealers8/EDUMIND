
import React, { useMemo, useState, useEffect } from 'react';
import { UserProfile, UserActivity, ResourceLink } from '../types';
import { geminiService } from '../services/gemini';
import { 
  ArrowRight, Brain, FileText, Calendar, BookOpen, Clock, 
  TrendingUp, Award, ExternalLink, Globe, Loader2, 
  Sparkles, RefreshCw, AlertTriangle, History as HistoryIcon,
  ChevronRight, ClipboardList
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  onNav: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, onNav }) => {
  const activities = profile?.activities || [];
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceError, setResourceError] = useState<string | null>(null);

  const fetchBoardResources = async () => {
    if (!profile?.board) return;
    setLoadingResources(true);
    setResourceError(null);
    try {
      const links = await geminiService.getPastPaperLinks(profile);
      setResources(Array.isArray(links) ? links : []);
    } catch (err: any) {
      console.error("Failed to fetch past papers", err);
      setResourceError("Unable to fetch board resources at the moment.");
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    fetchBoardResources();
  }, [profile?.board, profile?.grade, profile?.syllabus]);

  const stats = useMemo(() => {
    const testsTaken = activities.filter(a => a?.type === 'test').length;
    const quizzesTaken = activities.filter(a => a?.type === 'quiz').length;
    const conceptsLearned = activities.filter(a => a?.type === 'helper').length;
    const studyHours = (activities.length * 0.5).toFixed(1);

    return [
      { label: 'Study Hours', value: studyHours, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Assessments', value: (testsTaken + quizzesTaken).toString().padStart(2, '0'), icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Concepts', value: conceptsLearned.toString().padStart(2, '0'), icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Growth', value: activities.length > 5 ? '+12%' : 'Active', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];
  }, [activities]);

  const recentActivities = [...activities].reverse().slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Hi, {profile?.name || 'Student'}! 👋</h1>
          <p className="text-slate-500 mt-1 font-medium">
            {activities.length > 0 
              ? `You've successfully completed ${activities.length} AI-guided sessions.` 
              : "Let's kickstart your learning journey today!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex flex-col items-end">
             <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-wider mb-1">
               {profile?.board || 'Standard'}
             </span>
             <span className="text-xs font-bold text-slate-400">Grade: {profile?.grade || 'N/A'}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
              <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* History System */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-indigo-600" /> Learning History
              </h3>
              <button onClick={() => onNav('dashboard')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              {activities.length > 0 ? (
                [...activities].reverse().map((activity) => (
                  <div 
                    key={activity.id} 
                    onClick={() => onNav(activity.type)}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                      activity.type === 'quiz' ? 'bg-amber-100 text-amber-600' :
                      activity.type === 'test' ? 'bg-sky-100 text-sky-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      {activity.type === 'quiz' ? <Brain className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700">{activity.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(activity.timestamp).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase">{activity.type}</span>
                        {activity.metadata?.difficulty && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">{activity.metadata.difficulty}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HistoryIcon className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Your activity history will appear here.</p>
                </div>
              )}
            </div>
          </section>

          {/* Official Resources */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Globe className="text-sky-500 w-5 h-5" /> Board Resources
              </h3>
              {loadingResources && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
            </div>

            {loadingResources ? (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Searching Archive...</p>
              </div>
            ) : resourceError ? (
              <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-red-600 mb-4">{resourceError}</p>
                <button onClick={fetchBoardResources} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors">
                  Retry Search
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {Array.isArray(resources) && resources.length > 0 ? resources.map((res, i) => (
                  <a 
                    key={i} 
                    href={res.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs mb-1 group-hover:text-indigo-600 line-clamp-1">{res.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium line-clamp-2">{res.description || 'Access official board materials.'}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Official Source</span>
                       <ExternalLink className="w-3 h-3 text-indigo-400" />
                    </div>
                  </a>
                )) : (
                  <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                    <p className="text-sm font-bold text-slate-400">No resources found for your current profile.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-6 rounded-3xl shadow-xl text-white">
            <Sparkles className="w-10 h-10 text-indigo-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Prep Suggestion</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6 font-medium">
              We noticed you're studying for {profile?.board}. Try a focused {profile?.language} quiz to boost your confidence!
            </p>
            <button 
              onClick={() => onNav('quiz')}
              className="w-full py-3 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-lg"
            >
              Start Practice Now
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-emerald-500" /> Quick Actions
             </h4>
             <div className="grid grid-cols-1 gap-3">
               <button onClick={() => onNav('planner')} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all group">
                 <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-indigo-600"><Calendar className="w-4 h-4" /></div>
                 <span className="text-xs font-bold text-slate-600">Plan Study Week</span>
               </button>
               <button onClick={() => onNav('helper')} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all group">
                 <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-amber-600"><BookOpen className="w-4 h-4" /></div>
                 <span className="text-xs font-bold text-slate-600">Explain Concepts</span>
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
