# 🚀 Guía de Despliegue - Restaurante POS

## 📋 Requisitos Previos

✅ Tu aplicación está lista para desplegar con:
- **Build optimizado**: 495KB (gzipped: 145KB)
- **Archivos estáticos**: Generados en la carpeta `dist/`
- **Variables de entorno**: Configuradas en `.env`
- **Dependencias**: Todas instaladas y funcionando

## 🌐 Opciones de Despliegue

### 1. 🆓 Vercel (Recomendado para React)

**Pasos:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
cd "c:\Users\carli\Downloads\mi-pos\web"
vercel --prod
```

**Ventajas:**
- ✅ Despliegue automático desde GitHub
- ✅ CDN global rápido
- ✅ HTTPS automático
- ✅ Dominio personalizado gratis
- ✅ Optimizado para React/Vite

### 2. 🌟 Netlify

**Pasos:**
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
cd "c:\Users\carli\Downloads\mi-pos\web"
netlify deploy --prod --dir=dist
```

**Ventajas:**
- ✅ Fácil configuración
- ✅ Forms gratuitos
- ✅ Edge functions
- ✅ Despliegue continuo

### 3. 🔥 Firebase Hosting

**Pasos:**
```bash
# Instalar Firebase CLI
npm i -g firebase-tools

# Inicializar (solo primera vez)
firebase init hosting

# Desplegar
firebase deploy --only hosting
```

### 4. 🐳 Docker (Para servidores propios)

**Crear Dockerfile:**
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## ⚙️ Configuración de Variables de Entorno

**Importante:** Configura estas variables en tu plataforma de despliegue:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_key_anonima
```

## 🎯 Despliegue Rápido con Vercel (Recomendado)

### Método 1: Arrastrar y Soltar
1. Ve a [vercel.com](https://vercel.com)
2. Crea cuenta gratuita
3. Arrastra la carpeta `dist/` al sitio
4. Configura las variables de entorno

### Método 2: GitHub Integration
1. Sube tu código a GitHub
2. Conecta Vercel a tu repo
3. Configura las variables de entorno
4. Despliegue automático en cada push

## 🔧 Archivos de Configuración

### `vercel.json` (Opcional)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### `netlify.toml` (Opcional)
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
```

## 📊 Características de tu App

✅ **PWA Ready**: Puede instalarse como app
✅ **SEO Optimizado**: Meta tags y estructura semántica
✅ **Performance**: 495KB total, 145KB gzipped
✅ **Responsive**: Funciona en todos los dispositivos
✅ **TypeScript**: Código tipo seguro
✅ **Modern Stack**: React 19 + Vite + Tailwind

## 🌍 Dominio Personalizado

Después del despliegue, puedes configurar:
- **Dominio personal**: `turingrestaurante.com`
- **SSL Certificate**: Automático y gratuito
- **Email personal**: Con tu dominio

## 📱 PWA Features

Tu app incluye:
- **Manifest**: Para instalación en homescreen
- **Service Worker**: Para funcionamiento offline
- **Responsive Design**: Adaptado a móviles

## 🚀 Comandos Útiles

```bash
# Build para producción
npm run build

# Preview local del build
npm run preview

# Limpieza antes de desplegar
rm -rf dist node_modules
npm install
npm run build
```

## 🎯 Recomendación

**Usa Vercel** para el mejor rendimiento y facilidad de uso:
1. Más rápido para React/Vite
2. Mejor CDN global
3. Configuración más simple
4. Despliegue automático

## 📞 Soporte

Si necesitas ayuda durante el despliegue:
1. Revisa los logs de la plataforma
2. Verifica las variables de entorno
3. Asegúrate que el build sea exitoso

---

**¡Tu Restaurante POS está listo para el mundo!** 🎉
