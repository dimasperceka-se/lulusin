import { toast as sonnerToast } from "sonner";

type Variant = "default" | "destructive" | "success";

type ToastInput = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: Variant;
  duration?: number;
};

function callSonner({ title, description, variant = "default", duration }: ToastInput) {
  const message = (typeof title === "string" ? title : undefined) ?? "";
  const opts = {
    description: typeof description === "string" ? description : undefined,
    duration,
  };

  if (variant === "destructive") return sonnerToast.error(message, opts);
  if (variant === "success") return sonnerToast.success(message, opts);
  return sonnerToast(message, opts);
}

export function toast(input: ToastInput) {
  const id = callSonner(input);
  return {
    id: String(id),
    dismiss: () => sonnerToast.dismiss(id),
    update: (next: ToastInput) => callSonner({ ...input, ...next }),
  };
}

export function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
    toasts: [] as never[],
  };
}
