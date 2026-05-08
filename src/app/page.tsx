'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import {
  Zap,
  Shield,
  Clock,
  CheckCircle,
  Upload,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  FileText,
  Users,
  TrendingDown,
  Star,
  AlertCircle,
  Loader2,
  BadgeCheck,
  Sparkles,
  Phone,
  Mail,
  Receipt,
  Calendar,
  Banknote,
  CircleDollarSign,
  Play,
  Lock,
  PiggyBank,
  CircleCheck,
  Copy,
  QrCode,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ==================== TYPES ====================
interface CustomerData {
  nome: string
  cpf: string
  email: string
  telefone: string
  nomeTitular: string
  valorConta: string
  unidade: string
  billFile: File | null
}

interface PaymentResult {
  customerId: string
  nome: string
  status: string
  paymentStatus: string
  valorOriginal: number
  valorComDesconto: number
  economiaMensal: number
  economiaAnual: number
  validadeMeses: number
  dataAtivacao: string
  dataExpiracao: string
}

interface PixData {
  transactionId: string
  pixCode: string
  pixQrCode: string
  amount: number
}

type Step = 'home' | 'register' | 'contract' | 'payment' | 'confirmation'

// ==================== STATIC DATA (extracted outside component) ====================
const progressMap: Record<Step, number> = {
  home: 0,
  register: 25,
  contract: 50,
  payment: 75,
  confirmation: 100,
}

const stepIndicatorData = [
  { key: 'home', label: 'Início', icon: Zap },
  { key: 'register', label: 'Cadastro', icon: FileText },
  { key: 'contract', label: 'Contrato', icon: Shield },
  { key: 'payment', label: 'Pagamento', icon: CreditCard },
  { key: 'confirmation', label: 'Confirmação', icon: CheckCircle },
] as const

const statsData = [
  { value: '15.000+', label: 'Clientes Atendidos', desc: 'em todo o Brasil' },
  { value: '50%', label: 'Desconto Garantido', desc: 'na conta de luz' },
  { value: '12', label: 'Meses de Validade', desc: 'economia por 1 ano' },
  { value: '4.9', label: 'Nota de Satisfação', desc: 'avaliação média' },
]

const howItWorksData = [
  {
    step: '01',
    icon: FileText,
    title: 'Cadastre-se',
    desc: 'Preencha seus dados pessoais, informe o valor da conta de luz e envie a foto ou PDF da sua conta atual para análise.',
  },
  {
    step: '02',
    icon: TrendingDown,
    title: 'Economize 50%',
    desc: 'Após a aprovação do seu cadastro, a partir do próximo mês sua conta de luz chega com 50% de desconto por 12 meses!',
  },
]

const benefitsData = [
  {
    icon: Banknote,
    title: 'Economia Real',
    desc: 'Desconto de 50% aplicado diretamente na sua conta de luz. Se sua conta é R$ 300, passa a ser R$ 150.',
  },
  {
    icon: Clock,
    title: 'Resultado Rápido',
    desc: 'Após a aprovação do cadastro, a partir do próximo mês você já recebe a conta com o desconto aplicado.',
  },
  {
    icon: Shield,
    title: 'Processo Legal',
    desc: 'Todo o processo é realizado dentro da legalidade, seguindo as normas da ANEEL e distribuidoras de energia.',
  },
  {
    icon: Star,
    title: 'Sem Surpresas',
    desc: 'Transparência total em todo o processo. Sem mensalidades ocultas ou cobranças extras no futuro.',
  },
  {
    icon: Calendar,
    title: '12 Meses de Desconto',
    desc: 'O benefício é válido por 12 meses a partir da ativação. Economia garantida por um ano inteiro.',
  },
  {
    icon: BadgeCheck,
    title: 'Satisfação Garantida',
    desc: 'Mais de 15.000 clientes satisfeitos em todo o Brasil com avaliação média de 4.9/5 estrelas.',
  },
]

const testimonialsData = [
  {
    name: 'Maria Silva',
    city: 'São Paulo, SP',
    text: 'Minha conta era R$ 450 e agora pago R$ 225. Em 6 meses já economizei mais de R$ 1.300! Recomendo demais.',
    rating: 5,
  },
  {
    name: 'Carlos Oliveira',
    city: 'Rio de Janeiro, RJ',
    text: 'Fiquei desconfiado no começo, mas já no segundo mês a conta veio com metade do valor. Processo simples e rápido.',
    rating: 5,
  },
  {
    name: 'Ana Santos',
    city: 'Belo Horizonte, MG',
    text: 'Melhor investimento que fiz! Paguei a taxa uma vez e estou economizando há 8 meses. Vou renovar com certeza.',
    rating: 5,
  },
]

