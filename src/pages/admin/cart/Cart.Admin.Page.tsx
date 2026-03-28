/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdminContextStore } from "@/stores";

import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import { getCategoryFranchise } from "@/components/Client/Product/services/category.service";
import { getPublicProducts } from "@/components/Client/Product/services/product.service";

import FranchiseSelector from "./components/FranchiseSelector";
import CategoryTabs from "./components/CategoryTabs";
import ProductGrid from "./components/ProductGrid";
import CartPanel from "./components/CartPanel";
import AdminToppingModal from "./components/AdminToppingModal";

const CartAdminPage = () => {
  const selectedFranchiseId = useAdminContextStore((s) => s.selectedFranchiseId);
  const isAdmin = !selectedFranchiseId;
  const [topping, setTopping] = useState<string | null>(null);
  const [posFranchise, setPosFranchise] = useState<any>(null);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("");

  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingItem, setEditingItem] = useState<any>(null);

  // ================= FETCH =================
  const fetchFranchises = async () => {
    try {
      setLoading(true);
      const res = await getAllFranchises();
      setFranchises(res || []);
    } catch {
      toast.error("Lỗi load chi nhánh");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (fid: string) => {
    try {
      setLoading(true);
      const res = await getCategoryFranchise(fid);
      console.log("res", res);
      if (res?.length) {
        setCategories(res);
        setActiveCategory(res[0].category_id);
        const toppingCategory = res.find((cat: any) => cat.category_code === "TOPPING");
        if(toppingCategory) {
          setTopping(toppingCategory.category_id);
        }
      } else {
        setCategories([]);
        setProducts([]);
      }
    } catch {
      toast.error("Lỗi load danh mục");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (fid: string, cid: string) => {
    try {
      setLoading(true);
      const res = await getPublicProducts(fid, cid);
      setProducts(res || []);
    } catch {
      toast.error("Lỗi load sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // ================= EFFECT =================
  useEffect(() => {
    fetchFranchises();
  }, []);

  useEffect(() => {
    if (!isAdmin && selectedFranchiseId && franchises.length) {
      const f = franchises.find((x) => x.value === selectedFranchiseId);
      setPosFranchise({
        id: selectedFranchiseId,
        name: f?.name || "Chi nhánh hiện tại",
      });
    }
  }, [selectedFranchiseId, franchises]);
  useEffect(() => {
    if (posFranchise?.id) {
      fetchCategories(posFranchise.id);
      setCart([]);
    }
  }, [posFranchise]);

  useEffect(() => {
    if (posFranchise?.id && activeCategory) {
      fetchProducts(posFranchise.id, activeCategory);
    }
  }, [activeCategory]);

  // ================= CART =================
  const add = (cartItem: any) => {
    setCart((prev) => {
      const toppingsKey = cartItem.toppings?.length
        ? cartItem.toppings.map((t: any) => `${t.id}_${t.quantity}`).sort().join(",")
        : "no_topping";

      const key = `${cartItem.product_id}_${cartItem.size_id}_${toppingsKey}`;

      const exist = prev.find((i) => i.key === key);

      if (exist) {
        return prev.map((i) =>
          i.key === key
            ? {
              ...i,
              quantity: i.quantity + cartItem.quantity,
              total_price: i.total_price + cartItem.total_price,
            }
            : i
        );
      }

      return [...prev, { ...cartItem, key }];
    });
  };

  const updateQty = (key: string, delta: number) => {
    setCart((prev) => {
      if (delta === -Infinity) return prev.filter((i) => i.key !== key);

      return prev
        .map((i) => {
          if (i.key !== key) return i;

          const newQty = i.quantity + delta;
          if (newQty <= 0) return null;

          const unit = i.total_price / i.quantity;

          return {
            ...i,
            quantity: newQty,
            total_price: unit * newQty,
          };
        })
        .filter(Boolean);
    });
  };

  const total = cart.reduce((sum, i) => sum + i.total_price, 0);

  // ================= EDIT =================
  const handleEditItem = (item: any) => {
    const productToEdit = {
      product_id: item.product_id,
      name: item.name,
      image_url: item.image_url,
      description: item.description || "",
      sizes: [{
        product_franchise_id: item.size_id,
        size: item.size,
        price: item.price,
        is_available: true
      }],
      is_have_topping: item.is_have_topping || false
    };

    setEditingItem({
      ...item,
      product: productToEdit
    });
  };

  const handleConfirmEdit = (updated: any) => {
    setCart((prev) =>
      prev.map((i) => (i.key === editingItem.key ? { ...updated, key: i.key } : i))
    );
    setEditingItem(null);
  };

  // ================= UI =================
  if (isAdmin && !posFranchise) {
    return (
      <FranchiseSelector
        data={franchises}
        loading={loading}
        onSelect={(id) => {
          const f = franchises.find((x) => x.value === id);
          setPosFranchise({ id, name: f?.name });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* HEADER TOP (phần trên cùng) */}
      <div className="bg-white border-b px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{posFranchise?.name}</h2>
          {isAdmin && (
            <button onClick={() => setPosFranchise(null)} className="text-sm hover:text-primary cursor-pointer">
              Đổi chi nhánh
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT - chiếm phần còn lại */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
          {/* CONTENT */}
          <div className="flex-1 flex flex-col min-h-0">
            {categories.length === 0 && !loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Không có danh mục
              </div>
            ) : (
              <>
                <CategoryTabs
                  categories={categories}
                  active={activeCategory}
                  onChange={setActiveCategory}
                />

                <div className="flex-1 min-h-0">
                  <ProductGrid
                    toppingId={topping || undefined}
                    franchiseId={posFranchise?.id}
                    products={products}
                    onAdd={add}
                    loading={loading}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <CartPanel
          franchise={posFranchise}
          cart={cart}
          updateQty={updateQty}
          total={total}
          onEditItem={handleEditItem}
        />
      </div>

      {/* MODAL */}
      {editingItem && (
        <AdminToppingModal
          toppingId={topping || undefined}
          franchiseId={posFranchise?.id}
          isOpen={!!editingItem}
          product={editingItem.product}
          initialData={editingItem}
          onClose={() => setEditingItem(null)}
          onConfirm={handleConfirmEdit}
        />
      )}
    </div>
  );
};

export default CartAdminPage;