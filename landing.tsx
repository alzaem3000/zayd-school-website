import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BookOpen,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  ClipboardCheck,
  BellRing,
  ArrowLeft,
  Building2,
  Target,
  Users,
  FileCheck2,
  Sparkles,
  Lock,
} from "lucide-react";

import { Button } from "./button";
import { Card, CardContent } from "./card";
import { ThemeToggle } from "./theme-toggle";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl" data-testid="page-landing">
      <BackgroundDecor />

      <header className="sticky top-0 z-40 backdrop-blur bg-background/90 border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">منصة مؤسسية</p>
              <h1 className="font-bold text-lg md:text-xl">تقييم أداء المعلمين</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" className="font-semibold" data-testid="button-login-header">
                تسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              متوافق مع نموذج تقييم الأداء الوظيفي
            </div>

            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-5">
              منصة رسمية لإدارة
              <span className="block text-primary">تقييم أداء المعلمين</span>
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8" data-testid="text-hero-subtitle">
              نظام رقمي متكامل لتوثيق الشواهد، متابعة المؤشرات، اعتماد النتائج، وإصدار تقارير موثوقة تدعم
              التحسين المستمر ورفع جودة التعليم.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <Link href="/login" data-testid="link-get-started">
                <Button size="lg" className="font-bold px-8" data-testid="button-get-started">
                  ابدأ الآن
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="font-semibold px-8">
                  استعراض المزايا
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard icon={<Users className="h-5 w-5" />} title="إدارة المستخدمين" subtitle="صلاحيات متعددة" />
              <StatCard icon={<Target className="h-5 w-5" />} title="مؤشرات دقيقة" subtitle="متابعة مستمرة" />
              <StatCard icon={<FileCheck2 className="h-5 w-5" />} title="شواهد موثقة" subtitle="رفع واعتماد" />
              <StatCard icon={<BarChart3 className="h-5 w-5" />} title="تقارير تحليلية" subtitle="دعم القرار" />
            </div>
          </motion.div>
        </section>

        <section id="features" className="container mx-auto px-4 md:px-6 py-14 md:py-16">
          <SectionHeading
            title="مزايا المنصة"
            description="تم تصميم المنصة لتلائم بيئة المدرسة وتدعم رحلة التقييم من التخطيط وحتى الاعتماد النهائي."
          />

          <div className="grid md:grid-cols-3 gap-5 mt-8">
            <FeatureCard icon={<ClipboardCheck className="h-7 w-7 text-primary" />} title="إدارة مؤشرات الأداء" description="إضافة وتنظيم مؤشرات التقييم وربطها بالمعايير المهنية بطريقة واضحة وقابلة للقياس." />
            <FeatureCard icon={<BookOpen className="h-7 w-7 text-primary" />} title="توثيق الشواهد" description="رفع ملفات الشواهد وربطها بالمؤشر المناسب مع دعم التصنيف وإمكانية المراجعة." />
            <FeatureCard icon={<CheckCircle2 className="h-7 w-7 text-primary" />} title="سير اعتماد رسمي" description="مسار تدقيق واعتماد منظم بين المعلم والإدارة مع حفظ الأثر والملاحظات." />
            <FeatureCard icon={<BellRing className="h-7 w-7 text-primary" />} title="إشعارات فورية" description="تنبيهات آنية للتغييرات والطلبات الجديدة لضمان سرعة الاستجابة والمتابعة." />
            <FeatureCard icon={<BarChart3 className="h-7 w-7 text-primary" />} title="تحليلات وتقارير" description="تقارير أداء مرئية تدعم القيادة المدرسية في المتابعة واتخاذ القرار." />
            <FeatureCard icon={<Lock className="h-7 w-7 text-primary" />} title="أمان وصلاحيات" description="إدارة أدوار وصلاحيات (معلم، مدير، منشئ) لضمان وصول مناسب وحماية البيانات." />
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-14 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeading
              title="آلية العمل"
              description="رحلة مبسطة وواضحة تبدأ من إدخال البيانات وتنتهي بتقرير أداء احترافي."
            />

            <div className="grid md:grid-cols-3 gap-6 mt-10">
              <StepCard number="1" icon={<GraduationCap className="h-6 w-6" />} title="تهيئة الحساب" description="يدخل المعلم ويُكمل البيانات الأساسية المرتبطة بملف الأداء." />
              <StepCard number="2" icon={<Building2 className="h-6 w-6" />} title="إدخال المؤشرات والشواهد" description="يوثق المعلم إنجازاته ويربط كل شاهد بالمؤشر المناسب." />
              <StepCard number="3" icon={<ShieldCheck className="h-6 w-6" />} title="المراجعة والاعتماد" description="تراجع الإدارة المدخلات وتعتمدها ثم تُصدر تقارير المتابعة." />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-6 py-16">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-gradient-to-l from-primary/5 to-transparent">
            <CardContent className="p-8 md:p-10 text-center">
              <h3 className="text-2xl md:text-3xl font-extrabold mb-3">جاهزون للانطلاق؟</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                فعّل المنصة وابدأ إدارة تقييم الأداء بأسلوب احترافي موحد يعكس جودة العمل المؤسسي.
              </p>
              <Link href="/login">
                <Button size="lg" className="font-bold px-10" data-testid="button-final-cta">
                  الدخول إلى المنصة
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function BackgroundDecor() {
  return (
    <div
      className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_25%_20%,hsl(var(--primary)/0.10),transparent_35%),radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.10),transparent_30%),radial-gradient(circle_at_50%_80%,hsl(var(--primary)/0.06),transparent_35%)]"
      aria-hidden
    />
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h3 className="text-3xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="h-full">
      <CardContent className="p-6 space-y-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">{icon}</div>
        <h4 className="text-lg font-bold">{title}</h4>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center h-full">
      <CardContent className="p-6">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center relative mb-4">
          {icon}
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background border border-border text-xs font-bold flex items-center justify-center">
            {number}
          </span>
        </div>
        <h4 className="font-bold text-lg mb-2">{title}</h4>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center space-y-1">
        <div className="w-9 h-9 mx-auto rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">{icon}</div>
        <p className="font-bold text-sm md:text-base">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
