'use client'

import { useState, useEffect } from 'react'
import { pricingAPI } from '@/app/lib/api'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Price {
  id: string
  material: string
  price: number
  unit: string
  recorded_date: string
  recorded_by: string
}

interface MaterialStats {
  material: string
  average: number
  highest: number
  lowest: number
  latest: number
  trend: number
  data: any[]
}

export default function FairPricePage() {
  const [prices, setPrices] = useState<Price[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [materials, setMaterials] = useState<MaterialStats[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<string>('')
  const [view, setView] = useState<'grid' | 'chart'>('grid')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPrice, setNewPrice] = useState({ material: 'plastic', price: 0 })

  useEffect(() => {
    fetchPrices()
  }, [])

  useEffect(() => {
    if (prices.length > 0) {
      processMaterials()
    }
  }, [prices])

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const response = await pricingAPI.getAllPrices()
      setPrices(response.data || [])
      setError(null)
    } catch (err: any) {
      setError('Failed to fetch prices')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const processMaterials = () => {
    const grouped: Record<string, Price[]> = {}

    prices.forEach((p) => {
      if (!grouped[p.material]) {
        grouped[p.material] = []
      }
      grouped[p.material].push(p)
    })

    const stats: MaterialStats[] = Object.entries(grouped).map(([material, items]) => {
      const sortedItems = items.sort((a, b) =>
        new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()
      )
      const priceValues = sortedItems.map(p => p.price)
      const average = priceValues.reduce((a, b) => a + b, 0) / priceValues.length
      const highest = Math.max(...priceValues)
      const lowest = Math.min(...priceValues)
      const latest = sortedItems[0].price
      const previous = sortedItems[1]?.price || latest
      const trend = ((latest - previous) / previous) * 100

      return {
        material: material.charAt(0).toUpperCase() + material.slice(1),
        average: parseFloat(average.toFixed(2)),
        highest: parseFloat(highest.toFixed(2)),
        lowest: parseFloat(lowest.toFixed(2)),
        latest: parseFloat(latest.toFixed(2)),
        trend: parseFloat(trend.toFixed(2)),
        data: sortedItems.map(p => ({
          date: new Date(p.recorded_date).toLocaleDateString(),
          price: p.price,
          recorded_by: p.recorded_by,
        })),
      }
    })

    setMaterials(stats)
    if (stats.length > 0 && !selectedMaterial) {
      setSelectedMaterial(stats[0].material)
    }
  }

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await pricingAPI.addPrice({
        material: newPrice.material.toLowerCase(),
        price: parseFloat(String(newPrice.price)),
      })
      fetchPrices()
      setNewPrice({ material: 'plastic', price: 0 })
      setShowAddForm(false)
    } catch (err) {
      setError('Failed to add price')
      console.error(err)
    }
  }

  const selectedMaterialData = materials.find(m => m.material === selectedMaterial)

  if (loading) {
    return (
      <div className="p-8 bg-dui-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dui-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-dui-light min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-dui-green mb-2">FairPrice</h1>
          <p className="text-gray-600">Track and compare recyclable material prices</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary w-full md:w-auto"
        >
          + Add Price Record
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Add Price Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-dui-green mb-6">Add Price Record</h2>

            <form onSubmit={handleAddPrice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material
                </label>
                <select
                  value={newPrice.material}
                  onChange={(e) => setNewPrice({ ...newPrice, material: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
                >
                  <option value="plastic">Plastic</option>
                  <option value="paper">Paper</option>
                  <option value="cardboard">Cardboard</option>
                  <option value="metal">Metal</option>
                  <option value="aluminium">Aluminium</option>
                  <option value="glass">Glass</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPrice.price}
                  onChange={(e) => setNewPrice({ ...newPrice, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Add Price
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {materials.map((mat) => (
          <div
            key={mat.material}
            onClick={() => setSelectedMaterial(mat.material)}
            className={`card cursor-pointer transition-all ${
              selectedMaterial === mat.material
                ? 'ring-2 ring-dui-green shadow-lg'
                : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg text-dui-green">{mat.material}</h3>
              <div className={`flex items-center gap-1 ${mat.trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {mat.trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-xs font-bold">{Math.abs(mat.trend).toFixed(1)}%</span>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Latest:</span>
                <span className="font-bold text-dui-green">₹{mat.latest}/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className="font-mono">₹{mat.average}/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Range:</span>
                <span className="font-mono">₹{mat.lowest} - {mat.highest}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      {selectedMaterialData && (
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'grid'
                ? 'bg-dui-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Data
          </button>
          <button
            onClick={() => setView('chart')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'chart'
                ? 'bg-dui-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Chart
          </button>
        </div>
      )}

      {/* Chart or Table */}
      {selectedMaterialData && (
        <div className="card">
          <h2 className="text-xl font-semibold text-dui-green mb-6">
            {selectedMaterialData.material} Price Trend
          </h2>

          {view === 'chart' ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={selectedMaterialData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}/kg`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#1B5E20"
                  strokeWidth={2}
                  dot={{ fill: '#1B5E20', r: 4 }}
                  name="Price (₹/kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMaterialData.data.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{item.date}</td>
                      <td className="px-4 py-3 text-sm font-bold text-dui-green">₹{item.price}/kg</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.recorded_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
