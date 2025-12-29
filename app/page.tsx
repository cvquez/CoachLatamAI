import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Users, Calendar, Target, TrendingUp, CheckCircle, Search, Star, Zap, Brain } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Navbar elegante */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-500 to-brand-cyan-500 rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-brand-blue-500 to-brand-cyan-500 p-2 rounded-xl shadow-brand-blue">
                  <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-brand-blue-600 to-brand-cyan-600 bg-clip-text text-transparent">
                  CoachLatamAI
                </span>
                <span className="text-[9px] text-brand-blue-500/70 font-medium tracking-widest uppercase">
                  AI-Powered Coaching
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-slate-600 hover:text-brand-blue-600">
                <Link href="/marketplace">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Coach
                </Link>
              </Button>
              <Button variant="ghost" asChild className="text-slate-600 hover:text-brand-blue-600">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-brand-blue-500 to-brand-cyan-500 hover:from-brand-blue-600 hover:to-brand-cyan-600 shadow-brand-blue">
                <Link href="/register?type=coach">Ser Coach</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section profesional */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          {/* Badge AI */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-blue-50 to-brand-cyan-50 border border-brand-blue-200 text-brand-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-soft">
            <Sparkles className="h-4 w-4" />
            Plataforma Potenciada por IA
            <Zap className="h-4 w-4" />
          </div>

          {/* Título principal con gradiente sutil */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-brand-blue-900 to-slate-900 bg-clip-text text-transparent">
              Conecta con el Coach Perfecto
            </span>
            <br />
            <span className="text-slate-700">
              o Gestiona tu Práctica
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Encuentra coaches expertos certificados o gestiona tu práctica de coaching con herramientas inteligentes profesionales.
          </p>

          {/* Tarjetas de acción con diseño delicado */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="border-2 border-brand-blue-100 hover:border-brand-blue-300 hover:shadow-brand-blue transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-brand-blue-50 to-brand-cyan-50 p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:shadow-brand-blue transition-shadow">
                  <Search className="h-8 w-8 text-brand-blue-600" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Busco un Coach</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Encuentra coaches expertos que te ayudarán a alcanzar tus metas personales y profesionales
                </p>
                <Button size="lg" className="w-full bg-gradient-to-r from-brand-blue-500 to-brand-cyan-500 hover:from-brand-blue-600 hover:to-brand-cyan-600 shadow-brand-blue" asChild>
                  <Link href="/marketplace">Explorar Coaches</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-purple-100 hover:border-brand-purple-300 hover:shadow-brand-purple transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-brand-purple-50 to-brand-purple-100 p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:shadow-brand-purple transition-shadow">
                  <Star className="h-8 w-8 text-brand-purple-600" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Soy Coach</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Gestiona tu práctica profesional y encuentra nuevos clientes con herramientas de IA
                </p>
                <Button size="lg" variant="outline" className="w-full border-2 border-brand-purple-300 text-brand-purple-700 hover:bg-brand-purple-50" asChild>
                  <Link href="/register?type=coach">Comenzar Gratis</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Características con diseño profesional */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="border border-slate-200 hover:shadow-soft-lg transition-all duration-300">
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-brand-blue-50 to-brand-cyan-50 p-3 rounded-xl w-fit mb-4 shadow-soft">
                <Users className="h-6 w-6 text-brand-blue-600" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Gestión de Clientes</h3>
              <p className="text-slate-600 leading-relaxed">
                Mantén toda la información de tus clientes organizada. Notas, objetivos y progreso en un solo lugar.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 hover:shadow-soft-lg transition-all duration-300">
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-brand-green-50 to-brand-green-100 p-3 rounded-xl w-fit mb-4 shadow-soft">
                <Calendar className="h-6 w-6 text-brand-green-600" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Calendario Inteligente</h3>
              <p className="text-slate-600 leading-relaxed">
                Programa y gestiona tus sesiones con recordatorios automáticos y sincronización de calendarios.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 hover:shadow-soft-lg transition-all duration-300">
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-brand-purple-50 to-brand-purple-100 p-3 rounded-xl w-fit mb-4 shadow-soft">
                <Target className="h-6 w-6 text-brand-purple-600" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Seguimiento de Metas</h3>
              <p className="text-slate-600 leading-relaxed">
                Define objetivos claros, mide el progreso y visualiza logros con dashboards intuitivos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-brand-blue-50 via-white to-brand-cyan-50 rounded-3xl p-12 text-center border border-brand-blue-100 shadow-soft-lg">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-soft">
              <Brain className="h-4 w-4 text-brand-blue-600" />
              <span className="text-brand-blue-700">Tecnología de IA Avanzada</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Comienza Hoy Mismo
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Únete a cientos de coaches y clientes que ya están transformando vidas
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-gradient-to-r from-brand-blue-500 to-brand-cyan-500 hover:from-brand-blue-600 hover:to-brand-cyan-600 shadow-brand-blue" asChild>
                <Link href="/register">
                  Comenzar Gratis
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-brand-blue-300 text-brand-blue-700 hover:bg-brand-blue-50" asChild>
                <Link href="/marketplace">
                  Ver Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer profesional */}
      <footer className="border-t bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2.5 mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-brand-blue-500 to-brand-cyan-500 p-2 rounded-xl">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-brand-blue-600 to-brand-cyan-600 bg-clip-text text-transparent">
                  CoachLatamAI
                </span>
                <span className="text-[9px] text-brand-blue-500/70 font-medium tracking-widest uppercase">
                  AI-Powered Coaching
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600">&copy; 2024 CoachLatamAI. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
