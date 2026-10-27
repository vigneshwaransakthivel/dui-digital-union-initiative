'use client'

import { FormEvent, useState } from 'react'
import { transactionsAPI } from '@/app/lib/api'
import { AlertCircle, Loader, CheckCircle } from 'lucide-react'

interface TransactionFormProps {
  onSuccess?: () => void
  workerId?: string
}

const MATERIALS = ['Plastic', 'Paper', 'Cardboard', 'Aluminium', 'Glass', 'Metal']

export default function TransactionForm({
  onSuccess,
  workerId,
}: TransactionFormProps) {
  const [formData, setFormData] = useState({
    material: 'Plastic',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    notes: '',
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
      const submissionData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        price_per_unit: parseFloat(formData.price_per_unit),
        ...(workerId && { worker_id: workerId }),
      }

      await transactionsAPI.create(submissionData)

      setSuccess(true)
      setFormData({
        material: 'Plastic',
        quantity: '',
        unit: 'kg',
        price_per_unit: '',
        notes: '',
      })

      if (onSuccess) {
        setTimeout(onSuccess, 1500)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record transaction.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount =
    formData.quantity && formData.price_per_unit
      ? (parseFloat(formData.quantity) * parseFloat(formData.price_per_unit)).toFixed(2)
      : '0.00'

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
            Transaction recorded successfully!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Type *
          </label>
          <select
            name="material"
            value={formData.material}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
          >
            {MATERIALS.map((mat) => (
              <option key={mat} value={mat}>
                {mat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit *
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
          >
            <option value="kg">Kilogram (kg)</option>
            <option value="piece">Piece</option>
            <option value="bundle">Bundle</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity ({formData.unit}) *
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Per {formData.unit} (₹) *
          </label>
          <input
            type="number"
            name="price_per_unit"
            value={formData.price_per_unit}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total Amount (₹)
        </label>
        <div className="text-2xl font-bold text-dui-green">₹{totalAmount}</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
          placeholder="Any additional details about this transaction..."
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading && <Loader className="w-4 h-4 animate-spin" />}
        {loading ? 'Recording...' : 'Record Transaction'}
      </button>
    </form>
  )
}
