'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, TrendingUp } from 'lucide-react'

interface DashboardStats {
  total_workers: number
  total_transactions: number
  pending_grievances: number
  average_prices: Record<string, number>
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsRes, activitiesRes] = await Promise.all([
          fetch('http://localhost:8000/api/reports/dashboard-stats'),
          fetch('http://localhost:8000/api/reports/recent-activities'),
        ])

        if (!statsRes.ok) throw new Error('Failed to fetch stats')
        if (!activitiesRes.ok) throw new Error('Failed to fetch activities')

        const statsData = await statsRes.json()
        const activitiesData = await activitiesRes.json()

        setStats(statsData)
        setActivities(activitiesData)
        setError(null)
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dui-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dui-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const chartData = [
    { name: 'Plastic', price: stats?.average_prices.plastic || 0 },
    { name: 'Paper', price: stats?.average_prices.paper || 0 },
    { name: 'Cardboard', price: stats?.average_prices.cardboard || 0 },
    { name: 'Aluminium', price: stats?.average_prices.aluminium || 0 },
  ]

  return (
    <div className="p-8 bg-dui-light min-h-screen">
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-dui-green mb-2">DUI Dashboard</h1>
        <p className="text-gray-600">Digital Union Initiative - Worker Collective Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Registered Workers</p>
              <p className="text-3xl font-bold text-dui-green">{stats?.total_workers || 0}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-dui-green opacity-20" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Transactions Recorded</p>
              <p className="text-3xl font-bold text-dui-green">{stats?.total_transactions || 0}</p>
            </div>
            <ArrowUpRight className="w-10 h-10 text-dui-accent opacity-30" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Pending Grievances</p>
              <p className="text-3xl font-bold text-orange-600">{stats?.pending_grievances || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div>
            <p className="text-gray-500 text-sm mb-1">Average Plastic Price</p>
            <p className="text-3xl font-bold text-dui-green">₹{stats?.average_prices.plastic?.toFixed(2) || '0.00'}/kg</p>
            <p className="text-xs text-gray-400 mt-1">(Demo data)</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-dui-green mb-4">Average Material Prices</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="price" fill="#1B5E20" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-dui-green mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-b-0">
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${activity.type === 'transaction' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                <div>
                  <p className="text-sm text-gray-700">{activity.description}</p>
                  <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/workers" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-dui-green mb-2">👥 Worker Profiles</h3>
          <p className="text-gray-600 text-sm">Manage worker memberships and identities</p>
        </Link>

        <Link href="/fairprice" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-dui-green mb-2">💰 FairPrice</h3>
          <p className="text-gray-600 text-sm">Compare recyclable material prices</p>
        </Link>

        <Link href="/transactions" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-dui-green mb-2">📊 Transactions</h3>
          <p className="text-gray-600 text-sm">View transaction history and records</p>
        </Link>
      </div>
    </div>
  )
}
