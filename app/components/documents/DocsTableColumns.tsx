import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import {
  AlertTriangleIcon,
  BadgeCheckIcon,
  CalendarIcon,
  CheckIcon,
  MailCheckIcon,
  ShieldUserIcon,
  UserIcon,
} from "lucide-react";
import { Badge } from "~/components/ui/Badge";
import { Checkbox } from "~/components/ui/Checkbox";
import { getAvatarUrl } from "~/utils/utils";
import type { DocItem } from "./DocsTable";
import { DOCUMENT_TYPE_ORD } from "~/utils/types";
import { Link } from "react-router";

const roleFilterFn: FilterFn<DocItem> = (
  row,
  columnId,
  filterValue: string[],
) => {
  if (!filterValue?.length) return true;
  const role = row.getValue(columnId) as string;
  return filterValue.includes(role);
};

const bannedFilterFn: FilterFn<DocItem> = (
  row,
  columnId,
  filterValue: string[],
) => {
  if (!filterValue?.length) return true;
  const banned = row.getValue(columnId) as boolean;
  const bannedStatus = banned ? "banned" : "active";
  return filterValue.includes(bannedStatus);
};

export const getDocsTableColumns = (): ColumnDef<DocItem>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Предмет документа",
    accessorKey: "title",
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground text-xs">
        <Link to={`${row.original.id}/edit`}>{row.original.title}</Link>
      </span>
    ),
    size: 80,
  },
  {
    header: "Рег. номер",
    accessorKey: "type",
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground text-xs">
        {row.original.registrationNumber}
      </span>
    ),
    size: 80,
  },
  {
    header: "Тип",
    accessorKey: "type",
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground text-xs">
        {DOCUMENT_TYPE_ORD[row.original.type]}
      </span>
    ),
    size: 80,
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <CalendarIcon className="h-3 w-3" />
        {new Date(row.original.createdAt!).toLocaleDateString()}
      </div>
    ),
    size: 80,
  },
];