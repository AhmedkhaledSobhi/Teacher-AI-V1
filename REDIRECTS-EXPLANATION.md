# شرح إعدادات إعادة التوجيه (Redirects) في next.config.ts

## المشكلة الحالية ⚠️

يوجد **تعارض** في الإعدادات الحالية:
- هناك **قاعدتان** لإعادة التوجيه من نفس المسار `/`
- القاعدة الأولى: `/` → `/ar/landing-page`
- القاعدة الثانية: `/` → `/ar/apps/chat`
- **القاعدة الثانية لن تعمل** لأن Next.js يستخدم القاعدة الأولى فقط

## شرح كل قاعدة

### 1. القاعدة الأولى (سطر 9-14)
```typescript
{
  source: '/',
  destination: '/ar/landing-page',
  permanent: true,
  locale: false
}
```

**الفائدة:**
- عندما يزور المستخدم الصفحة الرئيسية `/`
- يتم توجيهه تلقائياً إلى صفحة الهبوط بالعربية `/ar/landing-page`
- `permanent: true` = إعادة توجيه دائمة (301) - جيد لمحركات البحث
- `locale: false` = لا يستخدم نظام اللغات المدمج في Next.js

### 2. القاعدة الثانية (سطر 15-20) ❌ **لا تعمل**
```typescript
{
  source: '/',
  destination: '/ar/apps/chat',
  permanent: true,
  locale: false
}
```

**المشكلة:** هذه القاعدة لن تعمل أبداً لأن القاعدة الأولى تتعامل مع `/` أولاً

### 3. القاعدة الثالثة (سطر 21-26)
```typescript
{
  source: '/:lang(en|fr|ar)',
  destination: '/:lang/apps/chat',
  permanent: true,
  locale: false
}
```

**الفائدة:**
- عندما يزور المستخدم `/ar` أو `/en` أو `/fr` فقط
- يتم توجيهه تلقائياً إلى صفحة الدردشة بنفس اللغة
- مثال: `/ar` → `/ar/apps/chat`
- مثال: `/en` → `/en/apps/chat`

### 4. القاعدة الرابعة (سطر 27-32)
```typescript
{
  source: '/((?!(?:en|fr|ar|front-pages|favicon.ico)\\b)):path',
  destination: '/en/:path',
  permanent: true,
  locale: false
}
```

**الفائدة:**
- عندما يزور المستخدم مساراً بدون لغة
- يتم إضافة اللغة الإنجليزية تلقائياً
- مثال: `/about` → `/en/about`
- مثال: `/contact` → `/en/contact`
- **استثناءات:** لا يطبق على `en`, `fr`, `ar`, `front-pages`, `favicon.ico`

## الحل المقترح ✅

يجب حذف إحدى القاعدتين المتعارضتين. اختر واحداً من الخيارات:

### الخيار 1: توجيه إلى صفحة الهبوط (Landing Page)
```typescript
redirects: async () => {
  return [
    {
      source: '/',
      destination: '/ar/landing-page',
      permanent: true,
      locale: false
    },
    {
      source: '/:lang(en|fr|ar)',
      destination: '/:lang/landing-page', // أو '/:lang/apps/chat' حسب الحاجة
      permanent: true,
      locale: false
    },
    {
      source: '/((?!(?:en|fr|ar|front-pages|favicon.ico)\\b)):path',
      destination: '/en/:path',
      permanent: true,
      locale: false
    }
  ]
}
```

### الخيار 2: توجيه مباشر إلى الدردشة (Chat)
```typescript
redirects: async () => {
  return [
    {
      source: '/',
      destination: '/ar/apps/chat',
      permanent: true,
      locale: false
    },
    {
      source: '/:lang(en|fr|ar)',
      destination: '/:lang/apps/chat',
      permanent: true,
      locale: false
    },
    {
      source: '/((?!(?:en|fr|ar|front-pages|favicon.ico)\\b)):path',
      destination: '/en/:path',
      permanent: true,
      locale: false
    }
  ]
}
```

### الخيار 3: توجيه ذكي حسب حالة تسجيل الدخول
```typescript
redirects: async () => {
  return [
    {
      source: '/',
      destination: '/ar/landing-page', // للمستخدمين غير المسجلين
      permanent: false, // 302 بدلاً من 301 للسماح بالتغيير
      locale: false
    },
    {
      source: '/:lang(en|fr|ar)',
      destination: '/:lang/landing-page',
      permanent: false,
      locale: false
    },
    {
      source: '/((?!(?:en|fr|ar|front-pages|favicon.ico)\\b)):path',
      destination: '/en/:path',
      permanent: true,
      locale: false
    }
  ]
}
```

**ملاحظة:** للتوجيه الذكي حسب حالة تسجيل الدخول، يجب استخدام `AuthGuard` أو `ConditionalAuth` في المكونات بدلاً من redirects.

## الفوائد العامة لإعدادات إعادة التوجيه

1. **تجربة مستخدم أفضل:** توجيه تلقائي للمستخدمين إلى الصفحة الصحيحة
2. **SEO:** إعادة التوجيه الدائمة (301) تساعد محركات البحث
3. **دعم متعدد اللغات:** توجيه تلقائي للغة الصحيحة
4. **URLs نظيفة:** إضافة اللغة تلقائياً للمسارات المفقودة

## التوصية

استخدم **الخيار 1** إذا كنت تريد أن يرى المستخدمون صفحة الهبوط أولاً، ثم يمكنهم تسجيل الدخول للوصول إلى الدردشة.

