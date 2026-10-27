'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, LogOut } from 'lucide-react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState('worker')

  const menuItems = [
    { href: '/', label: '📊 Dashboard', icon: 'chart' },
    { href: '/workers', label: '👥 Workers', icon: 'users' },
    { href: '/membership', label: '🪪 Membership Cards', icon: 'card' },
    { href: '/fairprice', label: '💰 FairPrice', icon: 'price' },
    { href: '/transactions', label: '📈 Transactions', icon: 'trans' },
    { href: '/grievances', label: '⚠️ Grievances', icon: 'grievance' },
    ...(role === 'admin' ? [{ href: '/reports', label: '📋 Reports', icon: 'report' }] : []),
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-dui-green text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`${
        isOpen ? 'fixed inset-0 z-40' : 'hidden md:block'
      } w-64 bg-dui-green text-white h-screen overflow-y-auto md:relative`}>
        {isOpen && (
          <div className="md:hidden pt-16"></div>
        )}

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8 mt-4 md:mt-0">
            DUI
          </h1>
          <p className="text-green-100 text-xs mb-6">Digital Union Initiative</p>

          {/* Role Switcher */}
          <div className="bg-green-700 rounded-lg p-3 mb-6">
            <label className="text-xs text-green-100 block mb-2">Demo Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-green-600 text-white rounded px-2 py-1 text-sm focus:outline-none"
            >
              <option value="worker">👤 Worker</option>
              <option value="admin">🔐 Admin</option>
            </select>
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-green-700">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm transition-colors">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  )
}
