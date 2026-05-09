import { useState } from "react";
import { useListQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminQuestions() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  const { data, isLoading, refetch } = useListQuestions({ page, limit: 10, search, category: categoryFilter || undefined });
  const { toast } = useToast();
  
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    optionE: "",
    correctAnswer: "A" as any,
    explanation: "",
    category: "TWK",
    difficulty: "medium" as any,
    imageUrl: ""
  });

  const resetForm = () => {
    setFormData({
      questionText: "",
      optionA: "", optionB: "", optionC: "", optionD: "", optionE: "",
      correctAnswer: "A",
      explanation: "",
      category: "TWK",
      difficulty: "medium",
      imageUrl: ""
    });
    setEditingId(null);
  };

  const handleEdit = (q: any) => {
    setFormData({
      questionText: q.questionText,
      optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, optionE: q.optionE,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      category: q.category,
      difficulty: q.difficulty,
      imageUrl: q.imageUrl || ""
    });
    setEditingId(q.id);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if(confirm("Hapus soal ini?")) {
      deleteMutation.mutate({ id }, { onSuccess: () => refetch() });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const action = editingId 
      ? updateMutation.mutateAsync({ id: editingId, data: formData })
      : createMutation.mutateAsync({ data: formData });

    action.then(() => {
      toast({ title: "Soal berhasil disimpan" });
      setIsOpen(false);
      refetch();
    });
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bank Soal</h1>
            <p className="text-muted-foreground">Kelola database soal untuk Quiz dan Tryout.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Tambah Soal</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Soal' : 'Tambah Soal Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kategori Topik</Label>
                    <Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Contoh: TWK, TIU, Matematika" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tingkat Kesulitan</Label>
                    <Select value={formData.difficulty} onValueChange={(val: any) => setFormData({...formData, difficulty: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Mudah</SelectItem>
                        <SelectItem value="medium">Sedang</SelectItem>
                        <SelectItem value="hard">Sulit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pertanyaan</Label>
                  <Textarea required value={formData.questionText} onChange={e => setFormData({...formData, questionText: e.target.value})} rows={4} />
                </div>
                
                <div className="space-y-2">
                  <Label>URL Gambar (Opsional)</Label>
                  <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                </div>

                <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                  <Label className="font-semibold">Pilihan Jawaban</Label>
                  {['A', 'B', 'C', 'D', 'E'].map(opt => (
                    <div key={opt} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold shrink-0">{opt}</div>
                      <Input 
                        required 
                        value={formData[`option${opt}` as keyof typeof formData] as string} 
                        onChange={e => setFormData({...formData, [`option${opt}`]: e.target.value})} 
                      />
                    </div>
                  ))}
                  
                  <div className="pt-2">
                    <Label className="mb-2 block">Kunci Jawaban Benar</Label>
                    <Select value={formData.correctAnswer} onValueChange={(val: any) => setFormData({...formData, correctAnswer: val})}>
                      <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['A', 'B', 'C', 'D', 'E'].map(opt => (
                          <SelectItem key={opt} value={opt}>Pilihan {opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pembahasan / Penjelasan</Label>
                  <Textarea value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})} rows={3} />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Simpan Soal</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari soal..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Semua Kategori</SelectItem>
              <SelectItem value="TWK">TWK</SelectItem>
              <SelectItem value="TIU">TIU</SelectItem>
              <SelectItem value="TKP">TKP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : data?.questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <Badge variant="outline">{q.category}</Badge>
                    <Badge variant={q.difficulty === 'hard' ? 'destructive' : q.difficulty === 'medium' ? 'default' : 'secondary'}>
                      {q.difficulty}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(q)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(q.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <p className="text-lg mb-4 whitespace-pre-wrap">{q.questionText}</p>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {['A', 'B', 'C', 'D', 'E'].map(opt => {
                    const isCorrect = q.correctAnswer === opt;
                    return (
                      <div key={opt} className={`p-2 rounded border ${isCorrect ? 'bg-green-50 border-green-200 text-green-800 font-medium' : ''}`}>
                        <span className="font-bold mr-2">{opt}.</span> {q[`option${opt}` as keyof typeof q]}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
