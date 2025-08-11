"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, GripVertical, Settings, Wand2, Loader2 } from "lucide-react"
import { slugify } from "@/lib/utils"
import { motion, AnimatePresence, Reorder } from "framer-motion"

interface CustomField {
  id?: number
  field_name: string
  field_label: string
  field_type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'radio' | 'multiselect' | 'checkbox' | 'file'
  field_required: boolean
  field_options?: string[]
  field_order: number
  field_placeholder?: string
  field_help_text?: string
}

interface CustomFieldsManagerProps {
  jobId: number
  onFieldsChange?: (fields: CustomField[]) => void
}

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Single Choice' },
  { value: 'multiselect', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'file', label: 'File Upload' },
]

export function CustomFieldsManager({ jobId, onFieldsChange }: CustomFieldsManagerProps) {
  const [fields, setFields] = useState<CustomField[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchCustomFields()
  }, [jobId])

  const fetchCustomFields = async () => {
    try {
      const { data, error } = await supabase
        .from('job_custom_fields')
        .select('*')
        .eq('job_posting_id', jobId)
        .order('field_order')

      if (error) throw error

      setFields(data || [])
    } catch (error: any) {
      console.error('Error fetching custom fields:', error)
      toast({
        title: "Error",
        description: "Failed to load custom fields",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const suggestWithAI = async () => {
    try {
      setSuggesting(true)
      // Fetch current job spec to provide context
      const { data: job } = await supabase
        .from('job_postings')
        .select('title, description, requirements')
        .eq('id', jobId)
        .single()

      const res = await fetch('/api/tools/custom-fields/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job?.title || '',
          description: job?.description || '',
          requirements: job?.requirements || ''
        })
      })
      if (!res.ok) throw new Error('Failed to fetch AI suggestions')
      const data = await res.json()
      const suggestions = (data?.fields || []) as Array<{
        field_label: string
        field_type: CustomField['field_type']
        field_required: boolean
        field_placeholder?: string
        field_help_text?: string
        field_options?: string[]
      }>

      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        toast({ title: 'No suggestions', description: 'AI did not return any fields for this job.' })
        return
      }

      const existingNames = new Set(fields.map(f => f.field_name))
      const mapped: CustomField[] = suggestions.map((s, index) => {
        let base = slugify(s.field_label || 'field')
        if (!base) base = `field_${Date.now()}_${index}`
        let unique = base
        let counter = 1
        while (existingNames.has(unique)) {
          unique = `${base}_${counter++}`
        }
        existingNames.add(unique)

        const needsOptions = s.field_type === 'select' || s.field_type === 'radio' || s.field_type === 'multiselect'
        return {
          field_name: unique,
          field_label: (s.field_label || 'Custom Field').trim(),
          field_type: s.field_type,
          field_required: !!s.field_required,
          field_options: needsOptions ? (s.field_options || []) : undefined,
          field_order: fields.length + index,
          field_placeholder: s.field_placeholder || '',
          field_help_text: s.field_help_text || ''
        }
      })

      setFields(prev => [...prev, ...mapped])
      toast({ title: 'AI suggestions added', description: `${mapped.length} field(s) appended.` })
    } catch (error: any) {
      console.error('AI suggest error:', error)
      toast({ title: 'Error', description: error.message || 'Failed to suggest fields', variant: 'destructive' })
    } finally {
      setSuggesting(false)
    }
  }

  const addField = () => {
    const newField: CustomField = {
      field_name: `field_${Date.now()}`,
      field_label: '',
      field_type: 'text',
      field_required: false,
      field_order: fields.length,
      field_placeholder: '',
      field_help_text: ''
    }
    setFields([...fields, newField])
  }

  const updateField = (index: number, updates: Partial<CustomField>) => {
    const updatedFields = [...fields]
    updatedFields[index] = { ...updatedFields[index], ...updates }
    setFields(updatedFields)
  }

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index)
    // Reorder remaining fields
    updatedFields.forEach((field, i) => {
      field.field_order = i
    })
    setFields(updatedFields)
  }

  const addOption = (fieldIndex: number) => {
    const updatedFields = [...fields]
    const field = updatedFields[fieldIndex]
    if (!field.field_options) field.field_options = []
    field.field_options.push('')
    setFields(updatedFields)
  }

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updatedFields = [...fields]
    const field = updatedFields[fieldIndex]
    if (field.field_options) {
      field.field_options[optionIndex] = value
      setFields(updatedFields)
    }
  }

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...fields]
    const field = updatedFields[fieldIndex]
    if (field.field_options) {
      field.field_options.splice(optionIndex, 1)
      setFields(updatedFields)
    }
  }

  const saveFields = async () => {
    try {
      setSaving(true)

      // Validate fields
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i]
        if (!field.field_label.trim()) {
          toast({
            title: "Validation Error",
            description: `Field ${i + 1} must have a label`,
            variant: "destructive"
          })
          return
        }
        if ((field.field_type === 'select' || field.field_type === 'radio' || field.field_type === 'multiselect') && (!field.field_options || field.field_options.length === 0)) {
          toast({
            title: "Validation Error",
            description: `Field "${field.field_label}" must have at least one option`,
            variant: "destructive"
          })
          return
        }
      }

      // Delete existing fields
      await supabase
        .from('job_custom_fields')
        .delete()
        .eq('job_posting_id', jobId)

      // Insert new fields
      if (fields.length > 0) {
        const { error } = await supabase
          .from('job_custom_fields')
          .insert(fields.map(field => ({
            ...field,
            job_posting_id: jobId,
            field_options: (field.field_type === 'select' || field.field_type === 'radio' || field.field_type === 'multiselect') ? field.field_options : null
          })))

        if (error) throw error
      }

      toast({
        title: "Success",
        description: "Custom fields saved successfully"
      })

      onFieldsChange?.(fields)
    } catch (error: any) {
      console.error('Error saving custom fields:', error)
      toast({
        title: "Error",
        description: "Failed to save custom fields",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-gray-600">
          Add custom fields to collect additional information from applicants
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); suggestWithAI() }}
            disabled={suggesting}
          >
            {suggesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            Suggest with AI
          </Button>
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addField()
            }} 
            size="sm" 
            className="bg-[#c084fc] hover:bg-[#a855f7] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>
      </div>

        <AnimatePresence>
          {fields.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-gray-500"
            >
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No custom fields added yet</p>
              <p className="text-sm">Click "Add Field" to get started</p>
            </motion.div>
          ) : (
            <Reorder.Group axis="y" values={fields} onReorder={setFields}>
              {fields.map((field, index) => (
                <Reorder.Item key={index} value={field}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                      <Badge variant="outline" className="border-[#c084fc] text-[#c084fc]">{field.field_type}</Badge>
                      {field.field_required && (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">Required</Badge>
                      )}
                                              <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeField(index)
                          }}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Field Label *</Label>
                        <Input
                          value={field.field_label}
                          onChange={(e) => updateField(index, { field_label: e.target.value })}
                          placeholder="e.g., Years of Experience"
                        />
                      </div>
                      <div>
                        <Label>Field Type</Label>
                        <Select
                          value={field.field_type}
                          onValueChange={(value: CustomField['field_type']) => 
                            updateField(index, { field_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Placeholder Text</Label>
                        <Input
                          value={field.field_placeholder || ''}
                          onChange={(e) => updateField(index, { field_placeholder: e.target.value })}
                          placeholder="Optional placeholder text"
                        />
                      </div>
                      <div>
                        <Label>Help Text</Label>
                        <Input
                          value={field.field_help_text || ''}
                          onChange={(e) => updateField(index, { field_help_text: e.target.value })}
                          placeholder="Optional help text"
                        />
                      </div>
                    </div>

                                         {(field.field_type === 'select' || field.field_type === 'radio' || field.field_type === 'multiselect') && (
                       <div>
                         <Label>Options</Label>
                         <div className="space-y-2">
                           {(field.field_options || []).map((option, optionIndex) => (
                             <div key={optionIndex} className="flex gap-2">
                               <Input
                                 value={option}
                                 onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                 placeholder={`Option ${optionIndex + 1}`}
                               />
                               <Button
                                 type="button"
                                 variant="ghost"
                                 size="sm"
                                 onClick={(e) => {
                                   e.preventDefault()
                                   e.stopPropagation()
                                   removeOption(index, optionIndex)
                                 }}
                                 className="text-red-500"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                           ))}
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={(e) => {
                               e.preventDefault()
                               e.stopPropagation()
                               addOption(index)
                             }}
                           >
                             <Plus className="h-4 w-4 mr-2" />
                             Add Option
                           </Button>
                         </div>
                       </div>
                     )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.field_required}
                        onCheckedChange={(checked) => updateField(index, { field_required: checked })}
                      />
                      <Label>Required field</Label>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </AnimatePresence>

        {fields.length > 0 && (
          <div className="flex justify-end">
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                saveFields()
              }} 
              disabled={saving} 
              className="bg-[#c084fc] hover:bg-[#a855f7] text-white"
            >
              {saving ? 'Saving...' : 'Save Fields'}
            </Button>
          </div>
        )}
      </div>
  )
} 