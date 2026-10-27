'use client'

import { useState, useEffect } from 'react'
import { membershipAPI, workersAPI } from '@/app/lib/api'
import QRCode from 'qrcode.react'
import { Download, RefreshCw } from 'lucide-react'

interface MembershipCard {
  id: string
  worker_id: string
  worker_name: string
  membership_number: string
  issue_date: string
  expiry_date: string
  status: string
  qr_code?: string
}

export default function MembershipPage() {
  const [memberships, setMemberships] = useState<MembershipCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMembership, setSelectedMembership] = useState<MembershipCard | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMemberships()
  }, [])

  const fetchMemberships = async () => {
    try {
      setLoading(true)
      const response = await membershipAPI.getAll()
      setMemberships(response.data || [])
      setError(null)
    } catch (err: any) {
      setError('Failed to fetch memberships')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQR = async (membership: MembershipCard) => {
    try {
      const response = await membershipAPI.generateQR(membership.worker_id)
      setSelectedMembership({
        ...membership,
        qr_code: response.data.qr_code,
      })
    } catch (err) {
      setError('Failed to generate QR code')
      console.error(err)
    }
  }

  const handleDownloadCard = (membership: MembershipCard) => {
    const qrElement = document.getElementById(`qr-${membership.id}`)
    if (qrElement) {
      const canvas = qrElement.querySelector('canvas')
      if (canvas) {
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `membership-${membership.membership_number}.png`
        link.click()
      }
    }
  }

  const filteredMemberships = memberships.filter(m =>
    m.worker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.membership_number.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="p-8 bg-dui-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dui-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading memberships...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-dui-light min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-dui-green mb-2">Membership Cards</h1>
        <p className="text-gray-600">Manage worker membership cards with QR codes</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 card flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by name or membership number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dui-green"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'grid'
                ? 'bg-dui-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'list'
                ? 'bg-dui-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List
          </button>
          <button
            onClick={fetchMemberships}
            className="p-2 bg-dui-accent text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {filteredMemberships.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No memberships found</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemberships.map((membership) => (
            <div key={membership.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-dui-green">{membership.worker_name}</h3>
                <span className={`badge ${
                  membership.status === 'active' ? 'badge-success' : 'badge-warning'
                }`}>
                  {membership.status}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-700">
                <div>
                  <span className="font-medium text-gray-600">ID:</span> {membership.membership_number}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Issued:</span>{' '}
                  {new Date(membership.issue_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Expires:</span>{' '}
                  {new Date(membership.expiry_date).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerateQR(membership)}
                  className="flex-1 btn-primary text-sm flex items-center justify-center gap-1"
                >
                  <RefreshCw size={14} />
                  QR Code
                </button>
                <button
                  onClick={() => handleDownloadCard(membership)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Member ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Issued</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expires</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMemberships.map((membership) => (
                <tr key={membership.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{membership.worker_name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{membership.membership_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(membership.issue_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(membership.expiry_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`badge ${
                      membership.status === 'active' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {membership.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button
                      onClick={() => handleGenerateQR(membership)}
                      className="text-dui-green hover:underline font-medium"
                    >
                      QR
                    </button>
                    <button
                      onClick={() => handleDownloadCard(membership)}
                      className="text-dui-accent hover:underline font-medium"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-dui-green mb-6 text-center">
              {selectedMembership.worker_name}
            </h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 flex justify-center">
              <div id={`qr-${selectedMembership.id}`}>
                <QRCode
                  value={selectedMembership.membership_number}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Membership ID:</span>
                <span className="font-mono font-bold">{selectedMembership.membership_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-bold text-green-600">{selectedMembership.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expires:</span>
                <span className="font-bold">
                  {new Date(selectedMembership.expiry_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDownloadCard(selectedMembership)}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={() => setSelectedMembership(null)}
                className="flex-1 btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
