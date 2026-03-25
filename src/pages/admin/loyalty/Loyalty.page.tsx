/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAdminContextStore } from "@/stores";

import {
  CRUDPageTemplate,
  type Column,
} from "@/components/Admin/template/CRUDPage.template";
import ClientLoading from "@/components/Client/Client.Loading";

import type { LoyaltyRule } from "@/pages/admin/loyalty/models/loyalty.model";
import { searchLoyaltyRulesUsecase } from "@/pages/admin/loyalty/usecases/searchLoyalty02.usecase";
import { getLoyaltyDetailUsecase } from "@/pages/admin/loyalty/usecases/getLoyalty03.usecase";
import { createLoyaltyUsecase } from "@/pages/admin/loyalty/usecases/createLoyalty01.usecase";
import { updateLoyaltyUsecase } from "@/pages/admin/loyalty/usecases/updateLoyalty04.usecase";

import FormSelect from "@/components/Admin/form/FormSelect";
import { FormInput } from "@/components/Admin/form/FormInput";
import { LoyaltyForm } from "@/pages/admin/loyalty/components/LoyaltyForm";
import type { SearchLoyaltyRequest } from "@/pages/admin/loyalty/models/searchLoyalty.model";

const LoyaltyPage = () => {
  // --- Kiểm tra quyền Admin & franchise được chọn ---
  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );
  const isAdmin = selectedFranchiseId === null;

  // --- Form ---
  const { register, getValues, reset, watch } = useForm({
    defaultValues: {
      franchise_id: selectedFranchiseId || "",
      earn_amount_per_point: "",
      redeem_value_per_point: "",
    },
  });

  // --- State ---
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [franchiseOptions, setFranchiseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [tiers, setTiers] = useState<{ value: string; label: string }[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- State Modal ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedRule, setSelectedRule] = useState<LoyaltyRule | null>(null);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await searchLoyaltyRulesUsecase({
        searchCondition: {
          franchise_id: selectedFranchiseId || "",
          is_active: "",
          is_deleted: "false",
        },
        pageInfo: { pageNum: 1, pageSize: 10000 },
      });

      if (res.success && res.data) {
        const fMap = new Map();
        const tMap = new Map();
        res.data.forEach((rule: any) => {
          if (rule.franchise_id)
            fMap.set(String(rule.franchise_id), rule.franchise_name);
          rule.tier_rules?.forEach((t: any) => tMap.set(t.tier, t.tier));
        });

        setFranchiseOptions([
          { label: "Tất cả chi nhánh", value: "" },
          ...Array.from(fMap, ([value, label]) => ({ value, label })),
        ]);
        setTiers(Array.from(tMap, ([value, label]) => ({ value, label })));
      }
    } catch (e) {
      console.error("Lỗi lấy filter options:", e);
    }
  }, [selectedFranchiseId]);

  // --- Lấy danh sách Loyalty Rules ---
  const fetchLoyaltyRules = useCallback(
    async (
      pageNum = 1,
      type: "full" | "table" = "full",
      size = pageSize,
      searchParams?: { searchTerm?: string; filters?: any; formData?: any },
    ) => {
      try {
        if (type === "full") setIsLoading(true);
        if (type === "table") setIsTableLoading(true);

        const currentFormData = searchParams?.formData || getValues();
        const filters = searchParams?.filters || {};

        const payload: SearchLoyaltyRequest = {
          searchCondition: {
            franchise_id:
              currentFormData.franchise_id || selectedFranchiseId || "",
            earn_amount_per_point: currentFormData.earn_amount_per_point || "",
            redeem_value_per_point:
              currentFormData.redeem_value_per_point || "",

            tier: filters.tier || "",
            is_active:
              filters.is_active === "true"
                ? true
                : filters.is_active === "false"
                  ? false
                  : "",
            is_deleted:
              filters.is_deleted === "true"
                ? true
                : filters.is_deleted === "false"
                  ? false
                  : "",
          },
          pageInfo: { pageNum, pageSize: size },
        };

        const res = await searchLoyaltyRulesUsecase(payload);

        if (res.success) {
          setRules(res.data);
          setTotalItems(res.pageInfo.totalItems);
          setPage(res.pageInfo.pageNum);
        }
      } catch {
        toast.error("Lỗi kết nối hệ thống");
      } finally {
        setIsLoading(false);
        setIsTableLoading(false);
      }
    },
    [pageSize, selectedFranchiseId, getValues],
  );

  useEffect(() => {
    fetchFilterOptions();
    fetchLoyaltyRules(1, "full");
  }, [fetchFilterOptions]);

  // --- Xử lý mở Modal ---
  const handleOpenForm = async (
    mode: "create" | "edit" | "view",
    rule?: LoyaltyRule,
  ) => {
    setFormMode(mode);
    if (mode === "create") {
      setSelectedRule(null);
      setIsFormOpen(true);
      return;
    }
    if (!rule) return;
    setIsFormOpen(true);
    try {
      const res = await getLoyaltyDetailUsecase(rule.id);
      if (res.success) setSelectedRule(res.data);
      else toast.error("Không lấy được chi tiết");
    } catch {
      toast.error("Lỗi khi lấy chi tiết");
    }
  };

  // --- Xử lý submit form Loyalty ---
  const handleSubmitLoyalty = async (data: any) => {
    try {
      setIsProcessing(true);
      if (formMode === "create") {
        await createLoyaltyUsecase(data);
        toast.success("Thêm mới thành công");
      } else if (formMode === "edit" && selectedRule) {
        await updateLoyaltyUsecase(selectedRule.id, data);
        toast.success("Cập nhật thành công");
      }
      setIsFormOpen(false);
      fetchLoyaltyRules(page, "table");
    } catch (error: any) {
      const errorData = error?.response?.data || error;
      if (
        errorData?.errors &&
        Array.isArray(errorData.errors) &&
        errorData.errors.length > 0
      ) {
        errorData.errors.forEach((e: any) =>
          toast.error(e.message || "Lỗi không xác định"),
        );
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else {
        toast.error("Thao tác thất bại");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Xử lý tìm kiếm ---
  const handleSearch = (term?: string, filters?: any) => {
    const currentForm = getValues();

    fetchLoyaltyRules(1, "table", pageSize, {
      searchTerm: term,
      filters,
      formData: currentForm,
    });
  };

  const handleRefresh = () => {
    const defaults = {
      franchise_id: selectedFranchiseId || "",
      earn_amount_per_point: "",
      redeem_value_per_point: "",
    };
    reset(defaults);
    fetchLoyaltyRules(1, "full", pageSize, {
      formData: defaults,
      filters: { tier: "", is_active: "", is_deleted: "false" },
    });
    toast.success("Làm mới thành công");
  };

  // --- Columns bảng ---
  const columns: Column<LoyaltyRule>[] = useMemo(() => {
    // Danh sách màu badge có sẵn
    const tierColors = [
      "bg-gray-200 text-gray-800",
      "bg-yellow-200 text-yellow-800",
      "bg-blue-200 text-blue-800",
      "bg-green-200 text-green-800",
      "bg-purple-200 text-purple-800",
      "bg-pink-200 text-pink-800",
    ];

    return [
      ...(isAdmin
        ? [
            {
              header: "Chi Nhánh",
              accessor: "franchise_name" as keyof LoyaltyRule,
              render: (item: any) => (
                <div className="text-[14px] font-semibold text-gray-800">
                  {item.franchise_name || "N/A"}
                </div>
              ),
            },
          ]
        : []),
      // {
      //   header: "Mô tả quy tắc",
      //   accessor: "description",
      //   className: "text-[14px] font-medium text-blue-600 max-w-[250px] truncate",
      //   sortable: true,
      // },
      {
        header: "Tỷ lệ đổi điểm",
        accessor: "earn_amount_per_point",
        render: (item) => (
          <div className="text-[14px] space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 italic w-8">Tích:</span>
              <span className="font-bold text-green-600">
                {item.earn_amount_per_point?.toLocaleString()}đ = 1 points
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 italic w-8">Tiêu:</span>
              <span className="font-bold text-orange-600">
                1 points = {item.redeem_value_per_point?.toLocaleString()}đ
              </span>
            </div>
          </div>
        ),
      },
      {
        header: "Hạng thành viên",
        accessor: "tier_rules",
        render: (item) => {
          const tierColorMap = new Map<string, string>();
          item.tier_rules?.forEach((t: any) => {
            if (!tierColorMap.has(t.tier)) {
              tierColorMap.set(
                t.tier,
                tierColors[tierColorMap.size % tierColors.length],
              );
            }
          });

          return (
            <div className="flex flex-wrap gap-2">
              {item.tier_rules?.map((t: any) => {
                const range =
                  t.min_points && t.max_points
                    ? `${t.min_points.toLocaleString()} – ${t.max_points.toLocaleString()} points`
                    : t.min_points
                      ? `Từ ${t.min_points.toLocaleString()} points`
                      : "";
                return (
                  <span
                    key={t.tier}
                    className={`px-2 py-1 text-[13px] font-semibold rounded-full ${tierColorMap.get(t.tier)}`}
                    title={range}
                  >
                    {t.tier}
                  </span>
                );
              })}
            </div>
          );
        },
      },
    ];
  }, [isAdmin]);

  return (
    <>
      {isLoading && <ClientLoading />}
      {isProcessing && (
        <div className="fixed inset-0 z-200 flex items-center justify-center">
          <ClientLoading />
        </div>
      )}

      <CRUDPageTemplate<LoyaltyRule>
        title="Cấu hình Loyalty & Membership"
        data={rules}
        columns={columns}
        pageSize={pageSize}
        totalItems={totalItems}
        currentPage={page}
        onPageChange={(p) => fetchLoyaltyRules(p, "table")}
        onPageSizeChange={(s) => {
          setPageSize(s);
          fetchLoyaltyRules(1, "full", s);
        }}
        searchContent={
          <div className="flex flex-wrap items-center gap-3 w-full">
            {isAdmin && (
              <div className="flex-1">
                <FormSelect
                  label=""
                  options={franchiseOptions}
                  register={register("franchise_id")}
                  placeholder="Chi nhánh"
                  value={watch("franchise_id")}
                />
              </div>
            )}
            <div className="flex-1">
              <FormInput
                label=""
                type="number"
                placeholder="Tiền chi tiêu / 1 điểm"
                register={register("earn_amount_per_point")}
              />
            </div>
            <div className="flex-1">
              <FormInput
                label=""
                type="number"
                placeholder="Giá trị / 1 điểm"
                register={register("redeem_value_per_point")}
              />
            </div>
          </div>
        }
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onAdd={() => handleOpenForm("create")}
        onView={(item) => handleOpenForm("view", item)}
        onEdit={(item) => handleOpenForm("edit", item)}
        isTableLoading={isTableLoading}
        filters={[
          { key: "tier" as any, label: "Hạng thành viên", options: tiers },
          {
            key: "is_active",
            label: "Trạng thái",
            options: [
              { value: "true", label: "Đang hoạt động" },
              { value: "false", label: "Tạm ngưng" },
            ],
          },
          {
            key: "is_deleted",
            label: "Trạng thái xóa",
            options: [
              { value: "false", label: "Còn tồn tại" },
              { value: "true", label: "Đã xóa" },
            ],
          },
        ]}
      />

      <LoyaltyForm
        isOpen={isFormOpen}
        mode={formMode}
        initialData={selectedRule || undefined}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSubmitLoyalty}
        isLoading={isProcessing}
        isAdmin={isAdmin}
        selectedFranchiseId={selectedFranchiseId || undefined}
        existingFranchiseIds={rules
          .map((r) => r.franchise_id)
          .filter((id): id is string => typeof id === "string")}
      />
    </>
  );
};

export default LoyaltyPage;
