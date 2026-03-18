import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { getAllCategory } from "./services/category07.service";
import type { Category } from "./models/category.model";
import { CRUDModalTemplate } from "../Admin/template/CRUDModal.template";
import { FormInput } from "../Admin/Form/FormInput";
import { toastError, toastSuccess } from "@/utils/toast.util";
import { postCategoryFranchise } from "./services/categoryFranchise01.service";
import { getAllFranchises } from "./services/franchise08.service";
import type { Franchise } from "./models/franchise08.model";
import { getCategoryFranchise } from "@/pages/admin/category/services/categoryFranchise02.service";
import { Check } from "lucide-react";

type CategoryFranchiseFormData = {
  franchise_id: string;
  category_id: string;
  display_order: number;
};

type categoryFranchiseCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  franchiseId: string;
  showFranchiseSelect: boolean;
};

const CategoryFranchiseCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
  franchiseId,
  showFranchiseSelect,
}: categoryFranchiseCreateModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [franchiseSearch, setFranchiseSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(
    null,
  );
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const franchiseDropdownRef = useRef<HTMLDivElement>(null);
  const [isOpenCategoryDropdown, setIsOpenCategoryDropdown] = useState(false);
  const [isOpenFranchiseDropdown, setIsOpenFranchiseDropdown] = useState(false);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [existingCategoryIds, setExistingCategoryIds] = useState<Set<string>>(
    new Set(),
  );

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CategoryFranchiseFormData>({
    mode: "onChange",
    defaultValues: {
      franchise_id: "",
      category_id: "",
      display_order: 1,
    },
  });

  const fetchExistingCategoryFranchise = async (targetFranchiseId: string) => {
    if (!targetFranchiseId) {
      setExistingCategoryIds(new Set());
      return;
    }

      try {
        const response = await getCategoryFranchise({
          searchCondition: {
            franchise_id: targetFranchiseId,
            
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 1000,
          },
        });

      const ids = new Set<string>(
        (response?.data ?? [])
          .map((item: { category_id?: string }) => item?.category_id)
          .filter((id): id is string => Boolean(id)),
      );
      setExistingCategoryIds(ids);
    } catch (error) {
      console.error("Error fetching category franchise data:", error);
      toastError("Có lỗi xảy ra khi tải danh mục đã tồn tại");
    }
  };

  useEffect(() => {
    const fetchFranchise = async () => {
      try {
        const response = await getAllFranchises();
        if (response) {
          console.log("re", response);
          setFranchises(response);
        }
      } catch (error) {
        console.error("Error fetching franchises:", error);
      }
    };
    fetchFranchise();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInsideCategory = categoryDropdownRef.current?.contains(target);
      const isInsideFranchise = franchiseDropdownRef.current?.contains(target);

      if (!isInsideCategory && !isInsideFranchise) {
        setIsOpenCategoryDropdown(false);
        setIsOpenFranchiseDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      category.code.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  const filteredFranchises = franchises.filter(
    (franchise) =>
      franchise.name.toLowerCase().includes(franchiseSearch.toLowerCase()) ||
      franchise.code.toLowerCase().includes(franchiseSearch.toLowerCase()),
  );

  const getTargetFranchiseId = () => {
    const normalizedPropFranchiseId =
      franchiseId && franchiseId !== "unknown" ? franchiseId : "";
    return showFranchiseSelect
      ? selectedFranchise?.value || ""
      : normalizedPropFranchiseId;
  };

  const handleFranchiseSelect = (franchise: Franchise) => {
    setSelectedFranchise(franchise);
    setValue("franchise_id", franchise.value);
    setFranchiseSearch("");
    setIsOpenFranchiseDropdown(false);
    fetchExistingCategoryFranchise(franchise.value);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setValue("category_id", category.value);
    setCategorySearch("");
    setIsOpenCategoryDropdown(false);
  };

  useEffect(() => {
    const handleFranchiseOpen = () => {
      if (isOpen) {
        setSelectedFranchise(null);
        setFranchiseSearch("");
        setExistingCategoryIds(new Set());
        setIsOpenFranchiseDropdown(false);
        reset({
          franchise_id: "",
          category_id: "",
          display_order: 1,
        });
      }
    };
    handleFranchiseOpen();
  }, [isOpen, reset]);

  useEffect(() => {
    const handleCategoryOpen = () => {
      if (isOpen) {
        setSelectedCategory(null); // Đưa selected về null
        setCategorySearch(""); // Xóa chữ đang gõ dở trong ô tìm kiếm
        setExistingCategoryIds(new Set());
        setIsOpenCategoryDropdown(false); // Đảm bảo dropdown đang đóng
        reset({
          franchise_id: "",
          category_id: "",
          display_order: 1,
        });
      }
    };
    handleCategoryOpen();
  }, [isOpen, reset]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await getAllCategory();

        if (response) {
          setCategories(response);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategory();
  }, []);

  const onSubmit = async (data: CategoryFranchiseFormData) => {
    if (!selectedCategory) {
      toastError("Vui lòng chọn một danh mục");
      return;
    }

    const normalizedPropFranchiseId =
      franchiseId && franchiseId !== "unknown" ? franchiseId : "";
    const finalFranchiseId = normalizedPropFranchiseId || data.franchise_id;

    if (!finalFranchiseId) {
      toastError("Vui lòng chọn chi nhánh");
      return;
    }

    try {
      const response = await postCategoryFranchise(
        data.category_id,
        finalFranchiseId,
        data.display_order,
      );
      if (response) {
        toastSuccess("Thêm danh mục thành công");
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Error posting category franchise:", error);
      toastError("Có lỗi xảy ra khi thêm danh mục");
    }
  };
  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleFormSubmit(onSubmit)}
      title="Danh mục"
      mode="create"
      maxWidth="max-w-md"
      children={
        <div className="flex flex-col gap-6 h-100">
          {showFranchiseSelect && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                Chọn chi nhánh <span className="text-red-500">*</span>
              </label>
              <div ref={franchiseDropdownRef} className="relative w-full">
                <input
                  type="hidden"
                  {...register("franchise_id", {
                    required: "Vui lòng chọn chi nhánh",
                  })}
                  value={selectedFranchise ? selectedFranchise.value : ""}
                />
                <div
                  className={`relative flex items-center w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all outline-none cursor-pointer ${
                    errors.franchise_id
                      ? "border-red-500"
                      : "border-gray-200 hover:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
                  }`}
                  onClick={() => {
                    setIsOpenCategoryDropdown(false);
                    setIsOpenFranchiseDropdown(true);
                  }}
                >
                  {selectedFranchise && franchiseSearch === "" ? (
                    <span className="flex-1 text-gray-900 font-medium truncate">
                      {selectedFranchise.name}
                    </span>
                  ) : (
                    <input
                      type="text"
                      className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-900"
                      placeholder="Nhập chi nhánh"
                      value={franchiseSearch}
                      onChange={(e) => {
                        setFranchiseSearch(e.target.value);
                        setIsOpenFranchiseDropdown(true);
                      }}
                      onFocus={() => setIsOpenFranchiseDropdown(true)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpenFranchiseDropdown(true);
                      }}
                    />
                  )}

                  <svg
                    className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-200 shrink-0 ${isOpenFranchiseDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {isOpenFranchiseDropdown && (
                  <ul className="absolute z-50 w-full mt-2 py-1 overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 focus:outline-none">
                    {filteredFranchises.length > 0 ? (
                      filteredFranchises.map((franchise) => (
                        <li
                          key={franchise.code}
                          className="px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                          onClick={() => handleFranchiseSelect(franchise)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {franchise.name}
                            </span>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-6 text-center">
                        <span className="text-sm text-gray-400">
                          Không tìm thấy chi nhánh
                        </span>
                      </li>
                    )}
                  </ul>
                )}
              </div>
              {errors.franchise_id && (
                <span className="text-[10px] text-red-500 italic mt-1">
                  {errors.franchise_id.message}
                </span>
              )}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
              Chọn danh mục <span className="text-red-500">*</span>
            </label>
            <div ref={categoryDropdownRef} className="relative w-full">
              <input
                type="hidden"
                {...register("category_id", {
                  required: "Vui lòng chọn danh mục",
                })}
                value={selectedCategory ? selectedCategory.value : ""}
              />
              <div
                className={`relative flex items-center w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all outline-none cursor-pointer ${
                  errors.category_id
                    ? "border-red-500"
                    : "border-gray-200 hover:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
                }`}
                onClick={() => {
                  setIsOpenFranchiseDropdown(false);
                  setIsOpenCategoryDropdown(true);
                  fetchExistingCategoryFranchise(getTargetFranchiseId());
                }}
              >
                {selectedCategory && categorySearch === "" ? (
                  <span className="flex-1 text-gray-900 font-medium truncate">
                    {selectedCategory.name}
                  </span>
                ) : (
                  <input
                    type="text"
                    className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-900"
                    placeholder="Nhập danh mục"
                    value={categorySearch}
                    onChange={(e) => {
                      setCategorySearch(e.target.value);
                      setIsOpenCategoryDropdown(true);
                    }}
                    onFocus={() => setIsOpenCategoryDropdown(true)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpenCategoryDropdown(true);
                    }}
                  />
                )}

                <svg
                  className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-200 shrink-0 ${isOpenCategoryDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {isOpenCategoryDropdown && (
                <ul className="custom-scroll absolute z-50 w-full mt-2 py-1 overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 focus:outline-none">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => {
                      const isExisting = existingCategoryIds.has(
                        category.value,
                      );
                      return (
                        <li
                          key={category.code}
                          className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                            isExisting
                              ? "bg-primary/10 text-primary hover:bg-primary/20"
                              : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                          }`}
                          onClick={() => handleCategorySelect(category)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{category.name}</span>
                            {isExisting ? (
                              <span
                                className=" text-primary"
                                aria-label="already-exists"
                              >
                                <Check />
                              </span>
                            ) : null}
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-4 py-6 text-center">
                      <span className="text-sm text-gray-400">
                        Không tìm thấy danh mục
                      </span>
                    </li>
                  )}
                </ul>
              )}
            </div>
            {errors.category_id && (
              <span className="text-[10px] text-red-500 italic mt-1">
                {errors.category_id.message}
              </span>
            )}
          </div>
          <FormInput
            label="Vị trí"
            type="number"
            placeholder="Nhập vị trí"
            register={register("display_order", {
              required: "Vui lòng nhập vị trí",
              min: {
                value: 1,
                message: "Vị trí phải lớn hơn hoặc bằng 1",
              },
              valueAsNumber: true,
            })}
            error={errors.display_order}
            defaultValue="1"
          />
        </div>
      }
    />
  );
};

export default CategoryFranchiseCreateModal;
