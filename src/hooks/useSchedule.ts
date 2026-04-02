import { useState, useEffect, useCallback } from 'react';
import { ScheduleEvent } from '../types';

const INITIAL_TEAM = ['Terrence', 'Ming', 'Xavier', 'Marco', 'Lily', 'Daniel'];

// Mock initial data
const INITIAL_EVENTS: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Design Sync',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:30',
    category: 'Class',
    person: 'Terrence',
  },
  {
    id: '2',
    title: 'Client Review',
    date: new Date().toISOString().split('T')[0],
    startTime: '11:00',
    endTime: '12:00',
    category: 'Client Meeting',
    person: 'Ming',
  },
  {
    id: '3',
    title: 'Architecture Planning',
    date: new Date().toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '15:00',
    category: 'Deep Work',
    person: 'Xavier',
  }
];

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedEvents = localStorage.getItem('ghost-schedule-events');
    const storedTeam = localStorage.getItem('ghost-schedule-team');
    
    if (storedEvents) {
      try {
        setEvents(JSON.parse(storedEvents));
      } catch (e) {
        console.error("Failed to parse stored events", e);
        setEvents(INITIAL_EVENTS);
      }
    } else {
      setEvents(INITIAL_EVENTS);
    }

    if (storedTeam) {
      try {
        setTeamMembers(JSON.parse(storedTeam));
      } catch (e) {
        setTeamMembers(INITIAL_TEAM);
      }
    } else {
      setTeamMembers(INITIAL_TEAM);
    }
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ghost-schedule-events', JSON.stringify(events));
      localStorage.setItem('ghost-schedule-team', JSON.stringify(teamMembers));
    }
  }, [events, teamMembers, isLoaded]);

  const addEvent = useCallback((event: Omit<ScheduleEvent, 'id'>) => {
    const newEvent = { ...event, id: crypto.randomUUID() };
    setEvents(prev => [...prev, newEvent]);
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<ScheduleEvent>) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, ...updates } : ev));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(ev => ev.id !== id));
  }, []);

  const addTeamMember = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed && !teamMembers.includes(trimmed)) {
      setTeamMembers(prev => [...prev, trimmed]);
    }
  }, [teamMembers]);

  const removeTeamMember = useCallback((name: string) => {
    setTeamMembers(prev => prev.filter(member => member !== name));
  }, []);

  return {
    events,
    teamMembers,
    addEvent,
    updateEvent,
    deleteEvent,
    addTeamMember,
    removeTeamMember,
    isLoaded
  };
}
