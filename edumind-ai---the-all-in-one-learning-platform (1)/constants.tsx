
import React from 'react';
import { 
  BookOpen, 
  Brain, 
  Calendar, 
  FileText, 
  LayoutDashboard, 
  Settings, 
  HelpCircle,
  GraduationCap,
  Download,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Plus,
  ArrowRight
} from 'lucide-react';

export const LANGUAGES = [
  'English', 'Hindi', 'Urdu', 'Spanish', 'French', 'German', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Punjabi'
];

export const SYLLABUSES = [
  'Punjab Board (Pakistan)',
  'BISE Bahawalpur (BWP)',
  'BISE Lahore',
  'BISE Multan',
  'Sindh Board',
  'KPK Board',
  'CBSE (India)',
  'ICSE (India)',
  'NCERT (National)',
  'State Board (MAH)',
  'State Board (UP)',
  'State Board (Bihar)',
  'University Standard',
  'UPSC',
  'JEE/NEET',
  'Custom/Other'
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'quiz', label: 'AI Quiz Gen', icon: Brain },
  { id: 'test', label: 'AI Test Gen', icon: FileText },
  { id: 'planner', label: 'Study Planner', icon: Calendar },
  { id: 'helper', label: 'Learning Helper', icon: BookOpen },
  { id: 'settings', label: 'Profile Settings', icon: Settings },
];

export const COLORS = {
  primary: '#4f46e5', // indigo-600
  secondary: '#0ea5e9', // sky-500
  accent: '#f59e0b', // amber-500
};
