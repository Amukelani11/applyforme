"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { FileText, Calendar, Hash, Mail, Phone, CheckSquare, Square } from "lucide-react"

interface CustomFieldResponse {
  id: number
  field_id: number
  field_value: string
  file_url?: string
  custom_field: {
    field_label: string
    field_type: string
    field_required: boolean
    field_options?: string[]
  }
}

interface CustomFieldsViewerProps {
  applicationId: string
}

const getFieldIcon = (fieldType: string) => {
  switch (fieldType) {
    case 'text':
    case 'textarea':
      return <FileText className="h-4 w-4" />
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'phone':
      return <Phone className="h-4 w-4" />
    case 'date':
      return <Calendar className="h-4 w-4" />
    case 'number':
      return <Hash className="h-4 w-4" />
    case 'checkbox':
      return <CheckSquare className="h-4 w-4" />
    case 'select':
    case 'radio':
    case 'multiselect':
      return <FileText className="h-4 w-4" />
    case 'file':
      return <FileText className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const formatFieldValue = (value: string, fieldType: string, options?: string[]) => {
  if (!value) return 'Not provided'

  switch (fieldType) {
    case 'checkbox':
      return value === 'true' ? 'Yes' : 'No'
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'select':
    case 'radio':
      return value
    case 'multiselect':
      try {
        // Try to parse as JSON array first
        const values = JSON.parse(value)
        if (Array.isArray(values)) {
          return values.join(', ')
        }
        return value
      } catch {
        // If not JSON, treat as comma-separated string
        return value
      }
    case 'file':
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          View File
        </a>
      )
    default:
      return value
  }
}

export function CustomFieldsViewer({ applicationId }: CustomFieldsViewerProps) {
  const [responses, setResponses] = useState<CustomFieldResponse[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchCustomFieldResponses()
  }, [applicationId])

  const fetchCustomFieldResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_field_responses')
        .select(`
          id,
          field_id,
          field_value,
          file_url,
          custom_field:job_custom_fields(
            field_label,
            field_type,
            field_required,
            field_options
          )
        `)
        .eq('application_id', applicationId)
        .order('id')

      if (error) throw error

      setResponses(data?.map(item => ({
        id: item.id,
        field_id: item.field_id,
        field_value: item.field_value,
        file_url: item.file_url,
        custom_field: Array.isArray(item.custom_field) ? item.custom_field[0] : item.custom_field
      })) || [])
    } catch (error: any) {
      console.error('Error fetching custom field responses:', error)
    } finally {
      setLoading(false)
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

  if (responses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {responses.map((response, index) => (
            <motion.div
              key={response.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    {getFieldIcon(response.custom_field.field_type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {response.custom_field.field_label}
                      {response.custom_field.field_required && (
                        <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                      )}
                    </h4>
                    <div className="mt-1 text-sm text-gray-600">
                      {formatFieldValue(
                        response.field_value, 
                        response.custom_field.field_type,
                        response.custom_field.field_options
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {response.custom_field.field_type}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 