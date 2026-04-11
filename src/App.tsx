/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CalendarGrid } from './components/CalendarGrid';
import { EventModal } from './components/EventModal';
import { useSchedule } from './hooks/useSchedule';
import { ScheduleEvent } from './types';
import { cn } from './lib/utils';
import { format, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, LogOut, Menu } from 'lucide-react';
import { signInWithGoogle, logOut } from './firebase';

export default function App() {
  const { 
    events, 
    teamMembers, 
    students,
    addEvent, 
    addRecurringEvents, 
    updateEvent, 
    deleteEvent, 
    addTeamMember, 
    removeTeamMember, 
    addStudent,
    removeStudent,
    isLoaded, 
    userId 
  } = useSchedule();
  
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // For clicking empty slots
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const isAllSelected = teamMembers.length > 0 && teamMembers.every(p => selectedPeople.includes(p));

  const handleTogglePerson = (person: string) => {
    setSelectedPeople(prev => 
      prev.includes(person) 
        ? prev.filter(p => p !== person)
        : [...prev, person]
    );
  };

  const handleToggleAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedPeople([...teamMembers]);
    } else {
      setSelectedPeople([]);
    }
  };

  const handleSlotClick = (date: string, time?: string) => {
    setEditingEvent(null);
    setSelectedDate(date);
    setSelectedTime(time || '');
    setIsModalOpen(true);
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleEventDrop = (eventId: string, newDate: string, newStartTime?: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    if (newStartTime) {
      // Calculate new end time based on original duration
      const [startH, startM] = event.startTime.split(':').map(Number);
      const [endH, endM] = event.endTime.split(':').map(Number);
      
      const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      
      const [newStartH, newStartM] = newStartTime.split(':').map(Number);
      const newEndMinutes = newStartH * 60 + newStartM + durationMinutes;
      
      const newEndH = Math.floor(newEndMinutes / 60).toString().padStart(2, '0');
      const newEndM = (newEndMinutes % 60).toString().padStart(2, '0');
      const newEndTime = `${newEndH}:${newEndM}`;

      updateEvent(eventId, {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime
      });
    } else {
      // Monthly view drop - just update the date
      updateEvent(eventId, { date: newDate });
    }
  };

  const handleSaveEvent = (eventData: Omit<ScheduleEvent, 'id'>, recurringWeeks?: number) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      if (recurringWeeks && recurringWeeks > 1) {
        addRecurringEvents(eventData, recurringWeeks);
      } else {
        addEvent(eventData);
      }
    }
  };

  const handlePrev = () => {
    setCurrentDate(prev => viewMode === 'weekly' ? subWeeks(prev, 1) : subMonths(prev, 1));
  };

  const handleNext = () => {
    setCurrentDate(prev => viewMode === 'weekly' ? addWeeks(prev, 1) : addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <img 
            src="https://github.com/Terback/Images/blob/main/logo/logo%20color%20palette-website-01.png?raw=true" 
            alt="Company Logo" 
            className="h-12 w-auto mx-auto mb-6 object-contain"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Schedule</h1>
          <p className="text-gray-500 mb-8">Sign in to collaborate and view the team schedule.</p>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          people={teamMembers}
          selectedPeople={selectedPeople}
          togglePerson={handleTogglePerson}
          onAddPerson={addTeamMember}
          onRemovePerson={removeTeamMember}
          onToggleAll={handleToggleAll}
          isAllSelected={isAllSelected}
          activeUsersCount={Math.floor(Math.random() * 3) + 1} // Mock active users
          onClose={() => setIsSidebarOpen(false)}
          students={students}
          onAddStudent={addStudent}
          onRemoveStudent={removeStudent}
          events={events}
        />
      </div>
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-auto min-h-[4rem] border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between px-4 py-3 sm:py-0 sm:px-6 bg-white shrink-0 gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 sm:gap-4">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 min-w-[100px] sm:w-40 truncate">
                {format(currentDate, 'MMM yyyy')}
              </h2>
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                <button 
                  onClick={handlePrev}
                  className="p-1 text-gray-500 hover:text-gray-900 hover:bg-white rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleToday}
                  className="px-2 py-1 text-[10px] sm:text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                >
                  Today
                </button>
                <button 
                  onClick={handleNext}
                  className="p-1 text-gray-500 hover:text-gray-900 hover:bg-white rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('weekly')}
                className={cn(
                  "px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors",
                  viewMode === 'weekly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={cn(
                  "px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors",
                  viewMode === 'monthly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Monthly
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setSelectedDate('');
                  setSelectedTime('');
                  setIsModalOpen(true);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
              >
                Add Event
              </button>
              <button
                onClick={logOut}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </header>
        
        <CalendarGrid 
          events={events}
          selectedPeople={selectedPeople}
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
          viewMode={viewMode}
          currentDate={currentDate}
        />
      </main>

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={deleteEvent}
        initialData={editingEvent}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        teamMembers={teamMembers}
        students={students}
      />
    </div>
  );
}

