import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { GraduationCap, Building2, Hash, BookOpen, User, School, Phone, IdCard } from "lucide-react";

const onboardingSchema = z.object({
  nationalId: z.string().regex(/^\d{5,20}$/, "رقم السجل المدني يجب أن يكون رقمياً (5 أرقام على الأقل)"),
  fullNameArabic: z.string().min(5, "الاسم الكامل يجب أن يكون 5 أحرف على الأقل"),
  jobNumber: z.string().regex(/^\d{4,}$/, "الرقم الوظيفي يجب أن يكون رقمياً (4 أرقام على الأقل)"),
  specialization: z.string().min(2, "التخصص مطلوب"),
  schoolName: z.string().min(3, "اسم المدرسة مطلوب"),
  educationDepartment: z.string().min(3, "إدارة التعليم مطلوبة"),
  educationalLevel: z.string().min(1, "الرتبة مطلوبة"),
  subject: z.string().min(2, "المادة مطلوبة"),
  mobileNumber: z.string().regex(/^05\d{8}$/, "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const educationalLevels = [
  { value: "معلم", label: "معلم" },
  { value: "معلم ممارس", label: "معلم ممارس" },
  { value: "معلم متقدم", label: "معلم متقدم" },
  { value: "معلم خبير", label: "معلم خبير" },
];

export default function Onboarding() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nationalId: "",
      fullNameArabic: "",
      jobNumber: "",
      specialization: "",
      schoolName: "",
      educationDepartment: "",
      educationalLevel: "معلم",
      subject: "",
      mobileNumber: "",
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingFormValues) => {
      return apiRequest("POST", "/api/onboarding", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "تم بنجاح", description: "تم حفظ البيانات الشخصية" });
      setLocation("/home");
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في حفظ البيانات", variant: "destructive" });
    },
  });

  const handleSubmit = (data: OnboardingFormValues) => {
    onboardingMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl" data-testid="page-onboarding">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: "#006C35" }}>
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-onboarding-title">
            استكمال البيانات الشخصية
          </h1>
          <p className="text-muted-foreground">
            يرجى تعبئة البيانات التالية لاستكمال التسجيل في نظام الأداء الوظيفي
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-bold" style={{ color: "#006C35" }}>
                        <IdCard className="h-4 w-4" />
                        رقم السجل المدني
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل رقم السجل المدني"
                          dir="ltr"
                          maxLength={20}
                          {...field}
                          data-testid="input-national-id"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fullNameArabic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold" style={{ color: "#006C35" }}>
                      <User className="h-4 w-4" />
                      الاسم الكامل
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="الاسم الرباعي باللغة العربية"
                        {...field}
                        data-testid="input-full-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold" style={{ color: "#006C35" }}>
                      <Hash className="h-4 w-4" />
                      الرقم الوظيفي
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل الرقم الوظيفي"
                        {...field}
                        data-testid="input-job-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold" style={{ color: "#006C35" }}>
                      <BookOpen className="h-4 w-4" />
                      التخصص
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="التخصص العلمي"
                        {...field}
                        data-testid="input-specialization"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold" style={{ color: "#006C35" }}>
                      <BookOpen className="h-4 w-4" />
                      المادة الدراسية
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="مادة أو مواد التدريس"
                        {...field}
                        data-testid="input-subject"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold" style={{ color: "#006C35" }}>
                      <School className="h-4 w-4" />
                      اسم المدرسة
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل اسم المدرسة"
                        {...field}
                        data-testid="input-school-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="educationDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold" style={{ color: "#006C35" }}>
                      <Building2 className="h-4 w-4" />
                      إدارة التعليم
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="إدارة التعليم التابع لها"
                        {...field}
                        data-testid="input-education-department"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold" style={{ color: "#006C35" }}>
                      <Phone className="h-4 w-4" />
                      رقم الجوال
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="05XXXXXXXX"
                        dir="ltr"
                        maxLength={10}
                        {...field}
                        data-testid="input-mobile-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="educationalLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold" style={{ color: "#006C35" }}>
                      <GraduationCap className="h-4 w-4" />
                      الرتبة الوظيفية
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-level">
                          <SelectValue placeholder="اختر الرتبة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {educationalLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-lg py-6"
              style={{ backgroundColor: "#006C35" }}
              disabled={onboardingMutation.isPending}
              data-testid="button-submit-onboarding"
            >
              {onboardingMutation.isPending ? "جاري الحفظ..." : "حفظ البيانات والمتابعة"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
