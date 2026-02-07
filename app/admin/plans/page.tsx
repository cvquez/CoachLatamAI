import { createClient } from '@/lib/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

async function getPlans() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true })

    if (error) {
        console.error('Error fetching plans:', error)
        return []
    }

    return data
}

export default async function AdminPlansPage() {
    const plans = await getPlans()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Planes de Suscripción</h1>
                    <p className="text-slate-400 mt-2">Configuración de niveles y precios.</p>
                </div>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-950/50">
                            <TableRow className="hover:bg-transparent border-slate-800">
                                <TableHead className="text-slate-400 pl-6">Nombre</TableHead>
                                <TableHead className="text-slate-400">Precio</TableHead>
                                <TableHead className="text-slate-400">Intervalo</TableHead>
                                <TableHead className="text-slate-400">PayPal Plan ID</TableHead>
                                <TableHead className="text-slate-400">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <BarChart3 className="w-8 h-8 text-slate-700" />
                                            <p>No hay planes configurados.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                plans.map((plan) => (
                                    <TableRow key={plan.id} className="hover:bg-slate-800/50 border-slate-800">
                                        <TableCell className="pl-6 font-medium text-slate-200">
                                            {plan.name}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            ${plan.price}
                                        </TableCell>
                                        <TableCell className="text-slate-400 capitalize">
                                            {plan.interval}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-slate-500">
                                            {plan.paypal_plan_id}
                                        </TableCell>
                                        <TableCell>
                                            {plan.is_active ? (
                                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                    Activo
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Inactivo</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
