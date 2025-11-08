import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek, addMonths, isSameDay } from "date-fns";
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
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(false);

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
    
    // Set selected dates from fetched entries
    const dates = data?.map(entry => new Date(entry.schedule_date)) || [];
    setSelectedDates(dates);
  };

  const calculateWeeklyHours = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    let totalMinutes = 0;
    
    scheduleEntries.forEach(entry => {
      const entryDate = new Date(entry.schedule_date);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-20">
        <DashboardSidebar activeItem="schedule" />
        <main className="flex-1 p-8 ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Work Schedule</h1>
              <p className="text-lg text-gray-600">Plan your availability for the upcoming weeks</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Weekly Hours Card */}
              <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white border-0 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="w-5 h-5" />
                    This Week's Hours
                  </CardTitle>
                  <CardDescription className="text-purple-100">Current week total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-white">
                    {weeklyHours.hours}
                    <span className="text-2xl text-purple-100 ml-2">hrs</span>
                  </div>
                  {weeklyHours.minutes > 0 && (
                    <div className="text-xl text-purple-100 mt-2">
                      +{weeklyHours.minutes} minutes
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Total Scheduled Days */}
              <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-0 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CalendarIcon className="w-5 h-5" />
                    Scheduled Days
                  </CardTitle>
                  <CardDescription className="text-indigo-100">Total upcoming days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-white">
                    {scheduleEntries.length}
                    <span className="text-2xl text-indigo-100 ml-2">days</span>
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
                      className={viewMode === 'week' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      Week
                    </Button>
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'outline'}
                      onClick={() => setViewMode('month')}
                      className={viewMode === 'month' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      Month
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar Section */}
              <Card className="border-0 rounded-xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
                  <CardTitle className="text-gray-900">Select Work Dates</CardTitle>
                  <CardDescription className="text-gray-600">
                    Click dates to add them to your schedule
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => dates && setSelectedDates(dates)}
                    className="rounded-lg border border-gray-200 p-3 pointer-events-auto"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                  
                  <div className="mt-6 space-y-4">
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
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-6 text-lg font-semibold"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Save Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Entries List */}
              <Card className="border-0 rounded-xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl">
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
                      scheduleEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CalendarIcon className="w-4 h-4 text-purple-600" />
                                <span className="font-semibold text-gray-900">
                                  {format(new Date(entry.schedule_date), 'EEEE, MMMM d, yyyy')}
                                </span>
                              </div>
                              {entry.start_time && entry.end_time && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <Clock className="w-4 h-4 text-indigo-600" />
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
                      ))
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
