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
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const { events, teamMembers, addEvent, updateEvent, deleteEvent, addTeamMember, removeTeamMember, isLoaded } = useSchedule();
  
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleSaveEvent = (eventData: Omit<ScheduleEvent, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
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

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
      <Sidebar 
        people={teamMembers}
        selectedPeople={selectedPeople}
        togglePerson={handleTogglePerson}
        onAddPerson={addTeamMember}
        onRemovePerson={removeTeamMember}
        onToggleAll={handleToggleAll}
        isAllSelected={isAllSelected}
        activeUsersCount={Math.floor(Math.random() * 3) + 1} // Mock active users
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium text-gray-900 w-40">
                {format(currentDate, 'MMMM yyyy')}
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
                  className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
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
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('weekly')}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  viewMode === 'weekly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  viewMode === 'monthly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Monthly
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingEvent(null);
              setSelectedDate('');
              setSelectedTime('');
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            Add Event
          </button>
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
      />
    </div>
  );
}

