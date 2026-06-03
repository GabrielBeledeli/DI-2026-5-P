import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { PaginationMeta } from "@/types";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  meta,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const start = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col gap-3 border-t border-neutral-800 px-1 pt-4 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Mostrando {start}-{end} de {meta.total}
      </span>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading || meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          leftIcon={<ChevronLeft size={16} />}
        >
          Anterior
        </Button>
        <span className="min-w-24 text-center text-xs font-medium text-neutral-500">
          Pagina {meta.page} de {meta.totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading || meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          rightIcon={<ChevronRight size={16} />}
        >
          Proxima
        </Button>
      </div>
    </div>
  );
}
