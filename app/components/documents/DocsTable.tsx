import type { Route } from ".react-router/types/app/routes/docs/+types";
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "~/components/admin/DataTable";
import { DataTablePagination } from "~/components/admin/DataTablePagination";
import { getDocsTableColumns } from "./DocsTableColumns";
import { DocsTableToolbar } from "./DocsTableToolbar";

export type DocsData = Route.ComponentProps["loaderData"]["documents"];
export type DocItem = DocsData[number];

export function DocsTable({ data }: { data: DocsData }) {
  const [tableData, setTableData] = useState<DocsData>(data);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ]);

  const columns = useMemo(() => getDocsTableColumns(), []);

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const updatedData = tableData.filter(
      (item) => !selectedRows.some((row) => row.original.id === item.id),
    );
    setTableData(updatedData);
    table.resetRowSelection();
  };

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <DocsTableToolbar table={table} onDeleteRows={handleDeleteRows} />

      {/* Table */}
      <DataTable
        columns={columns}
        data={tableData}
        table={table}
        emptyMessage="No docs found."
      />

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}