'use client'

import { useState, useEffect } from 'react'
import { transactionsAPI } from '@/app/lib/api'
import TransactionForm from '@/app/components/TransactionForm'
import { ArrowUpRight, Search, Plus, Loader, AlertCircle, Filter } from 'lucide-react'

interface Transaction {
  id: string
  material: string
  quantity: number
  unit: string
  price_per_unit: number
  total_amount: number
  timestamp: string
  notes?: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMaterial, setFilterMaterial] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [page, setPage] = useState(1)

  const materials = ['Plastic', 'Paper', 'Cardboard', 'Aluminium', 'Glass', 'Metal']

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await transactionsAPI.getAll(page, 20)
      setTransactions(response.data.transactions || [])
      setError(null)
    } catch (err: any) {
      setError('Failed to load transactions')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [page])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMaterial =
      filterMaterial === 'all' ||
      transaction.material.toLowerCase() === filterMaterial.toLowerCase()
    return matchesSearch && matchesMaterial
  })

  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + t.total_amount,
    0
  )

  return (
    <div className="p-8 bg-dui-light min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-dui-green mb-2">Transactions</h1>
          <p className="text-gray-600">Track and record your material sales</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 w-full md:w-auto"
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'New Transaction'}
        </button>
      </div>

      {/* Record Transaction Form */}
      {showForm && (
        <div className="card mb-8 border-2 border-dui-green">
          <h2 className="text-2xl font-semibold text-dui-green mb-4">
            Record New Transaction
          </h2>
          <TransactionForm
            onSuccess={() => {
              setShowForm(false)
              fetchTransactions()
            }}
          />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-gray-500 text-sm mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-dui-green">
            {filteredTransactions.length}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-500 text-sm mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-dui-green">
            ₹{totalAmount.toFixed(2)}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-500 text-sm mb-1">Avg. Transaction</p>
          <p className="text-3xl font-bold text-dui-green">
            {filteredTransactions.length > 0
              ? `₹${(totalAmount / filteredTransactions.length).toFixed(2)}`
              : '₹0.00'}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by material or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
          >
            <option value="all">All Materials</option>
            {materials.map((material) => (
              <option key={material} value={material.toLowerCase()}>
                {material}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-dui-green animate-spin" />
        </div>
      )}

      {/* Transactions Table */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-dui-green">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Material</th>
                <th className="text-left py-3 px-4 font-semibold">Quantity</th>
                <th className="text-left py-3 px-4 font-semibold">Rate</th>
                <th className="text-left py-3 px-4 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-left py-3 px-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                )
                .map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="badge badge-info">{transaction.material}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {transaction.quantity} {transaction.unit}
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      ₹{transaction.price_per_unit.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-dui-green">
                      ₹{transaction.total_amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-xs">
                      {transaction.notes ? transaction.notes.substring(0, 30) : '-'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTransactions.length === 0 && !error && (
        <div className="card text-center py-12">
          <ArrowUpRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No transactions found' : 'No transactions yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Start by recording your first transaction'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && transactions.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={transactions.length < 20}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
