import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  output: "standalone", // Enable standalone output for Docker

  // Increase body size limit for Server Actions to support audio file uploads
  // Default is 1 MB, we increase it to 20 MB to support longer audio recordings
  serverActions: {
    bodySizeLimit: 20 * 1024 * 1024, // 20 MB in bytes (20971520 bytes)
  },

  redirects: async () => {
    return [
      // توجيه الصفحة الرئيسية إلى اللغة العربية (سيتم التحقق من تسجيل الدخول في الصفحة)
      {
        source: '/',
        destination: '/ar',
        permanent: false, // 302 للسماح بالتغيير الديناميكي
        locale: false
      },
      // إضافة اللغة الإنجليزية تلقائياً للمسارات المفقودة
      {
        source: '/((?!(?:en|fr|ar|front-pages|favicon.ico)\\b)):path',
        destination: '/en/:path',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
