import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Category, ScheduleEvent } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<ScheduleEvent, 'id'>, recurringWeeks?: number) => void;
  onDelete?: (id: string) => void;
  initialData?: ScheduleEvent | null;
  selectedDate?: string;
  selectedTime?: string;
  teamMembers: string[];
  students: string[];
}

const CATEGORIES: Category[] = ['Class', 'Client Meeting', 'Deep Work', 'Other'];

export function EventModal({ isOpen, onClose, onSave, onDelete, initialData, selectedDate, selectedTime, teamMembers, students }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState<Category>('Deep Work');
  const [person, setPerson] = useState('');
  const [student, setStudent] = useState('');
  const [description, setDescription] = useState('');
  
  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(12); // Default 3 months (12 weeks)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDate(initialData.date);
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
        setCategory(initialData.category);
        setPerson(initialData.person);
        setStudent(initialData.student || '');
        setDescription(initialData.description || '');
        setIsRecurring(false); // Can't make an existing event recurring
      } else {
        setTitle('');
        setDate(selectedDate || new Date().toISOString().split('T')[0]);
        setStartTime(selectedTime || '09:00');
        
        // Auto-set end time to 1 hour later
        if (selectedTime) {
          const [h, m] = selectedTime.split(':').map(Number);
          const endH = (h + 1).toString().padStart(2, '0');
          setEndTime(`${endH}:${m.toString().padStart(2, '0')}`);
        } else {
          setEndTime('10:00');
        }
        
        setCategory('Deep Work');
        setPerson(teamMembers.length > 0 ? teamMembers[0] : '');
        setStudent('');
        setDescription('');
        setIsRecurring(false);
        setRecurringWeeks(12);
      }
    }
  }, [isOpen, initialData, selectedDate, selectedTime, teamMembers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime || !person) return;
    
    onSave({
      title,
      date,
      startTime,
      endTime,
      category,
      person,
      student: category === 'Class' ? student : undefined,
      description
    }, isRecurring ? recurringWeeks : undefined);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {initialData ? 'Edit Event' : 'New Event'}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Design Sync"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Person</label>
                <select
                  required
                  value={person}
                  onChange={e => setPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow bg-white"
                >
                  <option value="" disabled>Select person</option>
                  {teamMembers.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  {!teamMembers.includes(person) && person && (
                    <option value={person}>{person}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow bg-white"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {category === 'Class' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={student}
                  onChange={e => setStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow bg-white"
                >
                  <option value="">Select student</option>
                  {students.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Add students in the sidebar if not listed.</p>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {!initialData && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={isRecurring}
                    onChange={e => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Repeat weekly
                  </label>
                </div>
                
                {isRecurring && (
                  <div className="pl-6 flex items-center gap-2">
                    <span className="text-sm text-gray-500">For</span>
                    <select
                      value={recurringWeeks}
                      onChange={e => setRecurringWeeks(Number(e.target.value))}
                      className="px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                    >
                      <option value={4}>4 weeks (1 month)</option>
                      <option value={8}>8 weeks (2 months)</option>
                      <option value={12}>12 weeks (3 months)</option>
                      <option value={24}>24 weeks (6 months)</option>
                      <option value={52}>52 weeks (1 year)</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow resize-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
              {initialData && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(initialData.id);
                    onClose();
                  }}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              ) : (
                <div /> // Spacer
              )}
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg shadow-sm transition-colors"
                >
                  Save Event
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
