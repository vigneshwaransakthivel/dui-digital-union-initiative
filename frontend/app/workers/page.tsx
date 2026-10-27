'use client'

import { useState, useEffect } from 'react'
import { workersAPI } from '@/app/lib/api'
import DataTable from '@/app/components/DataTable'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'

interface Worker {
  id: string
  name: string
  email: string
  phone: string
  status: string
  joined_date: string
  membership_id?: string
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })

  const limit = 10

  useEffect(() => {
    fetchWorkers()
  }, [page])

  const fetchWorkers = async () => {
    try {
      setLoading(true)
      const response = await workersAPI.getAll(page, limit)
      setWorkers(response.data.workers || [])
      setTotal(response.data.total || 0)
      setError(null)
    } catch (err: any) {
      setError('Failed to fetch workers')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedWorker) {
        await workersAPI.update(selectedWorker.id, formData)
      } else {
        await workersAPI.create(formData)
      }
      fetchWorkers()
      setShowForm(false)
      setFormData({ name: '', email: '', phone: '' })
      setSelectedWorker(null)
    } catch (err) {
      setError('Failed to save worker')
      console.error(err)
    }
  }

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker)
    setFormData({ name: worker.name, email: worker.email, phone: worker.phone })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      try {
        await workersAPI.delete(id)
        fetchWorkers()
      } catch (err) {
        setError('Failed to delete worker')
        console.error(err)
      }
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedWorker(null)
    setFormData({ name: '', email: '', phone: '' })
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`badge ${value === 'active' ? 'badge-success' : 'badge-warning'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'joined_date',
      label: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  return (
    <div className="p-8 bg-dui-light min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-dui-green mb-2">Workers</h1>
          <p className="text-gray-600">Manage worker profiles and memberships</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus size={18} />
          Add Worker
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-dui-green mb-6">
              {selectedWorker ? 'Edit Worker' : 'Add New Worker'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Worker name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="worker@example.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 90000 00000"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {selectedWorker ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workers Table */}
      <DataTable
        columns={columns}
        data={workers}
        loading={loading}
        error={error}
        pagination={{
          page,
          total,
          limit,
          onPageChange: setPage,
        }}
        actions={(worker) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(worker)}
              className="p-2 hover:bg-blue-100 rounded transition-colors"
              title="Edit"
            >
              <Edit2 size={16} className="text-blue-600" />
            </button>
            <button
              onClick={() => handleDelete(worker.id)}
              className="p-2 hover:bg-red-100 rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={16} className="text-red-600" />
            </button>
          </div>
        )}
      />
    </div>
  )
}
