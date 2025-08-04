"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"

interface CustomField {
  id: number
  field_name: string
  field_label: string
  field_type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'radio' | 'multiselect' | 'checkbox' | 'file'
  field_required: boolean
  field_options?: string[]
  field_order: number
  field_placeholder?: string
  field_help_text?: string
}

interface CustomFieldsFormProps {
  jobId: number
  register: any
  setValue: any
  watch: any
  formState: any
}

export function CustomFieldsForm({ jobId, register, setValue, watch, formState }: CustomFieldsFormProps) {
  const [fields, setFields] = useState<CustomField[]>([])
  const [loading, setLoading] = useState(true)
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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (fields.length === 0) {
    return null
  }

  const renderField = (field: CustomField, index: number) => {
    const fieldName = `customFields.${field.field_name}`
    const fieldError = formState?.errors?.customFields?.[field.field_name]

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor={fieldName} className="text-sm font-medium text-gray-700">
              {field.field_label}
              {field.field_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type={field.field_type}
              placeholder={field.field_placeholder}
              {...register(fieldName, {
                required: field.field_required ? `${field.field_label} is required` : false,
                ...(field.field_type === 'email' && {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })
              })}
              className="focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
            />
            {field.field_help_text && (
              <p className="text-xs text-gray-500">{field.field_help_text}</p>
            )}
            {fieldError && (
              <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {fieldError.message as string}
              </motion.p>
            )}
          </motion.div>
        )

      case 'textarea':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor={fieldName} className="text-sm font-medium text-gray-700">
              {field.field_label}
              {field.field_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={fieldName}
              placeholder={field.field_placeholder}
              {...register(fieldName, {
                required: field.field_required ? `${field.field_label} is required` : false
              })}
              className="min-h-[100px] focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200 resize-none"
            />
            {field.field_help_text && (
              <p className="text-xs text-gray-500">{field.field_help_text}</p>
            )}
            {fieldError && (
              <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {fieldError.message as string}
              </motion.p>
            )}
          </motion.div>
        )

      case 'number':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor={fieldName} className="text-sm font-medium text-gray-700">
              {field.field_label}
              {field.field_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="number"
              placeholder={field.field_placeholder}
              {...register(fieldName, {
                required: field.field_required ? `${field.field_label} is required` : false,
                valueAsNumber: true
              })}
              className="focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
            />
            {field.field_help_text && (
              <p className="text-xs text-gray-500">{field.field_help_text}</p>
            )}
            {fieldError && (
              <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {fieldError.message as string}
              </motion.p>
            )}
          </motion.div>
        )

      case 'date':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor={fieldName} className="text-sm font-medium text-gray-700">
              {field.field_label}
              {field.field_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="date"
              {...register(fieldName, {
                required: field.field_required ? `${field.field_label} is required` : false
              })}
              className="focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
            />
            {field.field_help_text && (
              <p className="text-xs text-gray-500">{field.field_help_text}</p>
            )}
            {fieldError && (
              <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {fieldError.message as string}
              </motion.p>
            )}
          </motion.div>
        )

      case 'select':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor={fieldName} className="text-sm font-medium text-gray-700">
              {field.field_label}
              {field.field_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              onValueChange={(value) => setValue(fieldName, value)}
              {...register(fieldName, {
                required: field.field_required ? `${field.field_label} is required` : false
              })}
            >
              <SelectTrigger className="focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200">
                <SelectValue placeholder={field.field_placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.field_options?.map((option, optionIndex) => (
                  <SelectItem key={optionIndex} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.field_help_text && (
              <p className="text-xs text-gray-500">{field.field_help_text}</p>
            )}
            {fieldError && (
              <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {fieldError.message as string}
              </motion.p>
            )}
          </motion.div>
        )

      case 'radio':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <Label className="text-sm font-medium text-gray-700">
              {field.field_label}
              {field.field_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.field_options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${fieldName}-${optionIndex}`}
                    name={fieldName}
                    value={option}
                    {...register(fieldName, {
                      required: field.field_required ? `${field.field_label} is required` : false
                    })}
                    className="w-4 h-4 text-[#c084fc] border-gray-300 focus:ring-[#c084fc] focus:ring-2"
                  />
                  <Label htmlFor={`${fieldName}-${optionIndex}`} className="text-sm text-gray-700 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {field.field_help_text && (
              <p className="text-xs text-gray-500">{field.field_help_text}</p>
            )}
            {fieldError && (
              <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {fieldError.message as string}
              </motion.p>
            )}
          </motion.div>
        )

      case 'multiselect':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <Label className="text-sm font-medium text-gray-700">
              {field.field_label}
              {field.field_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.field_options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${fieldName}-${optionIndex}`}
                    value={option}
                    onChange={(e) => {
                      const currentValues = watch(fieldName) || []
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((val: string) => val !== option)
                      setValue(fieldName, newValues)
                    }}
                    checked={watch(fieldName)?.includes(option) || false}
                    className="w-4 h-4 text-[#c084fc] border-gray-300 focus:ring-[#c084fc] focus:ring-2 rounded"
                  />
                  <Label htmlFor={`${fieldName}-${optionIndex}`} className="text-sm text-gray-700 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {field.field_help_text && (
              <p className="text-xs text-gray-500">{field.field_help_text}</p>
            )}
            {fieldError && (
              <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {fieldError.message as string}
              </motion.p>
            )}
          </motion.div>
        )

      case 'checkbox':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                id={fieldName}
                {...register(fieldName, {
                  required: field.field_required ? `${field.field_label} is required` : false
                })}
                className="focus:ring-[#c084fc]"
              />
              <Label htmlFor={fieldName} className="text-sm font-medium text-gray-700">
                {field.field_label}
                {field.field_required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {field.field_help_text && (
              <p className="text-xs text-gray-500 ml-6">{field.field_help_text}</p>
            )}
            {fieldError && (
              <motion.p
                className="text-red-500 text-sm ml-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {fieldError.message as string}
              </motion.p>
            )}
          </motion.div>
        )

      case 'file':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor={fieldName} className="text-sm font-medium text-gray-700">
              {field.field_label}
              {field.field_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="file"
              {...register(fieldName, {
                required: field.field_required ? `${field.field_label} is required` : false
              })}
              className="focus:border-[#c084fc] focus:ring-[#c084fc] transition-colors duration-200"
            />
            {field.field_help_text && (
              <p className="text-xs text-gray-500">{field.field_help_text}</p>
            )}
            {fieldError && (
              <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {fieldError.message as string}
              </motion.p>
            )}
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {fields.map((field, index) => renderField(field, index))}
    </div>
  )
} 