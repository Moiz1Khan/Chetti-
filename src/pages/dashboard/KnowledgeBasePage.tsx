import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderOpen, Upload, Trash2, FileText, Link as LinkIcon, Type,
  Plus, Globe, FileUp, Loader2, CheckCircle2, XCircle, Clock, Eye, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ready: { icon: CheckCircle2, label: "Ready", variant: "default" },
  processing: { icon: Loader2, label: "Processing", variant: "secondary" },
  pending: { icon: Clock, label: "Pending", variant: "outline" },
  failed: { icon: XCircle, label: "Failed", variant: "destructive" },
};

const KnowledgeBasePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [uploadTab, setUploadTab] = useState("file");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // URL state
  const [urlInput, setUrlInput] = useState("");

  // Text state
  const [textName, setTextName] = useState("");
  const [textContent, setTextContent] = useState("");

  const { data: items, isLoading } = useQuery({
    queryKey: ["knowledge_base"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Poll for status updates
  });

  const { data: chunkCounts } = useQuery({
    queryKey: ["knowledge_chunk_counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_chunks")
        .select("knowledge_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((c) => {
        counts[c.knowledge_id] = (counts[c.knowledge_id] || 0) + 1;
      });
      return counts;
    },
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete chunks first, then knowledge base entry
      await supabase.from("knowledge_chunks").delete().eq("knowledge_id", id);
      const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge_base"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge_chunk_counts"] });
      setDeleteId(null);
      toast({ title: "Deleted", description: "Knowledge source removed." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const processKnowledge = useCallback(
    async (knowledgeId: string, type: string, content?: string, url?: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-knowledge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ knowledge_id: knowledgeId, type, content, url }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Processing failed");
      }

      return response.json();
    },
    []
  );

  const isTextBasedFile = (file: File): boolean => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    return ["txt", "md", "csv", "text"].includes(ext);
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return await file.text();
  };

  const handleUpload = async () => {
    if (!user) return;
    setUploading(true);
    setUploadProgress(10);

    try {
      if (uploadTab === "file" && selectedFile) {
        setUploadProgress(20);

        // Upload file to storage
        const filePath = `${user.id}/${Date.now()}_${selectedFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("knowledge-files")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;
        setUploadProgress(40);

        const fileType = selectedFile.name.split(".").pop()?.toUpperCase() || "TXT";

        // Create knowledge base entry
        const { data: entry, error: entryError } = await supabase
          .from("knowledge_base")
          .insert({
            user_id: user.id,
            file_name: selectedFile.name,
            file_type: fileType,
            file_url: filePath,
            status: "pending",
          })
          .select()
          .single();

        if (entryError) throw entryError;
        setUploadProgress(60);

        // For text-based files, extract client-side. For PDF/DOCX, let the server handle it.
        if (isTextBasedFile(selectedFile)) {
          const extractedText = await extractTextFromFile(selectedFile);
          setUploadProgress(80);
          await processKnowledge(entry.id, "file", extractedText);
        } else {
          // PDF/DOCX: send file_url so the edge function downloads and extracts
          setUploadProgress(80);
          await processKnowledge(entry.id, "document", undefined, undefined);
        }
        setUploadProgress(100);

        toast({ title: "Upload Complete", description: `"${selectedFile.name}" processed successfully.` });
      } else if (uploadTab === "url") {
        if (!urlInput.trim()) throw new Error("Please enter a URL");

        setUploadProgress(30);

        // Ensure URL has protocol
        let formattedUrl = urlInput.trim();
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
          formattedUrl = `https://${formattedUrl}`;
        }

        const urlName = new URL(formattedUrl).hostname;
        const { data: entry, error: entryError } = await supabase
          .from("knowledge_base")
          .insert({
            user_id: user.id,
            file_name: urlName,
            file_type: "URL",
            file_url: formattedUrl,
            status: "pending",
          })
          .select()
          .single();

        if (entryError) throw entryError;
        setUploadProgress(50);

        await processKnowledge(entry.id, "url", undefined, formattedUrl);
        setUploadProgress(100);

        toast({ title: "URL Processed", description: `Content from "${urlName}" has been indexed.` });
      } else if (uploadTab === "text") {
        if (!textName.trim() || !textContent.trim()) throw new Error("Please provide a name and content");

        setUploadProgress(30);

        const { data: entry, error: entryError } = await supabase
          .from("knowledge_base")
          .insert({
            user_id: user.id,
            file_name: textName,
            file_type: "TEXT",
            status: "pending",
          })
          .select()
          .single();

        if (entryError) throw entryError;
        setUploadProgress(50);

        await processKnowledge(entry.id, "text", textContent);
        setUploadProgress(100);

        toast({ title: "Text Processed", description: `"${textName}" has been indexed.` });
      }

      queryClient.invalidateQueries({ queryKey: ["knowledge_base"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge_chunk_counts"] });
      resetForm();
      setUploadOpen(false);
    } catch (e: any) {
      console.error("Upload error:", e);
      toast({ title: "Upload Failed", description: e.message, variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["knowledge_base"] });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setUrlInput("");
    setTextName("");
    setTextContent("");
    setUploadTab("file");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "URL": return <Globe className="h-5 w-5 text-primary" />;
      case "TEXT": return <Type className="h-5 w-5 text-primary" />;
      default: return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Knowledge Base</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Upload and manage training data for your chatbots.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1" /> Add Knowledge
        </Button>
      </div>

      {/* Stats */}
      {items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-foreground">{items.length}</p>
              <p className="text-xs text-muted-foreground">Total Sources</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-foreground">
                {items.filter((i) => (i as any).status === "ready").length}
              </p>
              <p className="text-xs text-muted-foreground">Ready</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-foreground">
                {Object.values(chunkCounts || {}).reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Chunks</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Items List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : items && items.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {items.map((item) => {
                const status = statusConfig[(item as any).status || "pending"] || statusConfig.pending;
                const StatusIcon = status.icon;
                const chunks = chunkCounts?.[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {getTypeIcon(item.file_type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.file_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          {chunks > 0 && <span>· {chunks} chunks</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-12 sm:ml-0">
                      <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className={`h-3 w-3 ${(item as any).status === "processing" ? "animate-spin" : ""}`} />
                        {status.label}
                      </Badge>
                      <Badge variant="secondary" className="hidden sm:inline-flex">{item.file_type}</Badge>
                      {(item as any).source_content && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPreviewItem(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-2">No training data yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload files, paste URLs, or add text to train your chatbots.
            </p>
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Knowledge
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={(open) => { if (!uploading) { setUploadOpen(open); if (!open) resetForm(); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Knowledge Source</DialogTitle>
          </DialogHeader>

          <Tabs value={uploadTab} onValueChange={setUploadTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="file" disabled={uploading}>
                <FileUp className="h-3.5 w-3.5 mr-1" /> File
              </TabsTrigger>
              <TabsTrigger value="url" disabled={uploading}>
                <Globe className="h-3.5 w-3.5 mr-1" /> URL
              </TabsTrigger>
              <TabsTrigger value="text" disabled={uploading}>
                <Type className="h-3.5 w-3.5 mr-1" /> Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-4 space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : selectedFile
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOCX, TXT, CSV, MD files supported (max 20MB)
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".txt,.csv,.md,.text,.pdf,.docx,.doc"
                  onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/docs"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">
                  The page content will be scraped and processed automatically.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="text" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Company FAQ"
                  value={textName}
                  onChange={(e) => setTextName(e.target.value)}
                  disabled={uploading}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="Paste your text content here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={8}
                  disabled={uploading}
                />
              </div>
            </TabsContent>
          </Tabs>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadOpen(false); resetForm(); }} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                uploading ||
                (uploadTab === "file" && !selectedFile) ||
                (uploadTab === "url" && !urlInput.trim()) ||
                (uploadTab === "text" && (!textName.trim() || !textContent.trim()))
              }
            >
              {uploading ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Processing...</>
              ) : (
                <><Upload className="h-4 w-4 mr-1" /> Upload & Process</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewItem && getTypeIcon(previewItem.file_type)}
              {previewItem?.file_name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg">
              {previewItem?.source_content || "No content available"}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Source?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the source and all its processed chunks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KnowledgeBasePage;
