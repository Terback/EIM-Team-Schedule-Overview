import React, { useState } from 'react';
import { Users, Circle, CheckCircle2, Plus, X, Calendar, GraduationCap, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { ScheduleEvent } from '../types';
import { motion } from 'motion/react';

interface SidebarProps {
  people: string[];
  selectedPeople: string[];
  togglePerson: (person: string) => void;
  onAddPerson: (person: string) => void;
  onRemovePerson: (person: string) => void;
  onToggleAll: (selectAll: boolean) => void;
  isAllSelected: boolean;
  activeUsersCount?: number;
  onClose?: () => void;
  students: string[];
  onAddStudent: (name: string) => void;
  onRemoveStudent: (name: string) => void;
  events: ScheduleEvent[];
}

export function Sidebar({ 
  people, 
  selectedPeople, 
  togglePerson, 
  onAddPerson, 
  onRemovePerson, 
  onToggleAll,
  isAllSelected,
  activeUsersCount = 1,
  onClose,
  students,
  onAddStudent,
  onRemoveStudent,
  events
}: SidebarProps) {
  const [newPerson, setNewPerson] = useState('');
  const [newStudent, setNewStudent] = useState('');
  const [activeTab, setActiveTab] = useState<'team' | 'students' | 'stats'>('team');

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPerson.trim()) {
      onAddPerson(newPerson.trim());
      setNewPerson('');
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent.trim()) {
      onAddStudent(newStudent.trim());
      setNewStudent('');
    }
  };

  const calculateStudentHours = () => {
    const stats: Record<string, number> = {};
    students.forEach(s => stats[s] = 0);

    events.forEach(event => {
      if (event.category === 'Class' && event.student && students.includes(event.student)) {
        const [startH, startM] = event.startTime.split(':').map(Number);
        const [endH, endM] = event.endTime.split(':').map(Number);
        const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
        stats[event.student] += durationHours;
      }
    });

    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  };

  const studentStats = calculateStudentHours();

  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50/50 h-full flex flex-col shadow-xl lg:shadow-none">
      <div className="p-6 border-b border-gray-200 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-6 p-1 text-gray-400 hover:text-gray-900 lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-3">
          <img 
            src="https://github.com/Terback/Images/blob/main/logo/logo%20color%20palette-website-01.png?raw=true" 
            alt="Company Logo" 
            className="h-8 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Users className="w-3 h-3 ml-1" />
          {activeUsersCount} {activeUsersCount === 1 ? 'person' : 'people'} viewing
        </p>
      </div>

      <div className="flex border-b border-gray-200 bg-white/50">
        <button
          onClick={() => setActiveTab('team')}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-semibold transition-all border-b-2",
            activeTab === 'team' ? "border-gray-900 text-gray-900 bg-white" : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          <Users className="w-4 h-4" />
          TEAM
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-semibold transition-all border-b-2",
            activeTab === 'students' ? "border-gray-900 text-gray-900 bg-white" : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          <GraduationCap className="w-4 h-4" />
          STUDENTS
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-1 text-[10px] font-semibold transition-all border-b-2",
            activeTab === 'stats' ? "border-gray-900 text-gray-900 bg-white" : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          <BarChart3 className="w-4 h-4" />
          STATS
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'team' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Team Members
              </h2>
              {people.length > 0 && (
                <button
                  onClick={() => onToggleAll(!isAllSelected)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {isAllSelected ? 'Clear All' : 'Select All'}
                </button>
              )}
            </div>
            
            <div className="space-y-1 mb-6">
              {people.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No team members yet.</p>
              ) : (
                people.map(person => {
                  const isSelected = selectedPeople.includes(person);
                  return (
                    <div
                      key={person}
                      className={cn(
                        "group w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                        isSelected 
                          ? "bg-white shadow-sm border border-gray-200 text-gray-900 font-medium" 
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <button
                        onClick={() => togglePerson(person)}
                        className="flex-1 flex items-center gap-2 overflow-hidden text-left"
                      >
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-gray-900 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <span className="truncate">{person}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemovePerson(person);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded-md hover:bg-red-50"
                        title={`Remove ${person}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleAddPerson} className="relative">
              <input
                type="text"
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                placeholder="Add person..."
                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
              />
              <button 
                type="submit"
                disabled={!newPerson.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        {activeTab === 'students' && (
          <>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Students
            </h2>
            <div className="space-y-1 mb-6">
              {students.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No students yet.</p>
              ) : (
                students.map(student => (
                  <div
                    key={student}
                    className="group w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">
                        {student.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{student}</span>
                    </div>
                    <button
                      onClick={() => onRemoveStudent(student)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded-md hover:bg-red-50"
                      title={`Remove ${student}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddStudent} className="relative">
              <input
                type="text"
                value={newStudent}
                onChange={(e) => setNewStudent(e.target.value)}
                placeholder="Add student..."
                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
              />
              <button 
                type="submit"
                disabled={!newStudent.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        {activeTab === 'stats' && (
          <>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Class Hours
            </h2>
            <div className="space-y-4">
              {studentStats.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No class data yet.</p>
              ) : (
                studentStats.map(([name, hours]) => (
                  <div key={name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-700">{name}</span>
                      <span className="text-gray-900 font-bold">{hours.toFixed(1)}h</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((hours / 40) * 100, 100)}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-6 leading-relaxed">
              * Statistics are calculated based on all events in the "Class" category assigned to a student.
            </p>
          </>
        )}
      </div>
      
      <div className="p-6 border-t border-gray-200">
        <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
          Schedule v2.0
        </p>
      </div>
    </aside>
  );
}
