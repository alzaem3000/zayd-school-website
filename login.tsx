import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { ThemeToggle } from "./theme-toggle";
import { useToast } from "./use-toast";
import { apiRequest, queryClient } from "./queryClient";
import { 
  BookOpen, 
  User, 
  Shield, 
  Crown,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

type RoleType = "teacher" | "admin" | "creator";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [nationalId, setNationalId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: { role: RoleType; nationalId?: string; mobileNumber?: string; password?: string }) => {
      return apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك ${data.user?.fullNameArabic || data.user?.firstName || ""}`,
      });
      if (data.user?.role === "teacher" && !data.user?.onboardingCompleted) {
        setLocation("/onboarding");
      } else if (data.user?.role === "teacher") {
        setLocation("/home");
      } else {
        setLocation("/principal");
      }
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "الرقم السري غير صحيح",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (selectedRole === "teacher") {
      if (!nationalId.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال رقم السجل المدني",
          variant: "destructive",
        });
        return;
      }
      loginMutation.mutate({ role: "teacher", nationalId: nationalId.trim(), mobileNumber: mobileNumber.trim() || undefined });
    } else {
      if (!password.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال الرقم السري",
          variant: "destructive",
        });
        return;
      }
      loginMutation.mutate({ role: selectedRole, password: password.trim() });
    }
  };

  const roleCards = [
    {
      role: "teacher" as RoleType,
      icon: <User className="h-8 w-8" />,
      title: "معلم",
      description: "دخول المعلمين لإدارة المؤشرات والشواهد",
      color: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
      iconBg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      role: "admin" as RoleType,
      icon: <Shield className="h-8 w-8" />,
      title: "مدير المدرسة",
      description: "دخول مدير المدرسة لاعتماد المؤشرات",
      color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      role: "creator" as RoleType,
      icon: <Crown className="h-8 w-8" />,
      title: "منشئ الموقع",
      description: "إدارة الموقع والمستخدمين",
      color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl" data-testid="page-login">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">توثيق الأداء الوظيفي</h1>
              <p className="text-xs text-muted-foreground">نظام إلكتروني متكامل</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/">
              <Button variant="outline" data-testid="button-back">
                <ChevronLeft className="h-4 w-4 ml-2" />
                العودة
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="text-login-title">
              تسجيل الدخول
            </h2>
            <p className="text-muted-foreground">
              اختر نوع حسابك للدخول إلى النظام
            </p>
          </div>

          {!selectedRole ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roleCards.map((card) => (
                <Card
                  key={card.role}
                  className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${card.color}`}
                  onClick={() => setSelectedRole(card.role)}
                  data-testid={`card-role-${card.role}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full ${card.iconBg} flex items-center justify-center mx-auto mb-4`}>
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedRole === "teacher" ? "bg-green-100 dark:bg-green-900/30" :
                      selectedRole === "admin" ? "bg-blue-100 dark:bg-blue-900/30" :
                      "bg-purple-100 dark:bg-purple-900/30"
                    }`}>
                      {selectedRole === "teacher" && <User className="h-5 w-5 text-green-600" />}
                      {selectedRole === "admin" && <Shield className="h-5 w-5 text-blue-600" />}
                      {selectedRole === "creator" && <Crown className="h-5 w-5 text-purple-600" />}
                    </div>
                    {selectedRole === "teacher" && "دخول المعلم"}
                    {selectedRole === "admin" && "دخول مدير المدرسة"}
                    {selectedRole === "creator" && "دخول منشئ الموقع"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRole(null);
                      setNationalId("");
                      setMobileNumber("");
                      setPassword("");
                    }}
                    data-testid="button-change-role"
                  >
                    تغيير
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {selectedRole === "teacher" ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nationalId">رقم السجل المدني</Label>
                        <Input
                          id="nationalId"
                          type="text"
                          placeholder="أدخل رقم السجل المدني"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value)}
                          className="text-right"
                          dir="ltr"
                          maxLength={20}
                          data-testid="input-national-id"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobileNumber">رقم الجوال (كلمة المرور)</Label>
                        <div className="relative">
                          <Input
                            id="mobileNumber"
                            type={showPassword ? "text" : "password"}
                            placeholder="05XXXXXXXX"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            className="text-right pl-10"
                            dir="ltr"
                            maxLength={10}
                            data-testid="input-mobile-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">* للتسجيل الأول: أدخل رقم السجل المدني فقط</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        {selectedRole === "admin" ? "الرقم السري للمدرسة" : "الرقم السري"}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="أدخل الرقم السري"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="text-right pl-10"
                          data-testid="input-password"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                    data-testid="button-submit-login"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جاري الدخول...
                      </>
                    ) : (
                      <>
                        تسجيل الدخول
                        <ChevronLeft className="h-4 w-4 mr-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            نظام توثيق شواهد الأداء الوظيفي - نظام إلكتروني متكامل
          </p>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            الصفحة من إعداد عبدالعزيز الخلفان
          </p>
        </div>
      </footer>
    </div>
  );
}
