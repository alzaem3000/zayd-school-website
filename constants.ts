import {
  FileText,
  ClipboardCheck,
  BookOpen,
  Users,
  GraduationCap,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type PerformanceStandardUI = {
  id: string;
  title: string;
  icon: LucideIcon;
};

export const PERFORMANCE_STANDARDS: PerformanceStandardUI[] = [
  { id: "planning", title: "التخطيط", icon: ClipboardCheck },
  { id: "teaching", title: "التدريس", icon: BookOpen },
  { id: "assessment", title: "التقويم", icon: GraduationCap },
  { id: "professional", title: "المهنية", icon: ShieldCheck },
  { id: "community", title: "الشراكة", icon: Users },
];

const iconMap: Record<string, LucideIcon> = {
  planning: ClipboardCheck,
  teaching: BookOpen,
  assessment: GraduationCap,
  professional: ShieldCheck,
  community: Users,
};

export function mapDbStandardToUI(value: string): PerformanceStandardUI {
  const id = (value || "").toLowerCase();
  const found = PERFORMANCE_STANDARDS.find((s) => s.id === id);
  if (found) return found;
  return { id: value, title: value, icon: FileText };
}

export function getIconComponent(name?: string): LucideIcon {
  if (!name) return FileText;
  return iconMap[name.toLowerCase()] ?? FileText;
}
