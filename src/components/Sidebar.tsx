import React, { useState } from 'react';
import { Users, Circle, CheckCircle2, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  people: string[];
  selectedPeople: string[];
  togglePerson: (person: string) => void;
  onAddPerson: (person: string) => void;
  onRemovePerson: (person: string) => void;
  onToggleAll: (selectAll: boolean) => void;
  isAllSelected: boolean;
  activeUsersCount?: number;
}

export function Sidebar({ 
  people, 
  selectedPeople, 
  togglePerson, 
  onAddPerson, 
  onRemovePerson, 
  onToggleAll,
  isAllSelected,
  activeUsersCount = 1 
}: SidebarProps) {
  const [newPerson, setNewPerson] = useState('');

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPerson.trim()) {
      onAddPerson(newPerson.trim());
      setNewPerson('');
    }
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50/50 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
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

      <div className="p-6 flex-1 overflow-y-auto">
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
      </div>
      
      <div className="p-6 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          Anyone with the link can edit.
        </p>
      </div>
    </aside>
  );
}
