import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import type { Customer } from "@/models/customer.model";

import type { Cart } from "@/pages/admin/cart/models/getCartResponse.model";
import type { productFranchise } from "../models/productResponse.model";
import { getPublicProducts } from "@/pages/client/product/services/product.service";
import { searchCustomersUsecase } from "@/pages/admin/customer/usecases/searchCustomers.usecase";
import { searchFranchsie } from "../usecase/searchFranchise.usecase";
import { searchProductFranchise } from "../usecase/searchProductFranchise.usecase";
import { getCategoryFranchise } from "@/components/Client/Product/services/category.service";
import { toast } from "react-toastify";

type ToppingOption = {
  product_data: {
    product_franchise_id: string;
    price: number;
    name: string;
    image_url: string;
  };
  label: string;
  value: string;
};

export type CartFormProps = {
  mode: "view" | "create" | "edit";
  initialData?: Cart;
  onSubmit: (data: any, setError: any) => void;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
};

export const useCartForm = ({
  mode,
  initialData,
  onSubmit,
  isOpen,
}: CartFormProps) => {
  const MAX_TOPPING_ITEMS = 10;
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [customerSelected, setCustomerSelected] = useState<Customer | null>(
    null,
  );
  const [customerCache, setCustomerCache] = useState<Customer[]>([]);
  const [franchiseSelected, setFranchiseSelected] = useState<any | null>(null);
  const [franchiseCache, setFranchiseCache] = useState<any[]>([]);
  const [productFranchiseCache, setProductFranchiseCache] = useState<
    productFranchise[]
  >([]);
  const [productFranchiseSelected, setProductFranchiseSelected] =
    useState<productFranchise | null>(null);
  const [toppingOptions, setToppingOptions] = useState<ToppingOption[]>([]);
  const [toppingSelected, setToppingSelected] = useState<
    Record<string, number>
  >({});

  const { register, reset, control, getValues, setValue, setError } = useForm({
    defaultValues: {
      customer_id: "",
      franchise_id: "",
      product_franchise_id: "",
      quantity: 1,
      note: "",
      options: [] as { product_franchise_id: string; quantity: number }[],
    },
  });

  const selectedProductFranchiseId = useWatch({
    control,
    name: "product_franchise_id",
  });
  const quantityValue = useWatch({ control, name: "quantity" });

  // Reset logic
  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        // Dùng setTimeout 0 để đưa việc reset vào hàng chờ, tránh lỗi re-render tầng
        const timer = setTimeout(() => {
          setSelectedItems([]);
          setCustomerSelected(null);
          setFranchiseSelected(null);
          setProductFranchiseSelected(null);
          setProductFranchiseCache([]);
          setToppingOptions([]);
          setToppingSelected({});
          reset({
            customer_id: "",
            franchise_id: "",
            product_franchise_id: "",
            quantity: 1,
            note: "",
            options: [],
          });
        }, 0);
        return () => clearTimeout(timer);
      } else {
        reset(initialData || {});
      }
    }
  }, [isOpen, mode, initialData, reset]);

  const fetchCustomers = async ({ pageNum, pageSize, searchKey }: any) => {
    const res = await searchCustomersUsecase({
      searchCondition: {
        keyword: searchKey || "",
        is_active: "",
        is_deleted: false,
      },
      pageInfo: { pageNum, pageSize },
    });
    if (res.success) {
      setCustomerCache((prev) => [
        ...prev,
        ...res.data.filter((n: any) => !prev.some((o) => o.id === n.id)),
      ]);
      return {
        data: res.data.map((c: any) => ({
          label: `${c.name} (${c.phone || c.email})`,
          value: c.id,
        })),
        pageInfo: res.pageInfo,
      };
    }
    return {
      data: [],
      pageInfo: { pageNum: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    };
  };

  const fetchFranchise = async ({ pageNum, pageSize, searchKey }: any) => {
    const response = await searchFranchsie({
      searchCondition: {
        keyword: searchKey || "",
        is_active: true,
        is_deleted: false,
      },
      pageInfo: { pageNum, pageSize },
    });
    if (response.success) {
      setFranchiseCache((prev) => [
        ...prev,
        ...response.data.filter((n: any) => !prev.some((o) => o.id === n.id)),
      ]);
      return {
        data: response.data.map((f: any) => ({ label: f.name, value: f.id })),
        pageInfo: response.pageInfo,
      };
    }
    return {
      data: [],
      pageInfo: { pageNum: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    };
  };

  const fetchProductFranchise = async ({
    pageNum,
    pageSize,
    searchKey,
  }: any) => {
    if (!franchiseSelected?.id)
      return {
        data: [],
        pageInfo: { pageNum: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
      };

    const response = await searchProductFranchise({
      searchCondition: {
        franchise_id: franchiseSelected.id,
        product_id: searchKey || undefined,
        is_active: true,
        is_deleted: false,
      },
      pageInfo: { pageNum, pageSize },
    });

    if (response.success) {
      setProductFranchiseCache((prev) => [
        ...prev,
        ...response.data.filter((n: any) => !prev.some((o) => o.id === n.id)),
      ]);
      return {
        data: response.data.map((pf: productFranchise) => ({
          label: `${pf.product_name} - (${pf.size}) - ${pf.price_base.toLocaleString("vi-VN")}đ`,
          value: pf.id,
        })),
        pageInfo: response.pageInfo,
      };
    }
    return {
      data: [],
      pageInfo: { pageNum: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    };
  };

  useEffect(() => {
    const getToppings = async () => {
      setToppingSelected({});

      const currentFranchiseId = franchiseSelected?.id || initialData?.franchise_id;

      if (!currentFranchiseId) {
        setToppingOptions([]);
        setToppingSelected({});
        return;
      }
      // const toppingCategoryId = getToppingCategoryId();
      // if (!toppingCategoryId) return;

      try {
        const cate = await getCategoryFranchise(currentFranchiseId,);
        console.log(cate);
        if (cate) {
          const toppingcate = cate.find((c: any) =>
            c.category_name.toLocaleLowerCase().includes("topping"),
          );
          if (!toppingcate) {
            setToppingOptions([]);
            return;
          }
          const response = await getPublicProducts({
            franchiseId: currentFranchiseId,
            categoryId: toppingcate.category_id,
          });
          if (response && response?.length > 0) {
            const mappedData = response?.flatMap((p) =>
              p.category_name.toLocaleLowerCase().includes("topping")
                ? p.sizes.map((s) => ({
                    product_data: {
                      product_franchise_id: s.product_franchise_id,
                      price: s.price,
                      name: p.name,
                      image_url: p.image_url,
                    },
                    label: `${p.name} ${s.size ? `(${s.size})` : ""} - ${s.price.toLocaleString("vi-VN")}đ`,
                    value: s.product_franchise_id,
                  }))
                : [],
            );
            setToppingOptions(mappedData);
          }
        } else {
          setToppingOptions([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy topping:", error);
      }
    };
    getToppings();
  }, [franchiseSelected?.id, initialData?.franchise_id]);

  const totalSelectedCount = useMemo(
    () => Object.values(toppingSelected).reduce((sum, count) => sum + count, 0),
    [toppingSelected],
  );

  // Cart Actions
  const addItemToList = () => {
    const currentValues = getValues();
    if (!currentValues.product_franchise_id)
      return alert("Vui lòng chọn sản phẩm");
    const selectedProd = productFranchiseCache.find(
      (p) => p.id === currentValues.product_franchise_id,
    );
    const newItem = {
      product_franchise_id: currentValues.product_franchise_id,
      product_name: selectedProd?.product_name,
      size: selectedProd?.size,
      quantity: currentValues.quantity,
      note: currentValues.note,
      options: Object.entries(toppingSelected)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => ({ product_franchise_id: id, quantity: q })),
    };

    setSelectedItems([...selectedItems, newItem]);
    setValue("product_franchise_id", "");
    setValue("quantity", 1);
    setValue("note", "");
    setToppingSelected({});
    setProductFranchiseSelected(null);
  };

  const handleFinalSubmit = () => {
    if (mode === "edit") {
      
    }else{
      if (selectedItems.length === 0) return toast.error("Giỏ hàng đang trống");
    onSubmit(
      {
        customer_id: customerSelected?.id,
        franchise_id: franchiseSelected?.id,
        items: selectedItems,
      },
      setError,
    );
    }; 
  };

  const updateQuantity = (val: number) => {
    setValue("quantity", Math.max(1, (quantityValue || 1) + val));
  };

  return {
    initialData,
    state: {
      selectedItems,
      customerSelected,
      franchiseSelected,
      productFranchiseSelected,
      selectedProductFranchiseId,
      toppingOptions,
      toppingSelected,
      totalSelectedCount,
      MAX_TOPPING_ITEMS,
      customerCache,
      franchiseCache,
      productFranchiseCache,
    },
    form: { register, control, setValue },
    handlers: {
      fetchCustomers,
      fetchFranchise,
      fetchProductFranchise,
      setToppingSelected,
      setSelectedItems,
      setCustomerSelected,
      setFranchiseSelected,
      setProductFranchiseSelected,
      setCustomerCache,
      setFranchiseCache,
      setProductFranchiseCache,
      addItemToList,
      handleFinalSubmit,
      updateQuantity,
      handleIncreaseTopping: (id: string) => {
        if (totalSelectedCount < MAX_TOPPING_ITEMS) {
          setToppingSelected((prev) => ({
            ...prev,
            [id]: (prev[id] || 0) + 1,
          }));
        }
      },
      handleDecreaseTopping: (id: string) => {
        if ((toppingSelected[id] || 0) > 0) {
          setToppingSelected((prev) => ({ ...prev, [id]: prev[id] - 1 }));
        }
      },
      removeItem: (idx: number) =>
        setSelectedItems((prev) => prev.filter((_, i) => i !== idx)),
      getToppingDisplayName: (id: string) =>
        toppingOptions.find((o) => o.value === id)?.label || id,
    },
  };
};
