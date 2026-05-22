🎵 ملفات الصوت لواجهات تسجيل الدخول (Auth Audio Sprite)


يحتوي هذا المجلد على المؤثرات الصوتية الخاصة بـ "رحلة تسجيل الدخول، إنشاء الحساب، ونسيت كلمة المرور" (Auth Flow). 
لضمان أعلى أداء (Performance) وسرعة استجابة (Zero Latency)، تم دمج جميع الأصوات في ملف **Audio Sprite** واحد لتجنب تحميل ملفات متعددة وتقليل الـ HTTP Requests.

## 📁 محتويات المجلد:
تم تصدير الـ Sprite بـ 3 صيغ لضمان التوافقية الكاملة (Fallback Strategy):
1. **`auth-sprite.webm`**: الخيار الافتراضي والأسرع لأغلب المتصفحات (بترميز Opus).
2. **`auth-sprite.m4a`**: مخصص لأجهزة Apple (iOS/macOS) لضمان أداء سلس.
3. **`auth-sprite.mp3`**: خيار احتياطي (Fallback) للأجهزة القديمة جداً.
4. **`auth-sprite.json`**: خريطة التوقيتات (Sprite Map) الجاهزة للاستخدام مباشرة مع مكتبة Howler.js.

---

## 💻 طريقة الاستخدام والمنطق (UX Logic)

يمكنكم استيراد ملف الـ JSON مباشرة لتكوين كائن الصوت، واستدعاء أي تأثير باستخدام الـ Key الخاص به. **يرجى الانتباه لمنطق التشغيل (Triggers Logic) لتجنب تضارب الأصوات، خصوصاً في أزرار الدخول:**

```javascript
import { Howl } from 'howler';
import authSpriteData from './auth-sprite.json'; // مسار ملف الجيسون

// 1. تهيئة الصوت (يُفضل عملها عند تحميل الصفحة Preload)
const authSounds = new Howl(authSpriteData);

// ❌ لا تقم بتشغيل صوت "النجاح/الانطلاق" بمجرد النقر
// ✅ قم بتشغيله فقط بعد التحقق من صحة البيانات (Success Response)

// 2. مثال تطبيقي على تشغيل الصوت عند الحدث:
async function handleLogin(credentials) {
  try {
    const response = await api.login(credentials);
    if (response.isSuccess) {
      // 🚀 تشغيل الصوت عند النجاح والانتقال للصفحة الرئيسية
      authSounds.play('btn-primary-launch'); 
      routeToHome();
    }
  } catch (error) {
    // ⚠️ تشغيل صوت الخطأ عند فشل الدخول
    authSounds.play('auth-error-msg'); 
    showErrorMessage();
  }
}

## 🎛️ قائمة التفاعلات المتاحة (Triggers List):

استخدم هذه الأسماء (Keys) بداخل دالة `play()` لتشغيل الصوت المناسب بالتحديد:

* **`btn-primary-launch`** : يُشغّل عند **نجاح** تسجيل الدخول والانتقال للوحة (مثال: ابدأ التعلم الآن 🚀).
* **`btn-register-launch`** : يُشغّل عند **نجاح** إنشاء الحساب الجديد (مثال: سجل وانطلق).
* **`auth-error-msg`** : يُشغّل عند **فشل التحقق** أو ظهور رسالة خطأ (مثل: كلمة المرور خاطئة).
* **`btn-secondary-action`** : مخصص للأزرار الثانوية والنوافذ المنبثقة (مثل: أرسل رابط، حفظ كلمة المرور).
* **`ui-eye-toggle`** : عند النقر على أيقونة كشف/إخفاء كلمة المرور 👁️.
* **`ui-checkbox-check`** : عند تحديد مربع الموافقة على الشروط ✅.
* **`ui-dropdown-open`** : عند فتح القائمة المنسدلة (مثال: اختيار الصف الدراسي).
* **`ui-theme-toggle`** : عند النقر على زر تبديل المظهر (ليلي/نهاري) ☀️🌙.
* **`ui-link-auth-switch`** : عند التبديل بين واجهة الدخول والتسجيل (مثل: ليس لديك حساب؟).
* **`ui-link-forget-pass`** : عند النقر على رابط "نسيت كلمة المرور".