import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek, addMonths, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parse } from "date-fns";
import { Clock, Save, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import Header from '@/components/Header';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

interface ScheduleEntry {
  id: string;
  schedule_date: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
}

const Schedule = () => {
  const { user } = useAuth();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchScheduleEntries();
    }
  }, [user]);

  const fetchScheduleEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_schedule')
      .select('*')
      .eq('user_id', user.id)
      .order('schedule_date', { ascending: true });

    if (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
      return;
    }

    setScheduleEntries(data || []);
    
    // Set selected dates from fetched entries - parse as local date to avoid timezone shifts
    const dates = data?.map(entry => {
      const dateStr = entry.schedule_date;
      // Parse date string as local time, not UTC, to prevent day shifting
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }) || [];
    setSelectedDates(dates);
  };

  const calculateWeeklyHours = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    let totalMinutes = 0;
    
    scheduleEntries.forEach(entry => {
      const dateStr = entry.schedule_date;
      const [year, month, day] = dateStr.split('-').map(Number);
      const entryDate = new Date(year, month - 1, day);
      
      if (entryDate >= weekStart && entryDate <= weekEnd && entry.start_time && entry.end_time) {
        const start = new Date(`2000-01-01T${entry.start_time}`);
        const end = new Date(`2000-01-01T${entry.end_time}`);
        const diffMs = end.getTime() - start.getTime();
        totalMinutes += diffMs / (1000 * 60);
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return { hours, minutes };
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const isSelected = selectedDates.some(d => isSameDay(d, date));
    
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => !isSameDay(d, date)));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleSaveSchedule = async () => {
    if (!user || selectedDates.length === 0) {
      toast.error('Please select at least one date');
      return;
    }

    setLoading(true);

    try {
      // Delete existing entries for selected dates
      const dateStrings = selectedDates.map(date => format(date, 'yyyy-MM-dd'));
      
      await supabase
        .from('user_schedule')
        .delete()
        .eq('user_id', user.id)
        .in('schedule_date', dateStrings);

      // Insert new entries
      const entries = selectedDates.map(date => ({
        user_id: user.id,
        schedule_date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        notes: notes || null,
      }));

      const { error } = await supabase
        .from('user_schedule')
        .insert(entries);

      if (error) throw error;

      toast.success('Schedule saved successfully');
      await fetchScheduleEntries();
      
      // Clear form
      setSelectedDates([]);
      setNotes('');
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_schedule')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
      return;
    }

    toast.success('Entry deleted');
    await fetchScheduleEntries();
  };

  const weeklyHours = calculateWeeklyHours();

  const getCalendarDays = () => {
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate);
      return eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(currentDate)
      });
    } else {
      const monthStart = startOfMonth(currentDate);
      return eachDayOfInterval({
        start: monthStart,
        end: endOfMonth(currentDate)
      });
    }
  };

  const getScheduleForDate = (date: Date) => {
    return scheduleEntries.find(entry => {
      const entryDateStr = entry.schedule_date;
      const [year, month, day] = entryDateStr.split('-').map(Number);
      const entryDate = new Date(year, month - 1, day);
      return isSameDay(entryDate, date);
    });
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar activeItem="schedule" />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-background flex items-center px-8">
          <h1 className="text-2xl font-bold text-foreground">Work Schedule</h1>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Weekly Hours Card */}
              <Card className="bg-gradient-to-br from-primary to-primary-dark border-0 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="w-5 h-5" />
                    This Week's Hours
                  </CardTitle>
                  <CardDescription className="text-blue-100">Current week total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-white">
                    {weeklyHours.hours || 0}
                    <span className="text-2xl text-blue-100 ml-2">hrs</span>
                  </div>
                  {weeklyHours.minutes > 0 && (
                    <div className="text-xl text-blue-100 mt-2">
                      +{weeklyHours.minutes} minutes
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Total Scheduled Days */}
              <Card className="bg-gradient-to-br from-primary to-darknavy border-0 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CalendarIcon className="w-5 h-5" />
                    Scheduled Days
                  </CardTitle>
                  <CardDescription className="text-blue-100">Total upcoming days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-white">
                    {scheduleEntries.length || 0}
                    <span className="text-2xl text-blue-100 ml-2">days</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-gray-100 to-gray-200 border-0 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900">View Mode</CardTitle>
                  <CardDescription className="text-gray-600">Select your view preference</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'outline'}
                      onClick={() => setViewMode('week')}
                      className={viewMode === 'week' ? 'bg-primary hover:bg-primary-dark text-white' : ''}
                    >
                      Week
                    </Button>
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'outline'}
                      onClick={() => setViewMode('month')}
                      className={viewMode === 'month' ? 'bg-primary hover:bg-primary-dark text-white' : ''}
                    >
                      Month
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Large Google Calendar Style View */}
            <Card className="border-0 rounded-xl shadow-lg mb-6">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-gray-900">
                      {viewMode === 'week' ? 'Week View' : 'Month View'}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {format(currentDate, 'MMMM yyyy')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentDate(viewMode === 'week' ? addDays(currentDate, -7) : addMonths(currentDate, -1))}
                      className="rounded-lg"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentDate(new Date())}
                      className="rounded-lg"
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentDate(viewMode === 'week' ? addDays(currentDate, 7) : addMonths(currentDate, 1))}
                      className="rounded-lg"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {viewMode === 'week' ? (
                  // Google Calendar Style Week View
                  <div className="flex">
                    {/* Time column */}
                    <div className="w-20 flex-shrink-0">
                      <div className="h-12"></div>
                      {Array.from({ length: 24 }, (_, i) => (
                        <div key={i} className="h-16 text-xs text-gray-500 text-right pr-2 border-t">
                          {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                        </div>
                      ))}
                    </div>
                    
                    {/* Days columns */}
                    <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200">
                      {calendarDays.map((day, dayIndex) => {
                        const schedule = getScheduleForDate(day);
                        const isToday = isSameDay(day, new Date());
                        const isSelected = selectedDates.some(d => isSameDay(d, day));
                        
                        return (
                          <div key={dayIndex} className="bg-white">
                            {/* Day header */}
                            <div className={`h-12 flex flex-col items-center justify-center border-b ${
                              isToday ? 'bg-blue-100 border-blue-300' : 'bg-gray-50'
                            }`}>
                              <div className="text-xs font-medium text-gray-600">
                                {format(day, 'EEE')}
                              </div>
                              <div className={`text-lg font-semibold ${
                                isToday ? 'text-primary' : 'text-gray-900'
                              }`}>
                                {format(day, 'd')}
                              </div>
                            </div>
                            
                            {/* Hour slots */}
                            <div className="relative">
                              {Array.from({ length: 24 }, (_, i) => (
                                <div 
                                  key={i} 
                                  className="h-16 border-t cursor-pointer hover:bg-gray-50"
                                  onClick={() => handleDateSelect(day)}
                                ></div>
                              ))}
                              
                              {/* Scheduled time block */}
                              {schedule && schedule.start_time && schedule.end_time && (
                                <div 
                                  className="absolute left-1 right-1 bg-primary text-white rounded p-1 text-xs font-medium overflow-hidden"
                                  style={{
                                    top: `${(parseInt(schedule.start_time.split(':')[0]) + parseInt(schedule.start_time.split(':')[1]) / 60) * 64}px`,
                                    height: `${((parseInt(schedule.end_time.split(':')[0]) + parseInt(schedule.end_time.split(':')[1]) / 60) - (parseInt(schedule.start_time.split(':')[0]) + parseInt(schedule.start_time.split(':')[1]) / 60)) * 64}px`
                                  }}
                                >
                                  <div className="font-semibold">{schedule.start_time} - {schedule.end_time}</div>
                                  {schedule.notes && <div className="truncate text-xs opacity-90">{schedule.notes}</div>}
                                </div>
                              )}
                              
                              {isSelected && !schedule && (
                                <div className="absolute inset-0 bg-blue-100 bg-opacity-30 pointer-events-none"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // Month View
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center font-semibold text-gray-700 py-2 bg-gray-100 rounded-lg">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar Days */}
                    {calendarDays.map((day, index) => {
                      const schedule = getScheduleForDate(day);
                      const isToday = isSameDay(day, new Date());
                      const isSelected = selectedDates.some(d => isSameDay(d, day));
                      
                      return (
                        <div
                          key={index}
                          onClick={() => handleDateSelect(day)}
                          className={`min-h-[120px] p-3 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                            isToday ? 'border-primary bg-blue-50' : 
                            isSelected ? 'border-primary bg-blue-50' :
                            schedule ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100' : 
                            'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className={`text-sm font-semibold mb-2 ${
                            isToday ? 'text-primary' : 
                            schedule ? 'text-primary' : 
                            'text-gray-700'
                          }`}>
                            {format(day, 'd')}
                          </div>
                          
                          {schedule && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-white bg-primary rounded-lg px-2 py-1">
                                {schedule.start_time} - {schedule.end_time}
                              </div>
                              {schedule.notes && (
                                <div className="text-xs text-gray-600 truncate" title={schedule.notes}>
                                  {schedule.notes}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {isSelected && !schedule && (
                            <div className="text-xs font-medium text-primary">
                              Selected
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Add Section */}
              <Card className="border-0 rounded-xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-t-xl">
                  <CardTitle className="text-gray-900">Quick Add Schedule</CardTitle>
                  <CardDescription className="text-gray-600">
                    Select dates from calendar above and add times here
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {selectedDates.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium !text-gray-900 [&]:text-gray-900" style={{ color: '#111827 !important' }}>
                          {selectedDates.length} date(s) selected
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="rounded-lg"
                          style={{ color: '#111827', colorScheme: 'light' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="rounded-lg"
                          style={{ color: '#111827', colorScheme: 'light' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about your availability..."
                        className="rounded-lg"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleSaveSchedule}
                      disabled={loading || selectedDates.length === 0}
                      className="w-full bg-primary hover:bg-primary-dark text-white rounded-lg py-6 text-lg font-semibold"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Save Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Entries List */}
              <Card className="border-0 rounded-xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-t-xl">
                  <CardTitle className="text-gray-900">Your Schedule</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your upcoming work days
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {scheduleEntries.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No scheduled days yet</p>
                        <p className="text-sm">Select dates on the calendar to get started</p>
                      </div>
                    ) : (
                      scheduleEntries.map((entry) => {
                        // Parse date string as local date using date-fns parse
                        const localDate = parse(entry.schedule_date, 'yyyy-MM-dd', new Date());
                        
                        return (
                          <div
                            key={entry.id}
                            className="p-4 bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CalendarIcon className="w-4 h-4 text-purple-600" />
                                  <span className="font-semibold text-gray-900">
                                    {format(localDate, 'EEEE, MMMM d, yyyy')}
                                  </span>
                                </div>
                                {entry.start_time && entry.end_time && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>
                                      {entry.start_time} - {entry.end_time}
                                    </span>
                                  </div>
                                )}
                                {entry.notes && (
                                  <p className="text-sm text-gray-600 mt-2 italic">
                                    {entry.notes}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Schedule;
