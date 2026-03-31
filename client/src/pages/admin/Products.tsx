import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface ProductForm {
  sku: string;
  categoryId: number;
  nameEn: string;
  nameZh: string;
  nameZhTw: string;
  nameMs: string;
  descEn: string;
  descZh: string;
  descZhTw: string;
  descMs: string;
  price: string;
  stock: number;
  isActive: boolean;
}

const EMPTY_FORM: ProductForm = {
  sku: "",
  categoryId: 1,
  nameEn: "",
  nameZh: "",
  nameZhTw: "",
  nameMs: "",
  descEn: "",
  descZh: "",
  descZhTw: "",
  descMs: "",
  price: "0.00",
  stock: 0,
  isActive: true,
};

export default function AdminProducts() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);

  const { data: categories } = trpc.category.list.useQuery();
  const { data, isLoading } = trpc.admin.products.list.useQuery({
    search: search || undefined,
  });

  const createMut = trpc.admin.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created");
      utils.admin.products.list.invalidate();
      setDialogOpen(false);
    },
  });
  const updateMut = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated");
      utils.admin.products.list.invalidate();
      setDialogOpen(false);
    },
  });
  const deleteMut = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted");
      utils.admin.products.list.invalidate();
      setDeleteId(null);
    },
  });

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };
  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      sku: p.sku,
      categoryId: p.categoryId,
      nameEn: p.nameEn,
      nameZh: p.nameZh,
      nameZhTw: p.nameZhTw,
      nameMs: p.nameMs,
      descEn: p.descEn ?? "",
      descZh: p.descZh ?? "",
      descZhTw: p.descZhTw ?? "",
      descMs: p.descMs ?? "",
      price: String(p.price),
      stock: p.stock,
      isActive: p.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editId) {
      updateMut.mutate({
        id: editId,
        data: { ...form, price: form.price, stock: form.stock },
      });
    } else {
      createMut.mutate({ ...form, price: form.price, stock: form.stock });
    }
  };

  const setField = <K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K]
  ) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="w-8 h-1 bg-primary mb-3" />
          <h1 className="text-2xl font-bold tracking-tight">
            {t("admin.products")}
          </h1>
        </div>
        <Button onClick={openCreate} className="font-semibold">
          <Plus className="h-4 w-4 mr-1.5" /> {t("admin.addProduct")}
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("nav.search")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("product.sku")}
              </th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Name
              </th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("product.category")}
              </th>
              <th className="text-right p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("product.price")}
              </th>
              <th className="text-right p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Stock
              </th>
              <th className="text-right p-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("admin.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  {t("common.loading")}
                </td>
              </tr>
            ) : !data?.items.length ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  {t("product.noResults")}
                </td>
              </tr>
            ) : (
              data.items.map(p => (
                <tr
                  key={p.id}
                  className="border-b border-border hover:bg-secondary/20 transition-colors"
                >
                  <td className="p-3 font-mono text-xs">{p.sku}</td>
                  <td className="p-3 font-medium">{p.nameEn}</td>
                  <td className="p-3 text-muted-foreground">
                    {categories?.find(c => c.id === p.categoryId)?.nameEn ??
                      "—"}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    ${Number(p.price).toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    <Badge variant={p.stock < 10 ? "destructive" : "secondary"}>
                      {p.stock}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(p.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editId ? t("admin.editProduct") : t("admin.addProduct")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider">
                {t("product.sku")}
              </Label>
              <Input
                value={form.sku}
                onChange={e => setField("sku", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">
                {t("product.category")}
              </Label>
              <Select
                value={form.categoryId.toString()}
                onValueChange={v => setField("categoryId", Number(v))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(["En", "Zh", "ZhTw", "Ms"] as const).map(lang => (
              <div key={lang} className="col-span-2">
                <Label className="text-xs uppercase tracking-wider">
                  Name ({lang})
                </Label>
                <Input
                  value={(form as any)[`name${lang}`]}
                  onChange={e => setField(`name${lang}` as any, e.target.value)}
                  className="mt-1"
                />
              </div>
            ))}
            {(["En", "Zh", "ZhTw", "Ms"] as const).map(lang => (
              <div key={`desc-${lang}`} className="col-span-2">
                <Label className="text-xs uppercase tracking-wider">
                  Description ({lang})
                </Label>
                <Textarea
                  value={(form as any)[`desc${lang}`]}
                  onChange={e => setField(`desc${lang}` as any, e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>
            ))}
            <div>
              <Label className="text-xs uppercase tracking-wider">
                {t("product.price")}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={e => setField("price", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Stock</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={e => setField("stock", Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("admin.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
            >
              {t("admin.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.deleteProduct")}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMut.mutate({ id: deleteId })}
              className="bg-destructive text-destructive-foreground"
            >
              {t("admin.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
