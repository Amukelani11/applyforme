"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Loader2, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  event_type: z.enum(["reminder", "custom", "interview", "deadline"]),
  event_date: z.string().min(1, "Date is required"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  description: z.string().optional(),
  is_all_day: z.boolean().default(true),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface AddEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: () => void;
  selectedDate: Date | null;
}

export function AddEventDialog({ isOpen, onClose, onEventAdded, selectedDate }: AddEventDialogProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      event_type: "custom",
      event_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      start_time: "",
      end_time: "",
      description: "",
      is_all_day: true,
    },
  });
  
  // Update form default when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      form.setValue('event_date', format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate, form]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: "",
        event_type: "custom",
        event_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        start_time: "",
        end_time: "",
        description: "",
        is_all_day: true,
      });
    }
  }, [isOpen, selectedDate, form]);

  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("Not authenticated");

        const { data: recruiter } = await supabase.from('recruiters').select('id').eq('user_id', session.user.id).single();
        if (!recruiter) throw new Error("Recruiter profile not found.");

        const { error } = await supabase.from("recruiter_events").insert({
            title: values.title,
            event_type: values.event_type,
            event_date: values.event_date,
            start_time: values.start_time || null,
            end_time: values.end_time || null,
            description: values.description || null,
            is_all_day: values.is_all_day,
            recruiter_id: recruiter.id,
        });

        if (error) throw error;
        
        toast({ title: "Success", description: "Event added to your calendar." });
        onEventAdded();
        onClose();
        form.reset();
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="animate-in slide-in-from-top-1 duration-300">
            Add New Event
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in slide-in-from-bottom-2 duration-400">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter event title"
                      className="transition-all duration-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2">Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="transition-all duration-200 focus:border-purple-500 focus:ring-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="custom">Custom Event</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2">Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="date" 
                          {...field}
                          className="transition-all duration-200 focus:border-purple-500 focus:ring-purple-500 pr-10"
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-200 peer-focus:text-purple-500" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_all_day"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 transition-all duration-200 hover:bg-muted/50">
                  <FormControl>
                    <div className="relative">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="peer sr-only"
                      />
                      <div 
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200 cursor-pointer",
                          "border-gray-300 bg-white hover:border-purple-400",
                          "peer-focus:ring-2 peer-focus:ring-purple-500 peer-focus:ring-offset-2",
                          field.value 
                            ? "bg-purple-600 border-purple-600 hover:bg-purple-700 hover:border-purple-700" 
                            : "hover:bg-purple-50"
                        )}
                        onClick={() => field.onChange(!field.value)}
                      >
                        {field.value && (
                          <Check className="h-3 w-3 text-white animate-in zoom-in-50 duration-200" />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-medium cursor-pointer" onClick={() => field.onChange(!field.value)}>
                      All Day Event
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Toggle if this is an all-day event
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {!form.watch('is_all_day') && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field}
                          className="transition-all duration-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field}
                          className="transition-all duration-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Add event description..."
                      className="min-h-[80px] transition-all duration-200 focus:border-purple-500 focus:ring-purple-500 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="space-x-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="transition-all duration-200 hover:bg-muted hover:scale-105 active:scale-95"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Event
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
