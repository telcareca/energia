'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  DollarSign,
  Eye,
  TrendingUp,
  Search,
  LogOut,
  Lock,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  BarChart3,
  CreditCard,
  ArrowLeft,
} from 'lucide-react'

// ==================== TYPES ====================
interface Stats {
  customers: {
    total: number
    paid: number
    unpaid: number
    pendingPix: number
    today: number
    week: number
    month: number
  }
  revenue: { total: number }
  visits: {
    total: number
    today: number
    week: number
    month: number
    perDay: { date: string; count: number }[]
  }
}

interface Customer {
  id: string
  nome: string
  cpf: string
  email: string
  telefone: string
  valorConta: number
  nomeTitular: string
  unidade: string | null
  billFileName: string | null
  status: string
  paymentStatus: string
  paidAt: string | null
  createdAt: string
}

// ==================== MAIN COMPONENT ====================
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [stats, setStats] = useState<Stats | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [billModal, setBillModal] = useState<{ open: boolean; data: string | null; name: string | null }>({ open: false, data: null, name: null })
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers'>('dashboard')

  // ==================== AUTH ====================
  const handleLogin = useCallback(async () => {
    setIsLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (res.ok) {
        setIsLoggedIn(true)
      } else {
        setLoginError(data.error || 'Erro ao fazer login.')
      }
    } catch {
      setLoginError('Erro de conexão.')
    } finally {
      setIsLoading(false)
    }
  }, [password])

  const handleLogout = useCallback(async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    setIsLoggedIn(false)
    setStats(null)
    setCustomers([])
  }, [])

  // ==================== DATA FETCHING ====================
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch { /* silent */ }
  }, [])

  const fetchCustomers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/admin/customers?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers)
      }
    } catch { /* silent */ }
  }, [search, statusFilter])

  useEffect(() => {
    if (isLoggedIn && activeTab === 'dashboard') fetchStats()
  }, [isLoggedIn, activeTab, fetchStats])

  useEffect(() => {
    if (isLoggedIn && activeTab === 'customers') fetchCustomers()
  }, [isLoggedIn, activeTab, fetchCustomers])

  // ==================== BILL VIEWER ====================
  const viewBill = useCallback(async (customer: Customer) => {
    try {
      const res = await fetch(`/api/admin/bill?id=${customer.id}`)
      if (res.ok) {
        const data = await res.json()
        setBillModal({ open: true, data: data.fileData, name: data.fileName })
      }
    } catch { /* silent */ }
  }, [])

  // ==================== HELPERS ====================
  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" />Pago</span>
      case 'pending_pix':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" />Aguardando Pix</span>
      case 'unpaid':
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertCircle className="w-3 h-3" />Não pago</span>
    }
  }

  // ==================== LOGIN SCREEN ====================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Economia Energy</p>
          </div>
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{loginError}</div>
          )}
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setLoginError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg tracking-widest focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
            <button
              onClick={handleLogin}
              disabled={isLoading || !password}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ==================== ADMIN PANEL ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Economia Energy</h1>
              <p className="text-xs text-gray-500">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Ver site
            </a>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'customers' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            👥 Cadastros
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ===== DASHBOARD ===== */}
        {activeTab === 'dashboard' && stats && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.visits.total}</p>
                    <p className="text-xs text-gray-500">Visitas totais</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="text-emerald-600">Hoje: {stats.visits.today}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">Semana: {stats.visits.week}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.customers.total}</p>
                    <p className="text-xs text-gray-500">Cadastros</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="text-emerald-600">Hoje: {stats.customers.today}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">Semana: {stats.customers.week}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.customers.paid}</p>
                    <p className="text-xs text-gray-500">Pagos</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="text-red-500">Pendentes: {stats.customers.pendingPix + stats.customers.unpaid}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue.total)}</p>
                    <p className="text-xs text-gray-500">Receita</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visit Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Visitas nos últimos 7 dias
              </h3>
              <div className="flex items-end gap-2 h-40">
                {stats.visits.perDay.map((day) => {
                  const maxCount = Math.max(...stats.visits.perDay.map((d) => d.count), 1)
                  const height = (day.count / maxCount) * 100
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-gray-700">{day.count}</span>
                      <div className="w-full bg-emerald-100 rounded-t-md relative" style={{ height: `${Math.max(height, 4)}%` }}>
                        <div className="absolute inset-0 bg-emerald-500 rounded-t-md" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{day.date}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Conversion Summary */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">📈 Funil de Conversão</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Visitas → Cadastros</span>
                      <span className="font-medium">{stats.visits.total > 0 ? ((stats.customers.total / stats.visits.total) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.visits.total > 0 ? (stats.customers.total / stats.visits.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Cadastros → Pagamentos</span>
                      <span className="font-medium">{stats.customers.total > 0 ? ((stats.customers.paid / stats.customers.total) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.customers.total > 0 ? (stats.customers.paid / stats.customers.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">💳 Status dos Pagamentos</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                    <span className="text-sm text-emerald-700 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Pagos</span>
                    <span className="font-bold text-emerald-700">{stats.customers.paid}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <span className="text-sm text-yellow-700 flex items-center gap-2"><Clock className="w-4 h-4" /> Aguardando Pix</span>
                    <span className="font-bold text-yellow-700">{stats.customers.pendingPix}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Não pagos</span>
                    <span className="font-bold text-red-700">{stats.customers.unpaid}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== CUSTOMERS ===== */}
        {activeTab === 'customers' && (
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-emerald-500 outline-none"
              >
                <option value="all">Todos os status</option>
                <option value="paid">Pago</option>
                <option value="pending_pix">Aguardando Pix</option>
                <option value="unpaid">Não pago</option>
              </select>
            </div>

            {/* Customers count */}
            <p className="text-sm text-gray-500 mb-3">{customers.length} cadastro(s) encontrado(s)</p>

            {/* Customers List */}
            {customers.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum cadastro encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customers.map((c) => (
                  <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{c.nome}</h3>
                          {getStatusBadge(c.paymentStatus)}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span>CPF: {c.cpf}</span>
                          <span>Email: {c.email}</span>
                          <span>Tel: {c.telefone}</span>
                          <span>Conta: {formatCurrency(c.valorConta)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Titular: {c.nomeTitular} • Cadastro: {formatDate(c.createdAt)}
                          {c.paidAt && ` • Pago em: ${formatDate(c.paidAt)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.billFileName && (
                          <button
                            onClick={() => viewBill(c)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> Ver conta
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedCustomer(selectedCustomer?.id === c.id ? null : c)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          Detalhes
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {selectedCustomer?.id === c.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-400">ID</p>
                            <p className="font-mono text-xs text-gray-600">{c.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Unidade Consumidora</p>
                            <p className="text-gray-700">{c.unidade || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Status</p>
                            <p className="text-gray-700">{c.status}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Valor da Conta</p>
                            <p className="text-gray-700 font-medium">{formatCurrency(c.valorConta)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Taxa de Consultoria</p>
                            <p className="text-emerald-600 font-medium">{formatCurrency(c.valorConta * 0.5)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Arquivo da Conta</p>
                            <p className="text-gray-700">{c.billFileName || 'Não enviado'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bill Modal */}
      {billModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setBillModal({ open: false, data: null, name: null })}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">Conta de Luz - {billModal.name}</h3>
              <button onClick={() => setBillModal({ open: false, data: null, name: null })} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              {billModal.data && (
                <img
                  src={`data:image/png;base64,${billModal.data}`}
                  alt="Conta de luz"
                  className="max-w-full mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
