import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { ScrollArea } from "./scroll-area";
import { Badge } from "./badge";
import {
  FileText, CloudUpload, Link as LinkIcon, Lightbulb,
  ChevronLeft, X, Check, Upload, Image, File, Video, Trash2
} from "lucide-react";
import { useToast } from "./use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import imageCompression from "browser-image-compression";
import type { EvaluationItem } from "./schema";
import { getIconComponent } from "./constants";

interface WitnessUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedItemId?: number;
}

interface FileEntry {
  file: File;
  dataUrl: string;
  compressing: boolean;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,.heic,.heif,.mp4,.mov";

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("video/")) return Video;
  if (type === "application/pdf") return FileText;
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function WitnessUploadModal({ isOpen, onClose, preSelectedItemId }: WitnessUploadModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(preSelectedItemId ?? null);
  const [witnessName, setWitnessName] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [link, setLink] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (preSelectedItemId) {
      setSelectedItemId(preSelectedItemId);
    }
  }, [preSelectedItemId]);

  const { data: evaluationItems = [] } = useQuery<EvaluationItem[]>({
    queryKey: ["/api/evaluation-items"],
    enabled: isOpen,
  });

  const selectedItem = evaluationItems.find((item) => item.id === selectedItemId);
  const suggestions = selectedItem?.suggestedEvidence || [];

  const resetForm = () => {
    setSelectedItemId(preSelectedItemId ?? null);
    setWitnessName("");
    setSelectedSuggestion(null);
    setUploadType("file");
    setFiles([]);
    setLink("");
    setIsCompressing(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSuggestionClick = (sug: string) => {
    setSelectedSuggestion(sug);
    setWitnessName(sug);
  };

  const isHeicFile = (file: File) => {
    const ext = file.name.toLowerCase();
    return ext.endsWith(".heic") || ext.endsWith(".heif") || file.type === "image/heic" || file.type === "image/heif";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const incoming = Array.from(e.target.files);
    const remaining = MAX_FILES - files.length;
    const toProcess = incoming.slice(0, remaining);

    if (incoming.length > remaining) {
      toast({
        title: "تنبيه",
        description: `تم اختيار ${remaining} ملف فقط من أصل ${incoming.length} (الحد الأقصى ${MAX_FILES} ملفات)`,
      });
    }

    for (const originalFile of toProcess) {
      let finalFile = originalFile;
      const originalSize = originalFile.size;

      if (isHeicFile(originalFile)) {
        setIsCompressing(true);
        try {
          finalFile = await imageCompression(originalFile, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/jpeg",
          });
          const newName = originalFile.name.replace(/\.(heic|heif)$/i, ".jpg");
          const blob = finalFile as Blob;
          finalFile = new window.File([blob], newName, { type: "image/jpeg" });
        } catch {
          toast({
            title: "صيغة غير مدعومة",
            description: `لا يمكن تحويل ${originalFile.name} (HEIC/HEIF). يرجى تحويله إلى JPG أولاً`,
            variant: "destructive",
          });
          setIsCompressing(false);
          continue;
        }
        setIsCompressing(false);
      } else if (originalFile.type.startsWith("image/")) {
        setIsCompressing(true);
        try {
          finalFile = await imageCompression(originalFile, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
        } catch {
          // use original on compression failure
        }
        setIsCompressing(false);
      }

      if (finalFile.size > MAX_FILE_SIZE) {
        toast({
          title: "حجم الملف كبير جداً",
          description: `${originalFile.name} (${formatFileSize(originalSize)}) لا يزال أكبر من ${formatFileSize(MAX_FILE_SIZE)} بعد الضغط. يرجى تقليل حجم الملف يدوياً`,
          variant: "destructive",
        });
        continue;
      }

      if (originalFile.type.startsWith("image/") && finalFile.size < originalSize) {
        toast({
          title: "تم ضغط الصورة",
          description: `${originalFile.name}: ${formatFileSize(originalSize)} ← ${formatFileSize(finalFile.size)}`,
        });
      }

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(finalFile);
      });

      setFiles((prev) => [...prev, { file: finalFile, dataUrl, compressing: false }]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        evaluationItemId: selectedItemId,
        title: witnessName || "شاهد جديد",
        description: witnessName || "شاهد جديد",
        type: uploadType,
      };

      if (uploadType === "link") {
        payload.link = link;
      } else {
        payload.files = files.map((f) => ({
          fileName: f.file.name,
          fileType: f.file.type || "application/octet-stream",
          fileUrl: f.dataUrl,
          fileSize: f.file.size,
        }));
      }

      await apiRequest("POST", "/api/teacher-witnesses", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher-witnesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/principal/teacher-witnesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/principal/teachers"] });
      toast({ title: "تم الحفظ", description: "تم رفع الشاهد بنجاح" });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في رفع الشاهد",
        variant: "destructive",
      });
    },
  });

  const canSubmit =
    selectedItemId !== null &&
    witnessName.trim().length > 0 &&
    ((uploadType === "file" && files.length > 0) || (uploadType === "link" && link.trim().length > 0)) &&
    !isCompressing &&
    !mutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden font-sans max-h-[90vh]" dir="rtl">
        <DialogHeader className="px-5 pt-5 pb-3 border-b bg-muted/30">
          <DialogTitle className="text-right flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary" />
            إضافة شاهد جديد
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-5 space-y-5">

            <div className="space-y-2">
              <Label className="text-sm font-bold">اختر عنصر التقييم</Label>
              <div className="space-y-2">
                {evaluationItems.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  const IconComp = getIconComponent(item.icon);
                  return (
                    <div
                      key={item.id}
                      data-testid={`select-evaluation-item-${item.id}`}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all bg-card ${
                        isSelected ? "border-primary" : "hover:border-primary/50"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-primary" : "border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <IconComp className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-bold text-sm">{item.title}</span>
                          <Badge variant="secondary" className="text-xs">{item.weight}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedItem && (
              <>
                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <Label className="text-sm font-bold">مقترحات الشواهد</Label>
                    </div>
                    <div className="space-y-2">
                      {suggestions.map((sug, idx) => {
                        const isSel = selectedSuggestion === sug;
                        return (
                          <div
                            key={idx}
                            data-testid={`suggestion-card-${idx}`}
                            onClick={() => handleSuggestionClick(sug)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              isSel
                                ? "border-primary bg-primary/5 dark:bg-primary/10"
                                : "bg-muted/30 hover:border-primary/50"
                            }`}
                          >
                            <span className="text-sm flex-1 min-w-0">{sug}</span>
                            {isSel && <Check className="h-4 w-4 text-primary shrink-0 mr-2" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-bold">اسم الشاهد</Label>
                  </div>
                  <Input
                    data-testid="input-witness-name"
                    value={witnessName}
                    onChange={(e) => setWitnessName(e.target.value)}
                    placeholder="ادخل اسم الشاهد"
                    className="bg-card"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CloudUpload className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-bold">نوع الإرفاق</Label>
                  </div>
                  <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "file" | "link")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="file" className="text-sm">رفع ملفات</TabsTrigger>
                      <TabsTrigger value="link" className="text-sm">رابط خارجي</TabsTrigger>
                    </TabsList>

                    <TabsContent value="file" className="mt-3 space-y-3">
                      <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-all relative group cursor-pointer bg-card">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={ACCEPTED_TYPES}
                          multiple
                          onChange={handleFileChange}
                          data-testid="input-witness-file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={files.length >= MAX_FILES}
                        />
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                            <Upload className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-sm font-bold">اضغط لاختيار الملفات</p>
                          <p className="text-xs text-muted-foreground">
                            PDF, JPG, PNG, HEIC, MP4, MOV | الحد: 2MB لكل ملف
                          </p>
                          {isCompressing && (
                            <span className="text-xs text-amber-600 animate-pulse">جاري ضغط الصورة...</span>
                          )}
                        </div>
                      </div>

                      {files.length > 0 && (
                        <div className="space-y-2">
                          {files.map((entry, idx) => {
                            const IconF = getFileIcon(entry.file.type);
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-2.5 rounded-xl border bg-card"
                              >
                                <IconF className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm flex-1 min-w-0 truncate">{entry.file.name}</span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {formatFileSize(entry.file.size)}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  data-testid={`button-remove-file-${idx}`}
                                  onClick={() => removeFile(idx)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {files.length < MAX_FILES && files.length > 0 && (
                        <p className="text-xs text-muted-foreground text-center">
                          يمكنك رفع {MAX_FILES - files.length} ملفات إضافية
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="link" className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-bold">رابط خارجي</Label>
                      </div>
                      <div className="relative">
                        <LinkIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          data-testid="input-witness-link"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          className="pr-9 bg-card"
                          placeholder="https://docs.google.com/..."
                          dir="ltr"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground text-center">
                        يمكنك إضافة رابط من Google Drive, OneDrive, أو أي منصة أخرى
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>

                <Button
                  data-testid="button-submit-witness"
                  onClick={() => mutation.mutate()}
                  disabled={!canSubmit}
                  className="w-full font-bold text-base"
                  size="lg"
                >
                  {mutation.isPending ? "جاري الحفظ..." : "حفظ الشاهد"}
                </Button>
              </>
            )}

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
