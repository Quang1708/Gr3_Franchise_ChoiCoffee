import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { getAllCategory } from "./services/category07.service";
import type { Category } from "./models/category.model";
import { CRUDModalTemplate } from "../Admin/template/CRUDModal.template";
import { FormInput } from "../Admin/Form/FormInput";
import { toastError, toastSuccess } from "@/utils/toast.util";
import { postCategoryFranchise } from "./services/categoryFranchise01.service";

type CategoryFranchiseFormData = {
    category_id: string;
    display_order: number;
}

type categoryFranchiseCreateModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    franchiseId: string; 
}

const CategoryFranchiseCreateModal = ( { isOpen, onClose, onSuccess, franchiseId }: categoryFranchiseCreateModalProps ) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null); 
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);

    const {
        register,
        handleSubmit: handleFormSubmit,
        formState: { errors },
        setValue,
        reset
    } = useForm<CategoryFranchiseFormData>({
        mode: "onChange",
        defaultValues: {
            category_id: "",
            display_order: 1
        }
    });

    useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        setValue("category_id", category.value);
        setSearch("");
        setIsOpenDropdown(false);
    }

    useEffect(() => {
    const handleCategoryOpen = () => {
        if (isOpen) {
        setSelectedCategory(null); // Đưa selected về null
        setSearch("");             // Xóa chữ đang gõ dở trong ô tìm kiếm
        setIsOpenDropdown(false);  // Đảm bảo dropdown đang đóng
        reset({
            category_id: "",
            display_order: 1
        });
      }
    }
     handleCategoryOpen();
  }, [isOpen, reset]);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await getAllCategory();
                
                if(response) {
                    setCategories(response);
                }
                
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategory();
    }, [])

    const onSubmit = async (data: CategoryFranchiseFormData) => {
        if (!selectedCategory) {
            toastError("Vui lòng chọn một danh mục");
            return;
        }       
        try {
            const response = await postCategoryFranchise(
                data.category_id,
                franchiseId,
                data.display_order
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
    }
  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleFormSubmit(onSubmit)}
      title="Danh mục"
      mode="create"
      maxWidth="max-w-md"
      children={
        <div className="flex flex-col gap-6 h-80">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
              Chọn danh mục <span className="text-red-500">*</span>
            </label>
            <div
              ref={dropdownRef}
              className="relative w-full"
            >
              <input
                type="hidden"
                {...register("category_id", {
                  required: "Vui lòng chọn danh mục"
                })}
                value={selectedCategory ? selectedCategory.value : ""}
              />
              <div
                className={`relative flex items-center w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all outline-none cursor-pointer ${
                  errors.category_id 
                    ? "border-red-500" 
                    : "border-gray-200 hover:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
                }`}
                onClick={() => setIsOpenDropdown(true)}
              >
                {selectedCategory && search === "" ? (
                  <span className="flex-1 text-gray-900 font-medium truncate">
                    {selectedCategory.name}
                  </span>
                ) : (
                  <input
                    type="text"
                    className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-900"
                    placeholder="Nhập danh mục"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setIsOpenDropdown(true);
                    }}
                    onFocus={() => setIsOpenDropdown(true)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpenDropdown(true);
                    }}
                  />
                )}

                <svg
                  className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-200 shrink-0 ${isOpenDropdown ? "rotate-180" : ""}`}
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

              {isOpenDropdown && (
                <ul className="absolute z-50 w-full mt-2 py-1 overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 focus:outline-none">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <li
                        key={category.code}
                        className="px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                        onClick={() => handleCategorySelect(category)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-6 text-center">
                      <span className="text-sm text-gray-400">Không tìm thấy danh mục</span>
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
                message: "Vị trí phải lớn hơn hoặc bằng 1"
              },
              valueAsNumber: true
            })}
            error={errors.display_order}
            defaultValue="1"
          />
        </div>
      }
    />
  );
}

export default CategoryFranchiseCreateModal