import { Card, CardContent } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'

export default function AdminAuditPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Auditoría y Logs</h1>
                    <p className="text-slate-400 mt-2">Registro de actividad del sistema.</p>
                </div>
            </div>

            <Card className="bg-slate-900 border-slate-800 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">Próximamente</h3>
                    <p className="text-slate-500 max-w-sm mt-2">
                        El sistema de logs de auditoría está en desarrollo. Aquí podrás ver quién hizo qué y cuándo.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
