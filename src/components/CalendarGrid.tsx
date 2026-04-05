import React, { useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ScheduleEvent, CATEGORY_COLORS } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface CalendarGridProps {
  events: ScheduleEvent[];
  onSlotClick: (date: string, time?: string) => void;
  onEventClick: (event: ScheduleEvent) => void;
  onEventDrop: (eventId: string, newDate: string, newStartTime?: string) => void;
  selectedPeople: string[];
  viewMode: 'weekly' | 'monthly';
  currentDate: Date;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

function getEventMinutes(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function doesOverlap(a: ScheduleEvent, b: ScheduleEvent) {
  return getEventMinutes(a.startTime) < getEventMinutes(b.endTime) && 
         getEventMinutes(a.endTime) > getEventMinutes(b.startTime);
}

export function CalendarGrid({ events, onSlotClick, onEventClick, onEventDrop, selectedPeople, viewMode, currentDate }: CalendarGridProps) {
  // Filter events based on selected people
  const visibleEvents = useMemo(() => {
    if (selectedPeople.length === 0) return events;
    return events.filter(e => selectedPeople.includes(e.person));
  }, [events, selectedPeople]);

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: string, hour?: number) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    if (!eventId) return;
    
    if (hour !== undefined) {
      const newStartTime = `${hour.toString().padStart(2, '0')}:00`;
      onEventDrop(eventId, date, newStartTime);
    } else {
      onEventDrop(eventId, date);
    }
  };

  if (viewMode === 'monthly') {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-white z-10 shrink-0">
          {weekDays.map(day => (
            <div key={day} className="py-2 text-center border-r border-gray-100 last:border-r-0">
              <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto overflow-x-hidden">
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayEvents = visibleEvents.filter(e => e.date === dateStr)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={i}
                className={cn(
                  "border-r border-b border-gray-100 p-0.5 sm:p-1 min-h-[80px] sm:min-h-[100px] flex flex-col transition-colors",
                  !isCurrentMonth && "bg-gray-50/50",
                  "hover:bg-gray-50/80 cursor-pointer"
                )}
                onClick={() => onSlotClick(dateStr)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr)}
              >
                <div className={cn(
                  "text-[10px] sm:text-xs font-medium p-0.5 sm:p-1 text-right flex justify-end",
                  isCurrentMonth ? "text-gray-700" : "text-gray-400"
                )}>
                  <span className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full",
                    isToday && "bg-emerald-500 text-white font-bold"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-0.5 sm:space-y-1 px-0.5 sm:px-1 custom-scrollbar">
                  {dayEvents.map(event => {
                    const colorClass = CATEGORY_COLORS[event.category] || CATEGORY_COLORS['Other'];
                    return (
                      <motion.div
                        key={event.id}
                        layoutId={event.id}
                        onClick={(e: any) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={cn(
                          "text-[8px] sm:text-[10px] p-0.5 sm:p-1 rounded border truncate cursor-grab active:cursor-grabbing",
                          colorClass
                        )}
                        title={`${event.startTime} - ${event.title} (${event.person})`}
                      >
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, event.id)}
                          onDragEnd={handleDragEnd}
                          className="w-full h-full"
                        >
                          <span className="hidden sm:inline font-semibold">{event.startTime}</span> {event.title}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Weekly View
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Helper to calculate top and height percentages, and now left/width for overlaps
  const getEventStyles = (event: ScheduleEvent, layout: { col: number, maxCols: number }) => {
    const startMinutes = getEventMinutes(event.startTime) - 8 * 60;
    const endMinutes = getEventMinutes(event.endTime) - 8 * 60;
    const durationMinutes = endMinutes - startMinutes;
    
    const totalMinutes = 12 * 60; // 8 AM to 8 PM = 12 hours
    
    const top = (startMinutes / totalMinutes) * 100;
    const height = (durationMinutes / totalMinutes) * 100;
    
    const width = 100 / layout.maxCols;
    const left = layout.col * width;
    
    return {
      top: `${Math.max(0, top)}%`,
      height: `${Math.max(5, height)}%`,
      left: `calc(${left}% + 2px)`,
      width: `calc(${width}% - 4px)`,
    };
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Scrollable Container */}
      <div className="flex-1 flex flex-col overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="min-w-[700px] flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="flex border-b border-gray-200 bg-white z-20 shrink-0 sticky top-0">
            <div className="w-12 sm:w-16 flex-shrink-0 border-r border-gray-200 bg-white" />
            {days.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div key={i} className="flex-1 py-2 sm:py-3 text-center border-r border-gray-100 last:border-r-0">
                  <div className={cn(
                    "text-[10px] sm:text-xs font-medium uppercase tracking-wider",
                    isToday ? "text-emerald-600 font-bold" : "text-gray-500"
                  )}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn(
                    "text-sm sm:text-lg mt-0.5 sm:mt-1 mx-auto w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full",
                    isToday ? "bg-emerald-500 text-white font-bold" : "text-gray-700"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto relative custom-scrollbar">
            <div className="flex min-h-[800px]">
              {/* Time labels */}
              <div className="w-12 sm:w-16 flex-shrink-0 border-r border-gray-200 bg-white sticky left-0 z-10">
                {HOURS.map(hour => (
                  <div 
                    key={hour} 
                    className="h-[60px] relative text-[10px] sm:text-xs text-gray-400 text-right pr-1 sm:pr-2 -mt-2.5 bg-white"
                  >
                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              <div className="flex-1 flex relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {HOURS.map(hour => (
                    <div 
                      key={hour} 
                      className="h-[60px] border-t border-gray-100 w-full"
                    />
                  ))}
                </div>

                {/* Columns */}
                {days.map((day, dayIdx) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayEvents = visibleEvents.filter(e => e.date === dateStr);
                  
                  // Calculate overlaps for side-by-side layout
                  const sortedEvents = [...dayEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));
                  const clusters: ScheduleEvent[][] = [];
                  let currentCluster: ScheduleEvent[] = [];
                  let clusterEnd = 0;

                  sortedEvents.forEach(event => {
                    const start = getEventMinutes(event.startTime);
                    const end = getEventMinutes(event.endTime);
                    
                    if (currentCluster.length === 0) {
                      currentCluster.push(event);
                      clusterEnd = end;
                    } else if (start < clusterEnd) {
                      currentCluster.push(event);
                      clusterEnd = Math.max(clusterEnd, end);
                    } else {
                      clusters.push(currentCluster);
                      currentCluster = [event];
                      clusterEnd = end;
                    }
                  });
                  if (currentCluster.length > 0) clusters.push(currentCluster);

                  const eventLayouts = new Map<string, { col: number, maxCols: number }>();
                  clusters.forEach(cluster => {
                    const columns: ScheduleEvent[][] = [];
                    cluster.forEach(event => {
                      let placed = false;
                      for (let i = 0; i < columns.length; i++) {
                        const lastEvent = columns[i][columns[i].length - 1];
                        if (!doesOverlap(lastEvent, event)) {
                          columns[i].push(event);
                          placed = true;
                          break;
                        }
                      }
                      if (!placed) {
                        columns.push([event]);
                      }
                    });
                    
                    const maxCols = columns.length;
                    columns.forEach((col, colIdx) => {
                      col.forEach(event => {
                        eventLayouts.set(event.id, { col: colIdx, maxCols });
                      });
                    });
                  });

                  return (
                    <div 
                      key={dayIdx} 
                      className="flex-1 relative border-r border-gray-100 last:border-r-0"
                    >
                      {/* Drop zones for each hour */}
                      {HOURS.map(hour => (
                        <div
                          key={hour}
                          className="h-[60px] w-full cursor-pointer hover:bg-gray-50/50 transition-colors"
                          onClick={() => onSlotClick(dateStr, `${hour.toString().padStart(2, '0')}:00`)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dateStr, hour)}
                        />
                      ))}

                      {/* Events */}
                      {dayEvents.map(event => {
                        const layout = eventLayouts.get(event.id) || { col: 0, maxCols: 1 };
                        const style = getEventStyles(event, layout);
                        const colorClass = CATEGORY_COLORS[event.category] || CATEGORY_COLORS['Other'];
                        
                        return (
                          <motion.div
                            key={event.id}
                            layoutId={event.id}
                            onClick={(e: any) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                            className={cn(
                              "absolute rounded-md border p-1 sm:p-1.5 overflow-hidden cursor-grab active:cursor-grabbing shadow-sm transition-shadow hover:shadow-md",
                              colorClass
                            )}
                            style={style}
                          >
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, event.id)}
                              onDragEnd={handleDragEnd}
                              className="w-full h-full"
                            >
                              <div className="text-[10px] sm:text-xs font-semibold truncate leading-tight">{event.title}</div>
                              <div className="text-[8px] sm:text-[10px] opacity-80 truncate mt-0.5">
                                {event.startTime} - {event.endTime}
                              </div>
                              <div className="text-[8px] sm:text-[10px] font-medium mt-0.5 sm:mt-1 truncate">
                                {event.person}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