const faqData = [
  {
    q: 'Como funciona o desconto de 50% na conta de luz?',
    a: 'Após a aprovação do seu cadastro, realizamos todo o processo junto à distribuidora de energia da sua região. A partir do próximo mês, o desconto de 50% é aplicado diretamente na sua conta de luz, que já chega com o valor reduzido.',
  },
  {
    q: 'O desconto é realmente de 50%?',
    a: 'Sim! O desconto é de exatamente 50% sobre o valor total da sua conta de energia elétrica. Se sua conta era R$ 300,00, passará a ser R$ 150,00. O desconto é aplicado diretamente na fatura emitida pela distribuidora.',
  },
  {
    q: 'Por quanto tempo o desconto é válido?',
    a: 'O desconto é válido por 12 meses (1 ano) a partir da data de ativação. Após esse período, você pode renovar o serviço.',
  },
  {
    q: 'Preciso enviar minha conta de luz?',
    a: 'Sim, o envio da conta de luz atual é obrigatório para que possamos analisar seu consumo, identificar a distribuidora e dar entrada no processo. Aceitamos foto (JPG, PNG) ou PDF.',
  },
  {
    q: 'O serviço é legal e seguro?',
    a: 'Absolutamente! Todo o processo segue as normas e regulamentações da ANEEL (Agência Nacional de Energia Elétrica) e das distribuidoras de energia. Seus dados pessoais são protegidos pela LGPD.',
  },
  {
    q: 'Em quanto tempo o desconto começa a valer?',
    a: 'Após a aprovação do cadastro, o desconto passa a valer a partir da próxima fatura emitida pela distribuidora. Geralmente a ativação ocorre em até 5 dias úteis.',
  },
]

// ==================== HELPERS ====================
function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, '')
  const num = parseInt(digits || '0') / 100
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getCurrencyValue(value: string): number {
  const digits = value.replace(/\D/g, '')
  return parseInt(digits || '0') / 100
}

function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false

  // Reject known invalid patterns (all same digits)
  if (/^(\d)\1{10}$/.test(digits)) return false

  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10])) return false

  return true
}

// ==================== TAXA CONSULTORIA ====================
function getTaxaConsultoria(valorConta: string): number {
  return getCurrencyValue(valorConta) * 0.5
}

