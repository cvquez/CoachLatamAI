import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pagos</h1>
          <p className="text-slate-600 mt-1">Gestiona tus ingresos y pagos</p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                <DollarSign className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Módulo de pagos en desarrollo
              </h3>
              <p className="text-slate-600 max-w-sm">
                Pronto podrás gestionar todos tus pagos e ingresos desde aquí
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
