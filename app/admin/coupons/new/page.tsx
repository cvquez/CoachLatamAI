'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const formSchema = z.object({
    code: z.string().min(3, 'Mínimo 3 caracteres').regex(/^[A-Z0-9_-]+$/, 'Solo mayúsculas, números, guiones'),
    description: z.string().optional(),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.coerce.number().min(1, 'Debe ser mayor a 0'),
    max_uses: z.coerce.number().optional().nullable(),
    valid_until: z.date().optional(),
})

export default function NewCouponPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: '',
            description: '',
            discount_type: 'percentage',
            discount_value: 0,
            max_uses: null,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const { error } = await supabase.from('coupons').insert({
                code: values.code,
                description: values.description,
                discount_type: values.discount_type,
                discount_value: values.discount_value,
                max_uses: values.max_uses,
                valid_until: values.valid_until ? values.valid_until.toISOString() : null,
                is_active: true,
            })

            if (error) throw error

            toast({
                title: 'Cupón creado',
                description: `El cupón ${values.code} ha sido creado exitosamente.`,
            })

            router.push('/admin/coupons')
            router.refresh()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'No se pudo crear el cupón',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nuevo Cupón</h1>
                <p className="text-slate-400 mt-2">Crea un nuevo código de descuento para suscriptores.</p>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-200">Código del Cupón</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="ej. VERANO2026"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                className="bg-slate-950 border-slate-700 text-white font-mono uppercase"
                                            />
                                        </FormControl>
                                        <FormDescription>Único, mayúsculas y números.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="discount_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-200">Tipo de Descuento</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                                                        <SelectValue placeholder="Selecciona tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                                                    <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="discount_value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-200">Valor</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    {...field}
                                                    className="bg-slate-950 border-slate-700 text-white"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="max_uses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-200">Límite de Usos (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Ilimitado"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    className="bg-slate-950 border-slate-700 text-white"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="valid_until"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-slate-200">Válido Hasta (Opcional)</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal bg-slate-950 border-slate-700 text-white hover:bg-slate-900",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Seleccionar fecha</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < new Date()
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-200">Descripción Interna</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Para promoción de verano..."
                                                {...field}
                                                className="bg-slate-950 border-slate-700 text-white"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-slate-400 hover:text-white"
                                    onClick={() => router.back()}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Crear Cupón
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
