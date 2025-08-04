'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TagInputProps {
  id?: string;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
}

export function TagInput({ id, tags, onAddTag, onRemoveTag, onInputChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (onInputChange) {
      onInputChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onAddTag(inputValue.trim());
      setInputValue('');
       if (onInputChange) {
        onInputChange('');
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-input p-2">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
          {tag}
          <button onClick={() => onRemoveTag(tag)} className="rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent p-1 outline-none min-w-[120px]"
      />
    </div>
  );
} 