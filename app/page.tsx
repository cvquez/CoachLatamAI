import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, Users, Calendar, DollarSign, Target, TrendingUp, Sparkles, CheckCircle, Search, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-slate-900 p-1.5 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">CoachHub</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/marketplace">
                  <Search className="h-4 w-4 mr-2" />
                  Find a Coach
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/register?type=coach">Become a Coach</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Plataforma con IA integrada
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Conecta con el Coach Perfecto o Gestiona tu Práctica
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Encuentra coaches expertos certificados o gestiona tu práctica de coaching con herramientas inteligentes todo-en-uno.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Busco un Coach</h3>
                <p className="text-slate-600 mb-6">
                  Encuentra coaches expertos que te ayudarán a alcanzar tus metas
                </p>
                <Button size="lg" className="w-full" asChild>
                  <Link href="/marketplace">Explorar Coaches</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Soy Coach</h3>
                <p className="text-slate-600 mb-6">
                  Gestiona tu práctica y encuentra nuevos clientes fácilmente
                </p>
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href="/register?type=coach">Comenzar Gratis</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <Card>
            <CardContent className="p-6">
              <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Clientes</h3>
              <p className="text-slate-600">
                Mantén toda la información de tus clientes organizada. Notas, objetivos y progreso en un solo lugar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Calendario Inteligente</h3>
              <p className="text-slate-600">
                Agenda y gestiona sesiones fácilmente. Vista de calendario completa con recordatorios automáticos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="bg-orange-100 p-3 rounded-lg w-fit mb-4">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Control de Pagos</h3>
              <p className="text-slate-600">
                Registra pagos, genera reportes de ingresos y mantén tus finanzas bajo control.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seguimiento de Objetivos</h3>
              <p className="text-slate-600">
                Define y rastrea objetivos con tus clientes. Visualiza el progreso en tiempo real.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="bg-pink-100 p-3 rounded-lg w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Métricas y Analytics</h3>
              <p className="text-slate-600">
                Dashboard con métricas clave de tu práctica. Toma decisiones basadas en datos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="bg-cyan-100 p-3 rounded-lg w-fit mb-4">
                <Sparkles className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Asistente IA</h3>
              <p className="text-slate-600">
                Genera resúmenes de sesiones, recibe sugerencias y analiza el progreso de clientes con IA.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Para Clientes</h2>
            <p className="text-blue-100 mb-6">
              Descubre coaches certificados en el marketplace y comienza tu viaje de transformación personal
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Explora perfiles verificados</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Lee reseñas reales</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Contacta directamente</span>
              </li>
            </ul>
            <Button size="lg" variant="secondary" className="w-full" asChild>
              <Link href="/marketplace">Buscar Coaches</Link>
            </Button>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Para Coaches</h2>
            <p className="text-purple-100 mb-6">
              Gestiona tu práctica con herramientas profesionales y encuentra nuevos clientes
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Dashboard con IA</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Perfil en marketplace</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Gestión completa</span>
              </li>
            </ul>
            <Button size="lg" variant="secondary" className="w-full" asChild>
              <Link href="/register?type=coach">Comenzar Gratis</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>&copy; 2024 CoachHub. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
