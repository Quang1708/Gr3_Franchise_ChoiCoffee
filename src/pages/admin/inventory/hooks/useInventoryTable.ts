import { useState, useMemo } from "react";

export function useInventoryTable<T extends { id: string }>() {
  const [tableRows, setTableRows] = useState<T[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const rowIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    tableRows.forEach((r, i) => map.set(r.id, i));
    return map;
  }, [tableRows]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const isSelected = (id: string) => selectedIds.includes(id);

  return {
    tableRows,
    setTableRows,

    selectedIds,
    setSelectedIds,
    toggleSelect,
    clearSelection,
    isSelected,

    rowIndexMap,
  };
}