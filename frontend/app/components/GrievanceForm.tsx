'use client'

import { FormEvent, useState } from 'react'
import { grievancesAPI } from '@/app/lib/api'
import { AlertCircle, Loader, CheckCircle } from 'lucide-react'

interface GrievanceFormProps {
  onSuccess?: () => void
}

const GRIEVANCE_TYPES = [
  'Payment Dispute',
  'Safety Concern',
  'Workplace Harassment',
  'Unfair Practice',
  'Wage Issue',
  'Other',
]

export default function GrievanceForm({ onSuccess }: GrievanceFormProps) {
  const [formData, setFormData] = useState({
    type: 'Payment Dispute',
    title: '',
    description: '',
    date_occurred: '',
    severity: 'medium',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      await grievancesAPI.create(formData)

      setSuccess(true)
      setFormData({
        type: 'Payment Dispute',
        title: '',
        description: '',
        date_occurred: '',
        severity: 'medium',
      })

      if (onSuccess) {
        setTimeout(onSuccess, 1500)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit grievance.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">
            Grievance submitted successfully! We'll review it shortly.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grievance Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
          >
            {GRIEVANCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity *
          </label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
          placeholder="Brief title of your grievance"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          When did this occur? *
        </label>
        <input
          type="date"
          name="date_occurred"
          value={formData.date_occurred}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
          placeholder="Please provide detailed information about your grievance..."
          rows={5}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> Your grievance will be reviewed by our union representatives.
          You'll be notified of the outcome within 7 days.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading && <Loader className="w-4 h-4 animate-spin" />}
        {loading ? 'Submitting...' : 'Submit Grievance'}
      </button>
    </form>
  )
}