function formatTaxa(taxa: number): string {
  return taxa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function taxaToCents(taxa: number): number {
  return Math.round(taxa * 100)
}

// ==================== MAIN COMPONENT ====================
export default function Home() {
  const [step, setStep] = useState<Step>('home')
  const [isLoading, setIsLoading] = useState(false)
  const [customerId, setCustomerId] = useState<string>('')
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'pix'>('pix')
  const [contractAccepted, setContractAccepted] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [uploadFileName, setUploadFileName] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [pixCopied, setPixCopied] = useState(false)
  const [pollingPayment, setPollingPayment] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<CustomerData>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    nomeTitular: '',
    valorConta: '',
    unidade: '',
    billFile: null,
  })

  const contractNumber = useMemo(() => `${new Date().getFullYear()}/${Math.floor(Math.random() * 90000) + 10000}`, [])

  // ==================== HANDLERS ====================
  const handleInputChange = useCallback(
    (field: keyof CustomerData, value: string) => {
      if (field === 'cpf') {
        value = formatCPF(value)
      } else if (field === 'telefone') {
        value = formatPhone(value)
      } else if (field === 'valorConta') {
        value = formatCurrency(value)
      }
      setFormData((prev) => ({ ...prev, [field]: value }))
      setError('')
    },
    []
  )

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const allowed = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ]
        if (!allowed.includes(file.type)) {
          setError('Formato inválido. Envie PDF, JPG, PNG ou WebP.')
          return
        }
        if (file.size > 10 * 1024 * 1024) {
          setError('Arquivo muito grande. Máximo: 10MB.')
          return
        }
        setFormData((prev) => ({ ...prev, billFile: file }))
        setUploadFileName(file.name)
        setError('')
      }
    },
    []
  )

  const validateRegistration = useCallback((): boolean => {
    if (!formData.nome.trim()) {
      setError('Informe seu nome completo.')
      return false
    }
    if (formData.cpf.replace(/\D/g, '').length !== 11) {
      setError('Informe um CPF válido com 11 dígitos.')
      return false
    }
    if (!isValidCPF(formData.cpf)) {
      setError('CPF inválido. Informe um CPF válido.')
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Informe um e-mail válido.')
      return false
    }
    if (formData.telefone.replace(/\D/g, '').length < 10) {
      setError('Informe um telefone válido.')
      return false
    }
    if (!formData.nomeTitular.trim()) {
      setError('Informe o nome do titular da conta de luz.')
      return false
    }
    if (getCurrencyValue(formData.valorConta) < 50) {
      setError('Informe o valor da conta de luz (mínimo R$ 50,00).')
      return false
    }
    if (!formData.billFile) {
      setError('Envie a foto ou PDF da sua conta de luz.')
      return false
    }
    return true
  }, [formData])

  const handleRegister = useCallback(async () => {
    if (!validateRegistration()) return

    setIsLoading(true)
    setError('')

    try {
      const data = new FormData()
      data.append('nome', formData.nome)
      data.append('cpf', formData.cpf)
      data.append('email', formData.email)
      data.append('telefone', formData.telefone)
      data.append('valorConta', getCurrencyValue(formData.valorConta).toString())
      data.append('nomeTitular', formData.nomeTitular)
      data.append('unidade', formData.unidade)
      if (formData.billFile) {
        data.append('billFile', formData.billFile)
      }

      const res = await fetch('/api/register', { method: 'POST', body: data })
      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Erro ao cadastrar.')
        return
      }

      setCustomerId(result.customerId)
      setStep('contract')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [formData, validateRegistration])

  const handlePayment = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, paymentMethod }),
      })
      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Erro no pagamento.')
        return
      }

      // Store Pix data and show QR code
      if (result.data?.pixCode || result.data?.pixQrCode) {
        setPixData({
          transactionId: result.data.transactionId,
          pixCode: result.data.pixCode,
          pixQrCode: result.data.pixQrCode,
          amount: result.data.amount,
        })
        setPollingPayment(true)
      } else {
        // Fallback: if no pix data, go to confirmation
        setPaymentResult(result.data)
        setShowSuccessDialog(true)
        setTimeout(() => {
          setShowSuccessDialog(false)
          setStep('confirmation')
        }, 3000)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [customerId, paymentMethod])

  // Poll for payment status
  const checkPaymentStatus = useCallback(async () => {
    if (!customerId) return

    try {
      const res = await fetch(`/api/payment/status?customerId=${customerId}`)
      const result = await res.json()

      if (result.status === 'paid' && result.data) {
        setPollingPayment(false)
        setPaymentResult(result.data)
        setShowSuccessDialog(true)
        setTimeout(() => {
          setShowSuccessDialog(false)
          setStep('confirmation')
        }, 3000)
      }
    } catch {
      // Silent fail, will retry
    }
  }, [customerId])

  // Polling effect - check payment status every 5 seconds when waiting for Pix
  useEffect(() => {
    if (!pollingPayment || !customerId) return

    const interval = setInterval(() => {
      checkPaymentStatus()
    }, 5000)

    return () => clearInterval(interval)
  }, [pollingPayment, customerId, checkPaymentStatus])

  // ==================== RENDER HELPERS ====================
  const renderStepIndicator = () => (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        {stepIndicatorData.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                progressMap[step] >= progressMap[key as Step]
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground hidden sm:block">
              {label}
            </span>
          </div>
        ))}
      </div>
      <Progress value={progressMap[step]} className="h-2" />
    </div>
  )

  // ==================== HOME SECTION ====================
  const renderHome = () => (
    <div className="animate-in fade-in duration-500">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden text-white -mx-4 px-4 md:px-0" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #059669 0%, #0F172A 100%)' }}>
        {/* Background blurred shapes */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-400/40 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/40 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-12 flex flex-col justify-center" style={{ minHeight: '100vh' }}>
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16 py-16 md:py-0">
            {/* Left Column */}
            <div className="md:w-1/2 md:pr-12">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-3 py-1 mb-6">
                <span className="text-emerald-200 text-sm font-semibold">Eficiência Energética &amp; Mercado Livre</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
                Descubra se você pode economizar na sua conta de energia
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-lg">
                Análise personalizada para verificar oportunidades reais de economia com energia solar por assinatura ou mercado livre.
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 mb-10">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-gray-100 font-bold text-base px-8 h-12 rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-emerald-500/30 hover:shadow-xl"
                  onClick={() => setStep('register')}
                >
                  Fazer análise gratuita
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <button
                  className="text-white/90 font-medium hover:text-white flex items-center gap-2 transition-colors text-base"
                  onClick={() =>
                    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <Play className="w-5 h-5" />
                  Ver como funciona
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 text-white/60 text-sm">
                <div className="flex items-center gap-1.5">
                  <CircleCheck className="w-4 h-4" />
                  <span>100% Seguro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>Dados Protegidos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PiggyBank className="w-4 h-4" />
                  <span>Sem taxas antecipadas</span>
                </div>
              </div>
            </div>

            {/* Right Column - Estimate Card */}
            <div className="md:w-1/2 flex justify-center items-center relative">
              {/* Main Card */}
              <div className="bg-white/10 border border-white/20 rounded-3xl p-8 w-full max-w-lg shadow-2xl border-l-4 border-l-emerald-400 backdrop-blur-md relative">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-emerald-300 text-sm font-semibold">Estimativa de Economia</p>
                    <p className="text-white text-4xl font-bold mt-1">R$ 2.450<span className="text-lg text-white/60">/ano</span></p>
                  </div>
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                  <div className="bg-gradient-to-r from-emerald-400 to-blue-500 h-3 rounded-full" style={{ width: '65%' }} />
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-white/50">Conta Atual</p>
                    <p className="text-white font-semibold">R$ 650/mês</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-white/50">Nova Estimativa</p>
                    <p className="text-emerald-300 font-semibold">R$ 325/mês</p>
                  </div>
                </div>

                {/* Simulação Badge */}
                <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-lg border border-blue-400">
                  Simulação
                </div>
              </div>

              {/* Floating Notification */}
              <div className="absolute -top-2 right-0 md:top-4 md:right-4 bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="bg-white rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Análise Concluída</p>
                  <p className="text-white/70 text-xs">Cliente aprovado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm px-12 py-3">
          <p className="text-white/40 text-xs text-center">
            *Análise consultiva. Os descontos dependem de aprovação e elegibilidade. Não possuímos vínculo oficial com concessionárias de energia.
          </p>
        </div>
      </section>

      {/* ===== NUMBERS / SOCIAL PROOF ===== */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map(({ value, label, desc }) => (
              <div key={label} className="text-center group">
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight">{value}</p>
                <p className="text-sm font-semibold text-foreground mt-2">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-24 bg-gray-50/80">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Passo a Passo</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Como Funciona?</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-base">
              Processo simples e rápido para começar a economizar na sua conta de luz
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {howItWorksData.map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="relative">
                <Card className="relative overflow-hidden border-0 shadow-xl shadow-gray-200/60 bg-white rounded-2xl h-full hover:shadow-2xl hover:shadow-emerald-100/50 transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="text-6xl font-black text-emerald-50 absolute top-4 right-6">{step}</span>
                        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </CardContent>
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                </Card>
                {/* Arrow connector (only between cards) */}
                {i === 0 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-emerald-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENEFÍCIOS ===== */}
      <section id="vantagens" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Vantagens</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Por Que Escolher Nosso Serviço?</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-base">
              Motivos reais para confiar na nossa consultoria energética
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefitsData.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl bg-gradient-to-b from-white to-gray-50/50 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mb-4 group-hover:from-emerald-100 group-hover:to-emerald-200 transition-colors">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEPOIMENTOS ===== */}
      <section className="py-24 bg-gray-50/80">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Depoimentos</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">O Que Nossos Clientes Dizem</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonialsData.map(({ name, city, text, rating }) => (
              <Card key={name} className="border-0 shadow-xl shadow-gray-200/50 bg-white rounded-2xl hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-7">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">&ldquo;{text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200">
                      <span className="text-sm font-bold text-white">{name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{city}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Dúvidas</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Perguntas Frequentes</h2>
            <p className="text-muted-foreground mt-3 text-base">
              Tire suas principais dúvidas sobre o serviço
            </p>
          </div>
          <div className="space-y-3">
            {faqData.map(({ q, a }, i) => (
              <Card key={i} className="border border-gray-100 rounded-xl overflow-hidden hover:border-emerald-200/50 hover:shadow-md transition-all duration-200">
                <Accordion type="single" collapsible>
                  <AccordionItem value={`faq-${i}`} className="border-0">
                    <AccordionTrigger className="text-left text-sm font-semibold hover:text-emerald-600 hover:no-underline px-6 py-4">
                      {q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed px-6 pb-5">
                      {a}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-24 text-white" style={{ background: 'linear-gradient(135deg, #059669 0%, #0F172A 100%)' }}>
        <div className="relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
          <div className="max-w-3xl mx-auto px-4 md:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para economizar?
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto">
              Faça sua análise gratuita agora e descubra quanto pode economizar na sua conta de luz.
            </p>
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-gray-100 font-bold text-base px-10 h-14 rounded-xl shadow-xl shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
              onClick={() => setStep('register')}
            >
              Fazer análise gratuita
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-white/30 text-xs mt-6">
              Análise sem compromisso • Dados protegidos pela LGPD
            </p>
          </div>
        </div>
      </section>
    </div>
  )

  // ==================== REGISTRATION SECTION ====================
  const renderRegister = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-2xl mx-auto">
      <Card className="border-emerald-100 shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
          <FileText className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
          <CardTitle className="text-2xl">Cadastro para Desconto</CardTitle>
          <CardDescription className="text-emerald-100">
            Preencha seus dados e envie a conta de luz para iniciar o processo
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Nome Completo *
            </Label>
            <Input
              id="nome"
              placeholder="Digite seu nome completo"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className="border-emerald-200 focus:border-emerald-500"
            />
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf" className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              CPF *
            </Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              className="border-emerald-200 focus:border-emerald-500"
              maxLength={14}
            />
          </div>

          {/* Email e Telefone */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                Telefone *
              </Label>
              <Input
                id="telefone"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className="border-emerald-200 focus:border-emerald-500"
                maxLength={15}
              />
            </div>
          </div>

          {/* Nome Titular */}
          <div className="space-y-2">
            <Label htmlFor="nomeTitular" className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Nome do Titular da Conta de Luz *
            </Label>
            <Input
              id="nomeTitular"
              placeholder="Nome que aparece na conta de luz"
              value={formData.nomeTitular}
              onChange={(e) => handleInputChange('nomeTitular', e.target.value)}
              className="border-emerald-200 focus:border-emerald-500"
            />
          </div>

          {/* Valor da Conta e Unidade Consumidora */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorConta" className="flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-emerald-600" />
                Valor da Conta de Luz *
              </Label>
              <Input
                id="valorConta"
                placeholder="R$ 0,00"
                value={formData.valorConta}
                onChange={(e) => handleInputChange('valorConta', e.target.value)}
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidade" className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                Unidade Consumidora
              </Label>
              <Input
                id="unidade"
                placeholder="Opcional"
                value={formData.unidade}
                onChange={(e) => handleInputChange('unidade', e.target.value)}
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Preview da Economia */}
          {getCurrencyValue(formData.valorConta) >= 50 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm font-medium text-emerald-700 mb-1">
                Estimativa de Economia:
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor atual:</span>
                <span className="text-sm line-through text-red-500">
                  {formData.valorConta}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Com desconto (50%):</span>
                <span className="text-lg font-bold text-emerald-600">
                  {formatCurrency(
                    (getCurrencyValue(formData.valorConta) * 0.5 * 100).toString()
                  )}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Economia em 12 meses:</span>
                <span className="text-sm font-bold text-emerald-700">
                  {formatCurrency(
                    (getCurrencyValue(formData.valorConta) * 0.5 * 12 * 100).toString()
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Upload da Conta */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              Foto ou PDF da Conta de Luz *
            </Label>
            <div
              className="border-2 border-dashed border-emerald-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadFileName ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">
                    {uploadFileName}
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para enviar a foto ou PDF da sua conta de luz
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos aceitos: PDF, JPG, PNG, WebP (máx. 10MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setStep('home')
                setError('')
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  Continuar para Pagamento
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // ==================== CONTRACT SECTION ====================
  const renderContract = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-3xl mx-auto">
      <Card className="border-emerald-200 shadow-lg overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
          <Shield className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
          <CardTitle className="text-2xl">Contrato de Prestação de Serviços</CardTitle>
          <CardDescription className="text-emerald-100">
            Leia o contrato completo antes de prosseguir para o pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Contract Content */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-sm text-gray-700">
                  CONTRATO Nº {contractNumber}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">Leitura Obrigatória</Badge>
            </div>
            <div className="max-h-[500px] overflow-y-auto p-6 text-sm text-gray-700 leading-relaxed space-y-4" style={{ scrollbarWidth: 'thin' }}>
              <h3 className="text-base font-bold text-gray-900 text-center">
                CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CONSULTORIA ENERGÉTICA
              </h3>
              <p>
                Pelo presente instrumento particular, as partes:
              </p>
              <p>
                <strong>CONTRATADA:</strong> ECONOMIA ECOLOGICA ENERGY LTDA., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 53.029.100/0001-07, com sede na cidade de Fortaleza/CE, doravante denominada simplesmente <strong>&quot;CONTRATADA&quot;</strong>;
              </p>
              <p>
                <strong>CONTRATANTE:</strong> <span className="text-emerald-700 font-semibold">{formData.nome}</span>, portador(a) do CPF nº <span className="text-emerald-700 font-semibold">{formData.cpf}</span>, doravante denominado(a) simplesmente <strong>&quot;CONTRATANTE&quot;</strong>;
              </p>
              <p>
                Celebram o presente Contrato de Prestação de Serviços de Consultoria Energética, mediante as cláusulas e condições seguintes:
              </p>

              <Separator />

              <h4 className="font-bold text-gray-900">CLÁUSULA PRIMEIRA - DO OBJETO</h4>
              <p>
                1.1. O presente contrato tem por objeto a prestação de serviços de consultoria energética pela CONTRATADA em favor da CONTRATANTE, visando a obtenção de desconto de 50% (cinquenta por cento) na fatura de energia elétrica do imóvel vinculado à unidade consumidora declarada pela CONTRATANTE.
              </p>
              <p>
                1.2. O desconto será aplicado diretamente na fatura emitida pela distribuidora de energia elétrica competente, a partir do primeiro ciclo de faturamento subsequente à confirmação do pagamento da taxa de consultoria.
              </p>

              <h4 className="font-bold text-gray-900">CLÁUSULA SEGUNDA - DA TAXA DE CONSULTORIA</h4>
              <p>
                2.1. Pela prestação dos serviços objeto deste contrato, a CONTRATANTE pagará à CONTRATADA a taxa de consultoria no valor de <strong>{formatTaxa(getTaxaConsultoria(formData.valorConta))} (correspondente a 50% do valor da conta de energia)</strong>, em pagamento único, sem cobrança de mensalidades ou quaisquer valores adicionais.
              </p>
              <p>
                2.2. A taxa de consultoria cobre os custos de análise da conta de energia, processamento administrativo, protocolo junto à distribuidora e acompanhamento até a efetivação do desconto.
              </p>
              <p>
                2.3. O pagamento deverá ser realizado através de Pix, com aprovação imediata e ativação mais rápida do serviço.
              </p>

              <h4 className="font-bold text-gray-900">CLÁUSULA TERCEIRA - DA VIGÊNCIA</h4>
              <p>
                3.1. O desconto de 50% na fatura de energia elétrica terá vigência de <strong>12 (doze) meses</strong>, contados a partir da data de ativação do benefício, que ocorrerá no primeiro ciclo de faturamento subsequente à confirmação do pagamento.
              </p>
              <p>
                3.2. Findo o prazo de vigência, o desconto será automaticamente descontinuado, voltando a fatura ao seu valor integral, sem necessidade de notificação prévia.
              </p>
              <p>
                3.3. A CONTRATANTE poderá renovar o serviço mediante celebração de novo contrato e pagamento de nova taxa de consultoria.
              </p>

              <h4 className="font-bold text-gray-900">CLÁUSULA QUARTA - DAS OBRIGAÇÕES DA CONTRATANTE</h4>
              <p>
                4.1. Fornecer dados pessoais corretos e completos, incluindo nome completo, CPF, e-mail e telefone para contato.
              </p>
              <p>
                4.2. Informar o nome do titular da conta de energia elétrica e o valor atual da fatura.
              </p>
              <p>
                4.3. Encaminhar cópia da conta de energia elétrica atualizada (foto ou PDF) para análise e processamento.
              </p>
              <p>
                4.4. Efetuar o pagamento da taxa de consultoria no valor de {formatTaxa(getTaxaConsultoria(formData.valorConta))} conforme as formas de pagamento disponíveis.
              </p>
              <p>
                4.5. Manter a unidade consumidora ativa e regular junto à distribuidora durante todo o período de vigência do desconto.
              </p>

              <h4 className="font-bold text-gray-900">CLÁUSULA QUINTA - DAS OBRIGAÇÕES DA CONTRATADA</h4>
              <p>
                5.1. Realizar a análise da conta de energia elétrica encaminhada pela CONTRATANTE.
              </p>
              <p>
                5.2. Providenciar o processamento administrativo junto à distribuidora de energia para aplicação do desconto de 50%.
              </p>
              <p>
                5.3. Acompanhar o processo até a efetivação do desconto na fatura da CONTRATANTE.
              </p>
              <p>
                5.4. Garantir que o desconto seja aplicado a partir do primeiro ciclo de faturamento subsequente à confirmação do pagamento.
              </p>
              <p>
                5.5. Manter a CONTRATANTE informada sobre o andamento do processo.
              </p>

              <h4 className="font-bold text-gray-900">CLÁUSULA SEXTA - DA POLÍTICA DE CANCELAMENTO E REEMBOLSO</h4>
              <p>
                6.1. A CONTRATANTE poderá solicitar o cancelamento deste contrato no prazo de 7 (sete) dias corridos contados da data do pagamento da taxa de consultoria, conforme o artigo 49 do Código de Defesa do Consumidor.
              </p>
              <p>
                6.2. Em caso de cancelamento dentro do prazo de arrependimento, a CONTRATADA realizará o reembolso integral da taxa de consultoria em até 10 (dez) dias úteis.
              </p>
              <p>
                6.3. Após o prazo de arrependimento, não haverá reembolso da taxa de consultoria, visto que os serviços já terão sido iniciados.
              </p>

              <h4 className="font-bold text-gray-900">CLÁUSULA SÉTIMA - DA PROTEÇÃO DE DADOS</h4>
              <p>
                7.1. Os dados pessoais fornecidos pela CONTRATANTE serão tratados em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
              <p>
                7.2. Os dados coletados serão utilizados exclusivamente para a prestação dos serviços objeto deste contrato e para o cumprimento de obrigações legais e regulatórias.
              </p>
              <p>
                7.3. A CONTRATADA se compromete a adotar medidas de segurança técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas.
              </p>

              <h4 className="font-bold text-gray-900">CLÁUSULA OITAVA - DAS DISPOSIÇÕES GERAIS</h4>
              <p>
                8.1. Este contrato é regido pela legislação brasileira, em especial o Código Civil, o Código de Defesa do Consumidor e as normas da ANEEL (Agência Nacional de Energia Elétrica).
              </p>
              <p>
                8.2. Qualquer alteração nas condições deste contrato deverá ser comunicada previamente à CONTRATANTE.
              </p>
              <p>
                8.3. As partes elegem o foro da comarca do domicílio da CONTRATANTE para dirimir quaisquer dúvidas ou litígios decorrentes deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.
              </p>
              <p>
                8.4. O presente contrato entra em vigor na data da confirmação do pagamento da taxa de consultoria pela CONTRATANTE.
              </p>

              <Separator />

              <p className="text-center text-gray-500 text-xs">
                E, por estarem de acordo, as partes celebram o presente contrato na forma digital, através da aceitação eletrônica dos termos acima.
              </p>

              <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-xs text-gray-600">
                  <strong>CONTRATANTE:</strong> {formData.nome} | CPF: {formData.cpf}<br />
                  <strong>TITULAR DA CONTA:</strong> {formData.nomeTitular}<br />
                  <strong>VALOR DA TAXA:</strong> {formatTaxa(getTaxaConsultoria(formData.valorConta))} (pagamento único)<br />
                  <strong>DESconto:</strong> 50% na fatura de energia elétrica<br />
                  <strong>VIGÊNCIA:</strong> 12 meses a partir da ativação<br />
                  <strong>DATA:</strong> {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Accept Contract */}
          <div className="flex items-start gap-3 mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <Checkbox
              id="contract-accept"
              checked={contractAccepted}
              onCheckedChange={(checked) => {
                setContractAccepted(checked as boolean)
                setError('')
              }}
              className="mt-0.5"
            />
            <Label htmlFor="contract-accept" className="text-sm cursor-pointer">
              <span className="font-semibold text-emerald-800">
                Li e concordo com todos os termos do Contrato de Prestação de Serviços
              </span>
              <br />
              <span className="text-xs text-muted-foreground">
                Ao aceitar, você concorda com as cláusulas e condições descritas no contrato acima,
                incluindo a taxa de {formatTaxa(getTaxaConsultoria(formData.valorConta))}, a vigência de 12 meses e a política de cancelamento.
              </span>
            </Label>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setStep('register')
                setError('')
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Cadastro
            </Button>
            <Button
              className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6"
              onClick={() => {
                if (!contractAccepted) {
                  setError('Você precisa aceitar o contrato para prosseguir.')
                  return
                }
                setStep('payment')
              }}
            >
              <Shield className="w-4 h-4 mr-2" />
              Aceitar e Prosseguir ao Pagamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // ==================== PAYMENT SECTION ====================
  const renderPayment = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-2xl mx-auto">
      {/* Resumo do Cadastro */}
      <Card className="border-emerald-100 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Resumo do Cadastro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome:</span>
            <span className="font-medium">{formData.nome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CPF:</span>
            <span className="font-medium">{formData.cpf}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Titular:</span>
            <span className="font-medium">{formData.nomeTitular}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor atual da conta:</span>
            <span className="font-medium text-red-500 line-through">
              {formData.valorConta}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor com desconto (50%):</span>
            <span className="font-bold text-emerald-600 text-lg">
              {formatCurrency(
                (getCurrencyValue(formData.valorConta) * 0.5 * 100).toString()
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Conta de luz:</span>
            <span className="font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {uploadFileName}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Pix QR Code Display - shown after payment is initiated */}
      {pixData ? (
        <Card className="border-emerald-200 shadow-xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
            <QrCode className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
            <CardTitle className="text-2xl">Pagamento via Pix</CardTitle>
            <CardDescription className="text-emerald-100">
              Escaneie o QR Code ou copie o código Pix
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Valor */}
            <div className="text-center mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-muted-foreground mb-1">
                Valor a pagar
              </p>
              <p className="text-4xl font-bold text-emerald-700">{formatTaxa(getTaxaConsultoria(formData.valorConta))}</p>
            </div>

            {/* QR Code Image */}
            {pixData.pixQrCode && (
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                  <img
                    src={`data:image/png;base64,${pixData.pixQrCode}`}
                    alt="QR Code Pix"
                    className="w-64 h-64"
                  />
                </div>
              </div>
            )}

            {/* Pix Copypaste Code */}
            <div className="mb-6">
              <Label className="text-sm font-semibold mb-2 block">
                Código Pix (Copie e Cole)
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 break-all font-mono max-h-20 overflow-y-auto">
                  {pixData.pixCode}
                </div>
                <Button
                  variant="outline"
                  className="flex-shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.pixCode)
                    setPixCopied(true)
                    setTimeout(() => setPixCopied(false), 3000)
                  }}
                >
                  {pixCopied ? (
                    <Check className="w-4 h-4 mr-1 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {pixCopied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>

            {/* Polling Status */}
            {pollingPayment && (
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="font-semibold text-blue-700">
                    Aguardando pagamento...
                  </span>
                </div>
                <p className="text-xs text-blue-600">
                  Assim que o Pix for confirmado, você será redirecionado automaticamente.
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Instruções:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Abra o app do seu banco e escaneie o QR Code</li>
                  <li>Ou copie o código Pix e cole no app do banco</li>
                  <li>O pagamento é confirmado em segundos</li>
                  <li>Não feche esta página até a confirmação</li>
                </ul>
              </div>
            </div>

            {/* Manual check button */}
            <div className="text-center">
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-700"
                onClick={checkPaymentStatus}
              >
                <Shield className="w-4 h-4 mr-2" />
                Verificar pagamento
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Payment Form - shown before payment is initiated */
        <Card className="border-emerald-200 shadow-lg overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
            <CreditCard className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
            <CardTitle className="text-2xl">Pagamento da Taxa de Consultoria</CardTitle>
            <CardDescription className="text-emerald-100">
              Pagamento único - sem mensalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Valor da Taxa */}
            <div className="text-center mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-muted-foreground mb-1">
                Taxa de Consultoria (pagamento único)
              </p>
              <p className="text-4xl font-bold text-emerald-700">{formatTaxa(getTaxaConsultoria(formData.valorConta))}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Taxa correspondente a 50% do valor da sua conta de energia
              </p>
            </div>

            {/* Método de Pagamento - Apenas Pix */}
            <div className="space-y-3 mb-6">
              <Label className="text-base font-semibold">Forma de Pagamento</Label>
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-emerald-500">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Pix</span>
                  <p className="text-xs text-muted-foreground">Aprovação imediata</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>O desconto de 50% será aplicado a partir do próximo mês</li>
                  <li>O benefício é válido por 12 meses (1 ano)</li>
                  <li>A taxa de {formatTaxa(getTaxaConsultoria(formData.valorConta))} é cobrada apenas uma vez</li>
                  <li>Não há cobranças adicionais ou mensalidades</li>
                </ul>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep('contract')
                  setError('')
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6"
                onClick={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando Pix...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Pagar {formatTaxa(getTaxaConsultoria(formData.valorConta))} via Pix
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // ==================== CONFIRMATION SECTION ====================
  const renderConfirmation = () => {
    if (!paymentResult) return null

    const dataAtivacao = new Date(paymentResult.dataAtivacao).toLocaleDateString('pt-BR')
    const dataExpiracao = new Date(paymentResult.dataExpiracao).toLocaleDateString('pt-BR')

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
        {/* Success Card */}
        <Card className="border-emerald-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-center text-white">
            <div className="animate-in fade-in zoom-in-50 duration-500">
              <CheckCircle className="w-20 h-20 mx-auto mb-4 text-yellow-300" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Pagamento Confirmado!</h2>
            <p className="text-emerald-100">
              Seu desconto de 50% na conta de luz foi ativado com sucesso
            </p>
          </div>

          <CardContent className="pt-6 space-y-6">
            {/* Detalhes */}
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <h3 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Detalhes da Ativação
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{paymentResult.nome}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor original da conta:</span>
                  <span className="font-medium text-red-500 line-through">
                    R$ {paymentResult.valorOriginal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor com desconto (50%):</span>
                  <span className="text-xl font-bold text-emerald-600">
                    R$ {paymentResult.valorComDesconto.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Economia mensal:</span>
                  <span className="font-bold text-emerald-700">
                    R$ {paymentResult.economiaMensal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Economia anual (12 meses):</span>
                  <span className="text-lg font-bold text-emerald-700">
                    R$ {paymentResult.economiaAnual.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Data de ativação:</span>
                  <span className="font-medium">{dataAtivacao}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Válido até:</span>
                  <span className="font-medium">{dataExpiracao}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Período de desconto:</span>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    {paymentResult.validadeMeses} meses
                  </Badge>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Próximos passos:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      A partir do próximo mês, sua conta de luz já virá com 50% de desconto
                    </li>
                    <li>
                      O benefício é válido por 12 meses, até {dataExpiracao}
                    </li>
                    <li>
                      Você receberá a confirmação por e-mail em {formData.email}
                    </li>
                    <li>
                      Em caso de dúvidas, entre em contato com nosso suporte
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Aviso de economia */}
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-emerald-50 rounded-xl border border-yellow-200">
              <Sparkles className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-emerald-700">
                Você vai economizar{' '}
                R$ {paymentResult.economiaAnual.toFixed(2).replace('.', ',')}{' '}
                em 12 meses!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Investimento de {formatTaxa(getTaxaConsultoria(formData.valorConta))} = Retorno de{' '}
                R$ {paymentResult.economiaAnual.toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Nova simulação */}
            <div className="text-center">
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-700"
                onClick={() => {
                  setStep('home')
                  setFormData({
                    nome: '',
                    cpf: '',
                    email: '',
                    telefone: '',
                    nomeTitular: '',
                    valorConta: '',
                    unidade: '',
                    billFile: null,
                  })
                  setUploadFileName('')
                  setCustomerId('')
                  setPaymentResult(null)
                  setContractAccepted(false)
                  setError('')
                }}
              >
                Nova Simulação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        step === 'home' 
          ? 'bg-gradient-to-br from-[#059669] to-[#0a3d2e] text-white' 
          : 'bg-white shadow-sm'
      }`}>
        <div className="max-w-6xl mx-auto px-4 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${step === 'home' ? 'bg-white/20' : 'bg-emerald-100'}`}>
              <Zap className={`w-5 h-5 ${step === 'home' ? 'text-yellow-300 fill-yellow-300' : 'text-emerald-600'}`} />
            </div>
            <span className={`text-xl font-bold tracking-tight ${step === 'home' ? 'text-white' : 'text-emerald-800'}`}>
              Economia <span className={step === 'home' ? 'text-emerald-300' : 'text-emerald-500'}>Energy</span>
            </span>
          </div>

          {step === 'home' ? (
            <div className="hidden md:flex items-center space-x-8">
              <button
                className="text-white/80 hover:text-white transition-colors font-medium text-sm"
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Como Funciona
              </button>
              <button
                className="text-white/80 hover:text-white transition-colors font-medium text-sm"
                onClick={() => document.getElementById('vantagens')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Vantagens
              </button>
              <button
                className="text-white/80 hover:text-white transition-colors font-medium text-sm"
                onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
              >
                FAQ
              </button>
              <button
                className="bg-white/10 border border-white/20 text-white px-6 py-2 rounded-full font-semibold hover:bg-white/20 transition-colors text-sm backdrop-blur-sm"
                onClick={() => setStep('register')}
              >
                Entrar
              </button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600"
              onClick={() => {
                setStep('home')
                setError('')
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Início
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 w-full ${step === 'home' ? '' : 'max-w-5xl mx-auto px-4 py-8'}`}>
        {/* Step Indicator */}
        {step !== 'home' && renderStepIndicator()}

        {step === 'home' && <div key="home">{renderHome()}</div>}
        {step === 'register' && <div key="register" className="step-enter">{renderRegister()}</div>}
        {step === 'contract' && <div key="contract" className="step-enter">{renderContract()}</div>}
        {step === 'payment' && <div key="payment" className="step-enter">{renderPayment()}</div>}
        {step === 'confirmation' && (
          <div key="confirmation" className="step-enter">{renderConfirmation()}</div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-300" />
              </div>
              <span className="font-semibold text-emerald-800">
                Economia Energy
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Termos de Uso</span>
              <span>Política de Privacidade</span>
              <span>LGPD</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 Economia Energy. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="text-center">
          <DialogHeader>
            <div className="mx-auto mb-4">
              <div className="animate-in fade-in zoom-in-50 duration-300">
                <CheckCircle className="w-16 h-16 text-emerald-500" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-emerald-700">
              Pagamento Confirmado!
            </DialogTitle>
            <DialogDescription className="text-base">
              Seu desconto de 50% na conta de luz foi ativado com sucesso.
              <br />
              A partir do próximo mês, sua conta já virá com o desconto!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
