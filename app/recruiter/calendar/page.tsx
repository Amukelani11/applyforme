"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { AddEventDialog } from './_components/add-event-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    description?: string;
    event_date: string;
    event_type: 'deadline' | 'interview' | 'reminder' | 'custom';
    is_all_day: boolean;
    start_time?: string;
    end_time?: string;
    job_title?: string;
}

export default function RecruiterCalendar() {
    const supabase = createClient();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(currentDate);

            // Get recruiter events
            const { data: recruiterEvents } = await supabase
                .from('recruiter_events')
                .select('*')
                .gte('event_date', monthStart.toISOString().split('T')[0])
                .lte('event_date', monthEnd.toISOString().split('T')[0]);

            // Get job deadlines
            const { data: jobs } = await supabase
                .from('jobs')
                .select('id, title, application_deadline')
                .not('application_deadline', 'is', null)
                .gte('application_deadline', monthStart.toISOString().split('T')[0])
                .lte('application_deadline', monthEnd.toISOString().split('T')[0]);

            const allEvents: Event[] = [];

            // Add recruiter events
            if (recruiterEvents) {
                allEvents.push(...recruiterEvents.map((event: any) => ({
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    event_date: event.event_date,
                    event_type: event.event_type,
                    is_all_day: event.is_all_day,
                    start_time: event.start_time,
                    end_time: event.end_time
                })));
            }

            // Add job deadlines
            if (jobs) {
                allEvents.push(...jobs.map((job: any) => ({
                    id: `deadline-${job.id}`,
                    title: `Application Deadline`,
                    description: `Deadline for ${job.title}`,
                    event_date: job.application_deadline,
                    event_type: 'deadline' as const,
                    is_all_day: true,
                    job_title: job.title
                })));
            }

            setEvents(allEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const getEventsForDate = (date: Date) => {
        return events.filter(event => 
            isSameDay(new Date(event.event_date), date)
        );
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'deadline': return 'bg-red-500';
            case 'interview': return 'bg-green-500';
            case 'reminder': return 'bg-yellow-500';
            case 'custom': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    const getEventTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'deadline': return 'destructive';
            case 'interview': return 'default';
            case 'reminder': return 'secondary';
            case 'custom': return 'outline';
            default: return 'outline';
        }
    };

    const navigateMonth = async (direction: 'prev' | 'next') => {
        setIsTransitioning(true);
        
        // Brief delay for transition effect
        setTimeout(() => {
            setCurrentDate(prev => 
                direction === 'prev' 
                    ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1) 
                    : new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
            );
            setIsTransitioning(false);
        }, 150);
    };

    const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 animate-in slide-in-from-left duration-700">
                    <CalendarDays className="h-8 w-8 text-purple-600" />
                    <div>
                        <h1 className="text-3xl font-bold">Calendar</h1>
                        <p className="text-muted-foreground">
                            Manage your interviews, deadlines, and events
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={() => setShowAddEvent(true)}
                    className="bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl animate-in slide-in-from-right duration-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <Card className="lg:col-span-2 animate-in slide-in-from-bottom duration-500 delay-150">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className={`flex items-center gap-2 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                                <CalendarDays className="h-5 w-5" />
                                {format(currentDate, 'MMMM yyyy')}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigateMonth('prev')}
                                    className="transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-purple-50 hover:border-purple-200"
                                    disabled={isTransitioning}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigateMonth('next')}
                                    className="transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-purple-50 hover:border-purple-200"
                                    disabled={isTransitioning}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-98' : 'opacity-100 scale-100'}`}>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                month={currentDate}
                                onMonthChange={setCurrentDate}
                                className="w-full"
                                classNames={{
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                    month: "space-y-4",
                                    caption: "hidden", // Hide the built-in caption since we have our own
                                    caption_label: "hidden",
                                    nav: "hidden", // Hide built-in navigation
                                    nav_button: "hidden",
                                    nav_button_previous: "hidden",
                                    nav_button_next: "hidden",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex",
                                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex-1 text-center",
                                    row: "flex w-full mt-2",
                                    cell: "text-center text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-purple-50 hover:text-purple-900 transition-all duration-200 hover:scale-110 rounded-md mx-auto",
                                    day_selected: "bg-purple-600 text-purple-50 hover:bg-purple-600 hover:text-purple-50 focus:bg-purple-600 focus:text-purple-50",
                                    day_today: "bg-purple-100 text-purple-900 font-semibold",
                                    day_outside: "text-muted-foreground opacity-50",
                                    day_disabled: "text-muted-foreground opacity-50",
                                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                    day_hidden: "invisible",
                                }}
                                components={{
                                    IconLeft: () => null,
                                    IconRight: () => null,
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Events for Selected Date */}
                <Card className="animate-in slide-in-from-bottom duration-500 delay-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="animate-in fade-in duration-300">
                            {selectedDateEvents.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8 animate-in fade-in duration-500">
                                    No events for this date
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedDateEvents.map((event, index) => (
                                        <div 
                                            key={event.id}
                                            className="p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer animate-in slide-in-from-right duration-300"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.event_type)} animate-pulse`} />
                                                        <h4 className="font-medium text-sm">{event.title}</h4>
                                                    </div>
                                                    {event.description && (
                                                        <p className="text-xs text-muted-foreground mb-2">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                    {!event.is_all_day && event.start_time && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {event.start_time} {event.end_time && `- ${event.end_time}`}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge 
                                                    variant={getEventTypeBadgeColor(event.event_type) as any}
                                                    className="text-xs transition-all duration-200 hover:scale-105"
                                                >
                                                    {event.event_type}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Events */}
            <Card className="animate-in slide-in-from-bottom duration-500 delay-450">
                <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                    {events.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8 animate-in fade-in duration-500">
                            No upcoming events
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {events
                                .filter(event => new Date(event.event_date) >= new Date())
                                .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                                .slice(0, 5)
                                .map((event, index) => (
                                    <div 
                                        key={event.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer animate-in slide-in-from-left duration-300"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.event_type)} animate-pulse`} />
                                            <div>
                                                <h4 className="font-medium">{event.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(event.event_date), 'MMM d, yyyy')}
                                                    {!event.is_all_day && event.start_time && ` at ${event.start_time}`}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge 
                                            variant={getEventTypeBadgeColor(event.event_type) as any}
                                            className="transition-all duration-200 hover:scale-105"
                                        >
                                            {event.event_type}
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddEventDialog 
                isOpen={showAddEvent}
                onClose={() => setShowAddEvent(false)}
                onEventAdded={fetchEvents}
                selectedDate={selectedDate || null}
            />
        </div>
    );
} 