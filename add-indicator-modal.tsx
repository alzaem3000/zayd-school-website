import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Plus, Trash2, Save } from "lucide-react";

const indicatorFormSchema = z.object({
  title: z.string().min(3, "عنوان المؤشر يجب أن يكون 3 أحرف على الأقل"),
  description: z.string().optional(),
  type: z.enum(["goal", "competency"]),
  weight: z.number().min(0).max(100),
  domain: z.string().optional(),
  targetOutput: z.string().optional(),
});

type IndicatorFormValues = z.infer<typeof indicatorFormSchema>;

interface AddIndicatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: IndicatorFormValues & { criteria: string[] }) => void;
  isLoading?: boolean;
  defaultType?: "goal" | "competency";
}

export function AddIndicatorModal({ 
  open, 
  onOpenChange, 
  onSubmit,
  isLoading,
  defaultType = "goal",
}: AddIndicatorModalProps) {
  const [criteriaList, setCriteriaList] = useState<string[]>([""]);

  const form = useForm<IndicatorFormValues>({
    resolver: zodResolver(indicatorFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: defaultType,
      weight: 0,
      domain: "",
      targetOutput: "",
    },
  });

  const watchType = form.watch("type");

  const handleAddCriteria = () => {
    setCriteriaList([...criteriaList, ""]);
  };

  const handleRemoveCriteria = (index: number) => {
    const newList = criteriaList.filter((_, i) => i !== index);
    setCriteriaList(newList.length > 0 ? newList : [""]);
  };

  const handleCriteriaChange = (index: number, value: string) => {
    const newList = [...criteriaList];
    newList[index] = value;
    setCriteriaList(newList);
  };

  const handleSubmit = (data: IndicatorFormValues) => {
    const validCriteria = criteriaList.filter(c => c.trim() !== "");
    onSubmit({ ...data, criteria: validCriteria });
    form.reset({ title: "", description: "", type: defaultType, weight: 0, domain: "", targetOutput: "" });
    setCriteriaList([""]);
  };

  const handleClose = () => {
    form.reset({ title: "", description: "", type: defaultType, weight: 0, domain: "", targetOutput: "" });
    setCriteriaList([""]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="modal-add-indicator">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary" data-testid="text-modal-title">
            {watchType === "goal" ? "إضافة هدف جديد" : "إضافة جدارة جديدة"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-primary">النوع</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-indicator-type">
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="goal">هدف (الأداء الوظيفي)</SelectItem>
                      <SelectItem value="competency">جدارة</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-primary">
                    {watchType === "goal" ? "عنوان الهدف" : "عنوان الجدارة"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={watchType === "goal" ? "أدخل عنوان الهدف" : "أدخل عنوان الجدارة"}
                      {...field}
                      data-testid="input-indicator-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-primary">الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل وصف المؤشر" 
                      {...field}
                      className="resize-none"
                      rows={3}
                      data-testid="input-indicator-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-primary">الوزن النسبي (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="أدخل الوزن (1-100)"
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-indicator-weight"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchType === "competency" && (
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-primary">المجال</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-domain">
                          <SelectValue placeholder="اختر المجال" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="values">القيم والمسؤوليات المهنية</SelectItem>
                        <SelectItem value="knowledge">المعرفة المهنية</SelectItem>
                        <SelectItem value="practice">الممارسة المهنية</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchType === "goal" && (
              <FormField
                control={form.control}
                name="targetOutput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-primary">المخرج المستهدف</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="المخرج المتوقع تحقيقه"
                        {...field}
                        data-testid="input-target-output"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">المعايير</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCriteria}
                  className="gap-1"
                  data-testid="button-add-criteria"
                >
                  <Plus className="h-4 w-4" />
                  إضافة معيار
                </Button>
              </div>
              
              <div className="space-y-2">
                {criteriaList.map((criterion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={criterion}
                      onChange={(e) => handleCriteriaChange(index, e.target.value)}
                      placeholder={`المعيار ${index + 1}`}
                      className="flex-1"
                      data-testid={`input-criteria-${index}`}
                    />
                    {criteriaList.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCriteria(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-testid={`button-remove-criteria-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 gap-2"
                disabled={isLoading}
                data-testid="button-save-indicator"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                data-testid="button-cancel-indicator"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
