'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Toggle } from '@/components/ui/toggle';
import { cn } from "@/lib/utils"
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase';
import { TagInput } from '@/components/ui/tag-input';
import { Combobox } from '@/components/ui/combobox';
import debounce from 'lodash.debounce';


const employmentTypes = ["Full-time", "Part-time", "Contract", "Temporary", "Internship"];
const companySizes = ["Startup (1-50)", "Small (51-200)", "Medium (201-1000)", "Large (1000+)"];


const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="py-8">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">{title}</h2>
    <div className="grid grid-cols-1 gap-8">
        {children}
    </div>
  </div>
);

export default function JobPreferencesPage() {
    const { toast } = useToast()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [industryOptions, setIndustryOptions] = useState<string[]>([]);
    const [jobTitles, setJobTitles] = useState<string[]>(["Software Engineer", "Product Manager"]);
    const [industries, setIndustries] = useState<string[]>(["Technology"]);
    const [locations, setLocations] = useState<string[]>(["Remote (South Africa)"]);
    const [workArrangement, setWorkArrangement] = useState<string>("Remote");
    const [salaryRange, setSalaryRange] = useState<[number, number]>([600000, 1000000]);
    const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>(["Full-time"]);
    const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>(["Startup (1-50)", "Medium (201-1000)"]);
    const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
    const [avoidCompanies, setAvoidCompanies] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const fetchPreferences = async () => {
            setIsFetching(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('job_preferences')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setJobTitles(data.job_titles || []);
                    setIndustries(data.industries || []);
                    setLocations(data.locations || []);
                    setWorkArrangement(data.work_arrangement || 'Remote');
                    setSalaryRange([
                        data.salary_range_min ? Number(data.salary_range_min) : 600000,
                        data.salary_range_max ? Number(data.salary_range_max) : 1000000
                    ]);
                    setSelectedEmploymentTypes(data.employment_types || ['Full-time']);
                    setSelectedCompanySizes(data.company_sizes || []);
                    setTargetCompanies(data.target_companies || []);
                    setAvoidCompanies(data.avoid_companies || []);
                }

                if (error && error.code !== 'PGRST116') { // Ignore 'no rows found' error
                    console.error('Error fetching preferences:', error);
                    toast({
                        title: "Error",
                        description: "Could not load your preferences.",
                        variant: "destructive",
                    });
                }
            }
            setIsFetching(false);
        };

        const fetchIndustries = async () => {
            const { data, error } = await supabase.from('industries').select('name').order('name', { ascending: true });
            if (error) {
                console.error('Error fetching industries:', error);
                toast({
                    title: "Error",
                    description: "Could not load industry options.",
                    variant: "destructive",
                });
            } else if (data) {
                setIndustryOptions(data.map(i => i.name));
            }
        };

        fetchPreferences();
        fetchIndustries();
    }, [supabase, toast]);

    const fetchSuggestions = useCallback(
        debounce(async (query: string, existing: string[]) => {
            if (query.length < 2) {
                setSuggestedTitles([]);
                return;
            }
            setIsFetchingSuggestions(true);
            try {
                const response = await fetch('/api/suggestions/job-titles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query, existingTitles: existing }),
                });
                if (response.ok) {
                    const data = await response.json();
                    // Filter out suggestions that are already in jobTitles
                    const newSuggestions = data.suggestions.filter((s: string) => !jobTitles.includes(s) && s.toLowerCase() !== query.toLowerCase());
                    setSuggestedTitles(newSuggestions);
                }
            } catch (error) {
                console.error('Failed to fetch job title suggestions', error);
            } finally {
                setIsFetchingSuggestions(false);
            }
        }, 300),
        [jobTitles]
    );
    
    useEffect(() => {
        if (inputValue) {
            fetchSuggestions(inputValue, jobTitles);
        } else {
            setSuggestedTitles([]);
        }
    }, [inputValue, fetchSuggestions, jobTitles]);

    useEffect(() => {
        // Fetch suggestions for similar jobs when a new title is added
        if (jobTitles.length > 0) {
            const lastTitle = jobTitles[jobTitles.length - 1];
            fetchSuggestions(lastTitle, jobTitles.slice(0, -1));
        }
    }, [jobTitles.length]); // Intentionally only depends on the length

    const handleAddJobTitle = (title: string) => {
        if (title && !jobTitles.includes(title)) {
            const newTitles = [...jobTitles, title];
            setJobTitles(newTitles);
            setSuggestedTitles(suggestedTitles.filter(s => s.toLowerCase() !== title.toLowerCase()));
            // Fetch new suggestions based on the updated list
            fetchSuggestions(title, newTitles);
        }
    };

    const handleRemoveJobTitle = (title: string) => {
        setJobTitles(jobTitles.filter(t => t !== title));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const updates = {
                user_id: user.id,
                job_titles: jobTitles,
                industries,
                locations,
                work_arrangement: workArrangement,
                salary_range_min: salaryRange[0],
                salary_range_max: salaryRange[1],
                employment_types: selectedEmploymentTypes,
                company_sizes: selectedCompanySizes,
                target_companies: targetCompanies,
                avoid_companies: avoidCompanies,
            };

            console.log('Attempting to save preferences:', updates);

            const { error } = await supabase.from('job_preferences').upsert(updates, {
                onConflict: 'user_id',
            });
            
            if (error) {
                console.error('Error saving to Supabase:', error);
                 toast({
                    title: "Error Saving Preferences",
                    description: error.message,
                    variant: "destructive",
                });
            } else {
                console.log('Preferences saved successfully!');
                toast({
                title: "Preferences Saved!",
                description: "Your AI Job Match Settings have been updated.",
                className: "bg-black text-white"
                });
            }
        }
        setIsSaving(false);
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl font-semibold">Loading your preferences...</div>
            </div>
        )
    }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Job Preferences</h1>
        <p className="mt-2 text-gray-600">
            Help our team and AI find your perfect match. The more details you provide, the better our results.
        </p>
      </header>

      <Separator />

      <Section title="Desired Roles & Industries">
         <div>
            <Label className="font-medium text-base">Job Title(s)</Label>
            <p className="text-sm text-gray-500 mb-2">What job titles are you looking for?</p>
            <TagInput
                id="job-titles"
                tags={jobTitles}
                onAddTag={handleAddJobTitle}
                onRemoveTag={handleRemoveJobTitle}
                placeholder="E.g., 'Senior Developer', 'Marketing Manager'"
                onInputChange={setInputValue}
            />
            {isFetchingSuggestions && <p className="text-sm text-muted-foreground">Looking for suggestions...</p>}
            {suggestedTitles.length > 0 && (
                <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Suggested for you:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedTitles.map((title) => (
                            <button
                                key={title}
                                onClick={() => handleAddJobTitle(title)}
                                className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
                            >
                                + {title}
                            </button>
                        ))}
                    </div>
                </div>
            )}
         </div>
         <div>
            <Label className="font-medium text-base">Industry(s)</Label>
            <p className="text-sm text-gray-500 mb-2">Which industries interest you?</p>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between font-normal text-gray-600 border-gray-200 hover:border-[#c084fc] focus:border-[#c084fc] transition-all duration-200">
                        {industries.length > 0 ? industries.join(', ') : "Select industries..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search industries..." />
                        <CommandList>
                           <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {industryOptions.map(option => {
                                    const isSelected = industries.includes(option);
                                    return (
                                        <CommandItem
                                            key={option}
                                            onSelect={() => {
                                                if (isSelected) {
                                                    setIndustries(industries.filter(s => s !== option));
                                                } else {
                                                    setIndustries([...industries, option]);
                                                }
                                            }}
                                        >
                                           <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-[#c084fc]", isSelected ? "bg-[#c084fc] text-white" : "opacity-50 [&_svg]:invisible")}>
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            <span>{option}</span>
                                        </CommandItem>
                                    );
                                })}
                           </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
         </div>
      </Section>
      
      <Separator />

      <Section title="Location & Work Style">
        <div>
            <Label className="font-medium text-base">Location(s)</Label>
            <p className="text-sm text-gray-500 mb-2">Where are you looking to work?</p>
            <TagInput 
              tags={locations} 
              onAddTag={(tag) => setLocations([...locations, tag])}
              onRemoveTag={(tag) => setLocations(locations.filter(t => t !== tag))} 
              placeholder="Type a location and press Enter..." 
            />
        </div>
        <div>
            <Label className="font-medium text-base">Work Arrangement</Label>
            <p className="text-sm text-gray-500 mb-2">What type of work arrangement do you prefer?</p>
            <RadioGroup value={workArrangement} onValueChange={setWorkArrangement} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="On-site" id="on-site" className="text-[#c084fc] border-gray-400" />
                    <Label htmlFor="on-site" className="font-normal">On-site</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Hybrid" id="hybrid" className="text-[#c084fc] border-gray-400" />
                    <Label htmlFor="hybrid" className="font-normal">Hybrid</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Remote" id="remote" className="text-[#c084fc] border-gray-400" />
                    <Label htmlFor="remote" className="font-normal">Remote</Label>
                </div>
            </RadioGroup>
        </div>
      </Section>

      <Separator />

      <Section title="Compensation & Contract">
        <div>
            <Label className="font-medium text-base">Desired Salary (Annual Gross)</Label>
            <p className="text-sm text-gray-500 mb-2">What is your expected annual gross salary?</p>
            <div className="flex items-center space-x-4">
                <Input type="number" value={salaryRange[0]} onChange={e => setSalaryRange([+e.target.value, salaryRange[1]])} placeholder="Min" className="w-32 border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition-all duration-200"/>
                <Slider
                    value={salaryRange} 
                    onValueChange={(value: [number, number]) => setSalaryRange(value)} 
                    max={2000000} 
                    step={50000} 
                    className="w-full"
                />
                <Input type="number" value={salaryRange[1]} onChange={e => setSalaryRange([salaryRange[0], +e.target.value])} placeholder="Max" className="w-32 border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition-all duration-200"/>
            </div>
             <p className="text-center text-sm text-gray-800 mt-2 font-medium">R{salaryRange[0].toLocaleString()} - R{salaryRange[1].toLocaleString()}</p>
        </div>
         <div>
            <Label className="font-medium text-base">Employment Type</Label>
            <p className="text-sm text-gray-500 mb-2">What employment types are you open to?</p>
            <div className="flex flex-wrap gap-2">
                {employmentTypes.map(type => (
                    <Toggle 
                        key={type}
                        pressed={selectedEmploymentTypes.includes(type)}
                        onPressedChange={(pressed) => {
                             if (pressed) {
                                setSelectedEmploymentTypes([...selectedEmploymentTypes, type]);
                            } else {
                                setSelectedEmploymentTypes(selectedEmploymentTypes.filter(t => t !== type));
                            }
                        }}
                        variant="outline"
                        className="data-[state=on]:bg-[#f3e8ff] data-[state=on]:text-[#a855f7] data-[state=on]:border-[#c084fc] border-gray-200 transition-all duration-200"
                    >
                        {type}
                    </Toggle>
                ))}
            </div>
        </div>
      </Section>

      <Separator />

      <Section title="Advanced Filters">
        <div>
            <Label className="font-medium text-base">Company Size</Label>
            <p className="text-sm text-gray-500 mb-2">What size companies do you prefer?</p>
             <div className="flex flex-wrap gap-2">
                {companySizes.map(size => (
                    <Toggle 
                        key={size}
                        pressed={selectedCompanySizes.includes(size)}
                        onPressedChange={(pressed) => {
                             if (pressed) {
                                setSelectedCompanySizes([...selectedCompanySizes, size]);
                            } else {
                                setSelectedCompanySizes(selectedCompanySizes.filter(s => s !== size));
                            }
                        }}
                        variant="outline"
                        className="data-[state=on]:bg-[#f3e8ff] data-[state=on]:text-[#a855f7] data-[state=on]:border-[#c084fc] border-gray-200 transition-all duration-200"
                    >
                        {size}
                    </Toggle>
                ))}
            </div>
        </div>
        <div>
            <Label className="font-medium text-base">Specific Companies to Target</Label>
            <p className="text-sm text-gray-500 mb-2">Any specific companies you'd like us to focus on?</p>
            <TagInput 
              tags={targetCompanies} 
              onAddTag={(tag) => setTargetCompanies([...targetCompanies, tag])}
              onRemoveTag={(tag) => setTargetCompanies(targetCompanies.filter(t => t !== tag))} 
              placeholder="Type a company and press Enter..." 
            />
        </div>
        <div>
            <Label className="font-medium text-base">Companies to Avoid (Optional)</Label>
            <p className="text-sm text-gray-500 mb-2">Are there any companies you prefer not to apply to?</p>
            <TagInput 
              tags={avoidCompanies} 
              onAddTag={(tag) => setAvoidCompanies([...avoidCompanies, tag])}
              onRemoveTag={(tag) => setAvoidCompanies(avoidCompanies.filter(t => t !== tag))} 
              placeholder="Type a company and press Enter..." 
            />
        </div>
      </Section>

      <footer className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#a855f7] hover:bg-[#9333ea] text-white transform hover:scale-105 active:scale-95 transition-all duration-200">
            {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </footer>
    </div>
  );
}; 