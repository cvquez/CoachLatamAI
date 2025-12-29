# ✅ CHECKLIST DE INSTALACIÓN - CoachLatamAI

Usa esta lista para verificar que todo está configurado correctamente.

## 📋 PRE-INSTALACIÓN

- [ ] Node.js instalado (versión 16+)
  - Verificar: `node --version`
  - Debe mostrar: v16.x.x o superior

- [ ] npm instalado
  - Verificar: `npm --version`
  - Debe mostrar: 8.x.x o superior

- [ ] Git instalado
  - Verificar: `git --version`

- [ ] Cuenta de Supabase creada
  - URL: https://supabase.com/

## 🗄️ CONFIGURACIÓN DE SUPABASE

- [ ] Proyecto de Supabase creado
  - Nombre del proyecto: _______________
  - Region: _______________

- [ ] Credenciales obtenidas
  - [ ] Project URL copiada
  - [ ] Anon key copiada

- [ ] Esquema base ejecutado
  - [ ] SETUP_BASE_SCHEMA.sql ejecutado exitosamente
  - [ ] Tablas verificadas en Table Editor:
    - [ ] users
    - [ ] clients
    - [ ] sessions

- [ ] Migraciones ejecutadas (8 en total)
  - [ ] Migración 1: update_users_coaching_fields_to_arrays
  - [ ] Migración 2: fix_user_registration
  - [ ] Migración 3: enhance_sessions_and_add_results
  - [ ] Migración 4: create_coaching_plans_system
  - [ ] Migración 5: create_progress_tracking_system
  - [ ] Migración 6: create_competency_evaluation_system
  - [ ] Migración 7: create_behavior_tracking_system
  - [ ] Migración 8: create_marketplace_system

- [ ] Row Level Security (RLS) verificado
  - [ ] RLS habilitado en todas las tablas
  - [ ] Políticas creadas correctamente

## 💻 CONFIGURACIÓN LOCAL

- [ ] Proyecto descargado/clonado
  - Ubicación: _______________

- [ ] Archivo .env.local creado
  - [ ] NEXT_PUBLIC_SUPABASE_URL configurado
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY configurado
  - [ ] OPENAI_API_KEY configurado (opcional)

- [ ] Dependencias instaladas
  - Ejecutar: `npm install`
  - Sin errores: [ ]

- [ ] Compilación exitosa
  - Ejecutar: `npm run build`
  - Sin errores: [ ]

## 🚀 EJECUCIÓN

- [ ] Servidor de desarrollo iniciado
  - Ejecutar: `npm run dev`
  - Puerto: 3000
  - URL: http://localhost:3000

- [ ] Aplicación accesible
  - [ ] Página de login/registro carga correctamente
  - [ ] No hay errores en consola del navegador (F12)

## 👤 PRIMER USUARIO

- [ ] Usuario registrado exitosamente
  - Email: _______________
  - Nombre: _______________

- [ ] Email verificado (si está habilitado)
  - [ ] Email de confirmación recibido
  - [ ] Link de verificación clickeado

- [ ] Login exitoso
  - [ ] Dashboard carga correctamente
  - [ ] Menú de navegación visible
  - [ ] Perfil accesible

## 🎯 FUNCIONALIDADES BÁSICAS

- [ ] Crear cliente funciona
  - [ ] Formulario se abre
  - [ ] Se puede guardar
  - [ ] Cliente aparece en la lista

- [ ] Crear sesión funciona
  - [ ] Formulario se abre
  - [ ] Se puede seleccionar cliente
  - [ ] Se puede agendar
  - [ ] Sesión aparece en la lista

- [ ] Dashboard muestra datos
  - [ ] Total de clientes
  - [ ] Próximas sesiones
  - [ ] Gráficos (si hay datos)

## 🔧 VERIFICACIONES TÉCNICAS

- [ ] No hay errores en consola del navegador
  - Abrir: F12 → Console
  - Debe estar limpia o solo warnings menores

- [ ] No hay errores en terminal del servidor
  - Revisar la terminal donde corre `npm run dev`

- [ ] Conexión a Supabase exitosa
  - Verificar en consola del navegador:
    "Supabase Client Config: url: SET, key: SET"

- [ ] Autenticación funciona
  - [ ] Logout funciona
  - [ ] Login nuevamente funciona
  - [ ] Sesión persiste al recargar página

## 📊 DATOS DE PRUEBA (Opcional)

- [ ] Cliente de prueba creado
- [ ] Sesión de prueba agendada
- [ ] Resultados de sesión registrados
- [ ] Plan de coaching creado
- [ ] Logro registrado

## ⚠️ SOLUCIÓN DE PROBLEMAS

Si algo no funciona, verifica:

1. **Error de conexión a Supabase**
   - [ ] .env.local existe
   - [ ] Variables tienen el prefijo NEXT_PUBLIC_
   - [ ] URL no tiene espacios ni caracteres extra
   - [ ] Servidor reiniciado después de cambiar .env.local

2. **Error "row-level security policy violation"**
   - [ ] RLS habilitado en todas las tablas
   - [ ] Políticas creadas correctamente
   - [ ] Usuario autenticado correctamente

3. **Error al compilar**
   - [ ] Todas las dependencias instaladas
   - [ ] Versión de Node.js es correcta
   - [ ] Cache limpiada: `rm -rf .next node_modules && npm install`

4. **Página en blanco**
   - [ ] Revisar consola del navegador (F12)
   - [ ] Revisar terminal del servidor
   - [ ] Verificar que el puerto 3000 no esté ocupado

## ✨ SIGUIENTE NIVEL

Una vez que todo funcione:

- [ ] Personalizar perfil de coach
- [ ] Configurar preferencias en Settings
- [ ] Explorar todas las secciones del dashboard
- [ ] Leer documentación de FASE 2 y FASE 3
- [ ] Configurar OpenAI para funciones de IA
- [ ] Considerar deployment a producción

## 📞 AYUDA

¿Necesitas ayuda?

1. Revisa la GUIA_INSTALACION_COACHLATAM.md
2. Consulta la sección "Solución de Problemas"
3. Revisa logs en consola y terminal
4. Verifica documentación de Supabase
5. Revisa el repositorio de GitHub

---

**Fecha de instalación**: _______________
**Versión**: 1.0.0
**Estado**: [ ] En progreso  [ ] Completado  [ ] Con problemas
