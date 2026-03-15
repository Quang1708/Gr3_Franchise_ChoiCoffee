import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useFranchiseStore } from "@/stores/useFranchiseStore";
import { useProductFranchiseStore } from "@/stores/useProductFranchiseStore";
import { useInventoryStore } from "@/stores/useInventoryStore";

const FranchiseDetailPage = () => {
  const { id } = useParams();
  const franchiseId = id;

  const {
    items: franchises,
    fetchAll: fetchFranchises,
    loading: franchiseLoading,
  } = useFranchiseStore();

  const {
    items: productFranchises,
    fetchByFranchise,
    loading: productLoading,
  } = useProductFranchiseStore();

  const {
    items: inventories,
    fetchByFranchise: fetchInventory,
    loading: inventoryLoading,
  } = useInventoryStore();

  const [tab, setTab] = useState<"product" | "inventory">("product");

  /* -------------------------------------------------- */
  /* FETCH DATA                                         */
  /* -------------------------------------------------- */

  useEffect(() => {
    fetchFranchises();
  }, [fetchFranchises]);

  useEffect(() => {
    if (!franchiseId) return;

    fetchByFranchise(franchiseId);
    fetchInventory(franchiseId);
  }, [franchiseId, fetchByFranchise, fetchInventory]);

  /* -------------------------------------------------- */
  /* SELECTED FRANCHISE                                 */
  /* -------------------------------------------------- */

  const franchise = useMemo(() => {
    if (!franchiseId) return undefined;
    return franchises.find((f) => String(f.id) === String(franchiseId));
  }, [franchises, franchiseId]);

  const inventoryMap = useMemo(() => {
    return new Map(inventories.map((i) => [i.productFranchiseId, i]));
  }, [inventories]);

  /* -------------------------------------------------- */
  /* VIEW MODELS                                         */
  /* -------------------------------------------------- */

  const productRows = useMemo(() => {
    return productFranchises.map((pf) => ({
      id: pf.id,
      name: pf.product_name,
      size: pf.size,
      price: pf.price_base,
      isActive: pf.is_active,
    }));
  }, [productFranchises]);

  const inventoryRows = useMemo(() => {
    return productFranchises.map((pf) => {
      const inv = inventoryMap.get(pf.id);

      return {
        id: pf.id,
        productName: pf.product_name,
        quantity: inv?.quantity ?? 0,
        alertThreshold: inv?.alertThreshold ?? 0,
        isActive: inv?.isActive ?? true,
      };
    });
  }, [productFranchises, inventoryMap]);

  /* -------------------------------------------------- */
  /* LOADING & EMPTY STATE                               */
  /* -------------------------------------------------- */

  if (franchiseLoading) {
    return <div className="p-6">Đang tải franchise...</div>;
  }

  if (!franchise) {
    return <div className="p-6 text-red-600">Không tìm thấy franchise.</div>;
  }
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{franchise.name}</h1>
        <p className="text-sm text-gray-500">{franchise.address}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => setTab("product")}
          className={`px-3 py-1 text-sm ${
            tab === "product"
              ? "border-b-2 border-black font-semibold"
              : "text-gray-500"
          }`}
        >
          Sản phẩm
        </button>
        <button
          onClick={() => setTab("inventory")}
          className={`px-3 py-1 text-sm ${
            tab === "inventory"
              ? "border-b-2 border-black font-semibold"
              : "text-gray-500"
          }`}
        >
          Tồn kho
        </button>
      </div>

      {/* Content */}
      {tab === "product" ? (
        productLoading ? (
          <div>Đang tải sản phẩm...</div>
        ) : (
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(productRows, null, 2)}
          </pre>
        )
      ) : inventoryLoading ? (
        <div>Đang tải tồn kho...</div>
      ) : (
        <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(inventoryRows, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default FranchiseDetailPage;
