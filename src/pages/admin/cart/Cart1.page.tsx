import CustomSelect from "@/components/Admin/filters/CustomSelect";
import {
    CRUDPageTemplate,
    type Column,
} from "@/components/Admin/template/CRUDPage.template";
import { useEffect, useState } from "react";
import { searchCustomersUsecase } from "../customer/usecases/searchCustomers.usecase";
import type { Customer } from "@/models/customer.model";
import { getCustomerCart } from "./usecases/GetCustomerCart.usecase";
import type { Cart } from "./models/getCartResponse.model";
import CartForm from "@/components/cart/CartForm";
import { createCart } from "@/components/cart/usecase/createCart.usecase";
import { toast } from "react-toastify";

const CartPage = () => {
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customerSelected, setCustomerSelected] = useState<Customer | null>(
        null,
    );
    const [customerCache, setCustomerCache] = useState<Customer[]>([]);
    const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
        "create",
    );
    const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCustomers = async ({ pageNum, pageSize, searchKey }: any) => {
        try {
            const res = await searchCustomersUsecase({
                searchCondition: {
                    keyword: searchKey || "",
                    is_active: "",
                    is_deleted: false,
                },
                pageInfo: {
                    pageNum,
                    pageSize, 
                },
            });

            if (res.success) {  
                setCustomerCache((prev) => {
                    const newItems = res.data.filter(
                        (newItem: Customer) =>
                            !prev.some((oldItem) => oldItem.id === newItem.id),
                    );
                    return [...prev, ...newItems];
                });

                return {
                    data: res.data.map((c: Customer) => ({ label: `${c.name} (${c.phone})`, value: c.id })),
                    pageInfo: res.pageInfo, 
                };
            }
            return {
                data: [],
                pageInfo: { pageNum: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
            };
        } catch {
            console.log("Lỗi khi tải customer");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers({ pageNum: 1, pageSize: 10, searchKey: "" });
    }, []);

    const handleSearchCart = async (term: string, filters?: any) => {
        if (!customerSelected) {
            console.warn("Vui lòng chọn khách hàng trước");
            return;
        }
        setLoading(true);
        const status = filters?.status ;
        try {
            const res = await getCustomerCart(customerSelected?.id, status);
            if (res) {
                const finalData = Array.isArray(res) ? res : res?.data || [];
                setCarts(finalData);
            }
        } catch (error) {
            console.error("Lỗi khi tải giỏ hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { }, [customerSelected]);

    const handleOpenForm = (mode: "create" | "edit" | "view", data?: Cart) => {
        setFormMode(mode);
        setSelectedCart(data || null);
        setIsModalOpen(true);
    };
    const columns: Column<Cart>[] = [
        {
            header: "Tên khách hàng",
            accessor: "customer_name",
        },
        {
            header: "Tên chi nhánh",
            accessor: "franchise_name",
        },
        {
            header: "Số lượng sản phẩm",
            accessor: "cart_items",
            render(item) {
                const totalItems = item.cart_items.length;

                return <span className="ml-14">{totalItems}</span>;
            },
        },
        {
            header: "Tổng tiền",
            accessor: "final_amount",
            render(item) {
                return <span>{item.final_amount?.toLocaleString()} đ</span>;
            },
        },

        {
            header: "Trạng thái",
            accessor: "status",
            className: "flex items-center justify-center",
            render(item) {
                return (
                    <div className="flex justify-center items-center w-full">
                        {item.status === "ACTIVE" && (
                            <span className="px-2 py-1 text-[10px] rounded-xl bg-yellow-200 text-yellow-500 text-center">
                                Chưa checkout
                            </span>
                        )}

                        {item.status === "CANCELED" && (
                            <span className="px-2 py-1 text-[10px] rounded-xl bg-red-200 text-red-500 text-center">
                                Đã hủy
                            </span>
                        )}

                        {item.status === "CHECKED_OUT" && (
                            <span className="px-2 py-1 text-[10px] rounded-xl bg-green-200 text-green-500 text-center">
                                Đã checkout
                            </span>
                        )}
                    </div>
                );
            },
        },
    ];

    const hanldeSubmit = async (data: any) => {
        if (formMode === "create") {
            try {
                const response = await createCart(data);
                if (response) {
                    toast.success("Tạo giỏ hàng thành công");
                    setIsModalOpen(false);
                }
            } catch (error) {
                console.error("Lỗi khi tạo giỏ hàng:", error);
                toast.error("Lỗi khi tạo giỏ hàng");
            }
        }
    };

    return (
        <>
            <CRUDPageTemplate
                title="Quản lý giỏ hàng"
                columns={columns}
                canEdit={(item) => item.status === "ACTIVE"}
                data={carts}
                isTableLoading={loading}
                pageSize={10}
                totalItems={0}
                onSearch={handleSearchCart}
                onAdd={() => handleOpenForm("create")}
                onEdit={(item) => handleOpenForm("edit", item)}
                onView={(item) => handleOpenForm("view", item)}
                searchContent={
                    <CustomSelect
                        fetchOnSearchOnly={true} 
                        fetchOptions={fetchCustomers as any}
                        value={customerSelected?.id || ""}
                        placeholder="Nhập tên / SĐT khách hàng để tìm kiếm..." 
                        onChange={(id) => {
                            const selectedCustomer = customerCache.find((c) => c.id === id);
                            setCustomerSelected(selectedCustomer || null);
                        }}
                    />
                }
                filters={[
                    {
                        label: "Trạng thái",
                        key: "status",
                        defaultValue: "ACTIVE",
                        options: [
                            { label: "Chưa checkout", value: "ACTIVE" },
                            { label: "Đã hủy", value: "CANCELED" },
                            { label: "Đã checkout", value: "CHECKED_OUT" },
                        ],
                    },
                ]}
            />
            <CartForm
                isOpen={isModalOpen}
                mode={formMode}
                initialData={selectedCart || undefined}
                onSubmit={hanldeSubmit}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default CartPage;
