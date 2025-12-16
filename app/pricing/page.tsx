import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Check } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '29',
      description: 'Perfecto para coaches que están comenzando',
      features: [
        'Hasta 10 clientes activos',
        'Sesiones ilimitadas',
        'Calendario y recordatorios',
        'Gestión de objetivos',
        'Métricas básicas',
        'Asistente IA incluido',
      ],
    },
    {
      name: 'Professional',
      price: '59',
      description: 'Para coaches con práctica establecida',
      features: [
        'Hasta 30 clientes activos',
        'Sesiones ilimitadas',
        'Calendario avanzado',
        'Gestión de objetivos',
        'Métricas avanzadas',
        'Asistente IA incluido',
        'Gestión de pagos',
        'Reportes personalizados',
      ],
      popular: true,
    },
    {
      name: 'Master',
      price: '99',
      description: 'Para coaches profesionales y equipos',
      features: [
        'Clientes ilimitados',
        'Sesiones ilimitadas',
        'Calendario avanzado',
        'Gestión completa de objetivos',
        'Métricas y analytics completos',
        'Asistente IA avanzado',
        'Gestión de pagos',
        'Reportes personalizados',
        'Soporte prioritario',
        'API de integración',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-slate-900 p-1.5 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">CoachHub</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Comenzar Gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Planes y Precios
          </h1>
          <p className="text-xl text-slate-600">
            Elige el plan que mejor se adapte a tu práctica de coaching
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? 'border-2 border-slate-900 relative' : ''}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Más Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-slate-600">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/register">Comenzar Ahora</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-4">
            Todos los planes incluyen 14 días de prueba gratuita
          </p>
          <p className="text-sm text-slate-500">
            Sin tarjeta de crédito requerida
          </p>
        </div>
      </section>

      <footer className="border-t bg-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>&copy; 2024 CoachHub. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
