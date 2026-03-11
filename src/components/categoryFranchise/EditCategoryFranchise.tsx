import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import type { CategoryFranchise } from "./models/categotyFranchise03.model";
import type { GetCategoryByIdResponse } from "./models/category03.model";
import type { CategoryItem } from "@/pages/admin/category/models/categoryFranchise02.model";
import { getCategoryFranchiseById } from "./services/categoryFranchise03.service";
import { getCategoryById } from "./services/category03.service";
import { FormInput } from "../Admin/Form/FormInput";
import { Loader2 } from "lucide-react";
import { getFranchiseName } from "./services/client06.service";
import { useForm } from "react-hook-form";
import { updateDisplayOrder } from "./services/categoryFranchise07.service";
import { toastError, toastSuccess } from "@/utils/toast.util";

type EditCategoryFranchiseProps = {
    category: CategoryItem ;
    onClose: () => void;
    onSuccess: () => void;
}

export type EditCategoryFranchiseRef = {
  submit: () => Promise<void>;
};

const EditCategoryFranchise = forwardRef<
  EditCategoryFranchiseRef,
  EditCategoryFranchiseProps
>(({ category, onClose, onSuccess }, ref) => {
  const [categoryFranchise, setCategoryFranchise] = useState<CategoryFranchise | null>(null);
  const [categoryData, setCategoryData] = useState<GetCategoryByIdResponse | null>(null);
  const [franchiseName, setFranchiseName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      display_order: 0,
    },
  });
  const onSubmit = async (data: { display_order: number }) => {
    if (isSaving || !categoryFranchise) return; 
    if (data.display_order < 0) {
      toastError("Thứ tự hiển thị phải lớn hơn hoặc bằng 0");
      return;
    }
    console.log("data", data.display_order);
    setIsSaving(true);
    try {
      const response = await updateDisplayOrder(categoryFranchise.id, {
        display_order: data.display_order,
      });
      if (response?.success===true) {
        toastSuccess("Cập nhật thứ tự hiển thị thành công");
        onSuccess();
        onClose();
      } else {
        toastError("Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating display order:", error);
      toastError("Cập nhật thất bại");
    } finally {
      setIsSaving(false);
    }
  };
  useImperativeHandle(ref, () => ({
    submit: async () => {
      await handleSubmit(onSubmit)();
    },
  }));

  const getFranchiseById = async (franchiseId: string) => {
    setIsLoading(true);
    try {
      const response = await getFranchiseName(franchiseId);
      if (response) {
        return response?.name ?? "N/A";
      }
    } catch (error) {
      console.error("Error fetching franchise name:", error);
      return "N/A";
    } finally {
      setIsLoading(false);
    }
    return "N/A";
  };

  useEffect(() => {
    const fetchFranchiseName = async () => {
      if (!categoryFranchise?.franchise_id) return;

      const name = await getFranchiseById(categoryFranchise.franchise_id);
      setFranchiseName(name);
    };

    fetchFranchiseName();
  }, [categoryFranchise]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await getCategoryById(category.category_id);
        if (response) {
          setCategoryData(response);
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };
    fetchCategoryData();
  }, [category]);

  useEffect(() => {
    const fetchCategoryFranchise = async () => {
      try {
        const response = await getCategoryFranchiseById(category.id);
        if (response) {
          setCategoryFranchise(response);
          setValue("display_order", response.display_order);
        }
      } catch (error) {
        console.error("Error fetching category franchise data:", error);
      }
    };
    fetchCategoryFranchise();
  }, [category, setValue]);

  if (!categoryData || !categoryFranchise || isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const displayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="flex flex-col gap-6 ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
        <div className="flex flex-col gap-6">
          <FormInput
            type="text"
            label="Tên danh mục"
            defaultValue={categoryData?.name || ""}
            isDisabled={true}
            register={{}}
          />

          <FormInput
            type="text"
            label="Mô tả"
            defaultValue={categoryData.description || ""}
            isDisabled={true}
            register={{}}
          />
          <FormInput
            type="number"
            label="Thứ tự hiển thị"
            defaultValue={categoryFranchise.display_order}
            register={register("display_order", {
              required: "Thứ tự hiển thị là bắt buộc",
              min: {
                value: 0,
                message: "Thứ tự hiển thị phải lớn hơn hoặc bằng 0",
              },
              valueAsNumber: true,
            })}
            error={errors.display_order}
            isDisabled={isSaving}
          />
        </div>
        <div className="flex flex-col gap-6">
          <FormInput
            type="text"
            label="Mã danh mục"
            defaultValue={categoryData.code}
            isDisabled={true}
            register={{}}
          />

          <FormInput
            type="text"
            label="Chi nhánh hiển thị"
            defaultValue={franchiseName}
            isDisabled={true}
            register={{}}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
        <div className="flex flex-col gap-6">
          <FormInput
            type="text"
            label="Ngày tạo"
            isDisabled={true}
            defaultValue={displayDate(categoryFranchise.created_at)}
            register={{
              
            }}
          />
        </div>
        <div className="flex flex-col gap-6">
          <FormInput
            type="text"
            label="Ngày cập nhật"
            isDisabled={true}
            defaultValue={displayDate(categoryFranchise.updated_at)}
            register={{}}
          />
        </div>
      </div>
    </div>
  );
});

EditCategoryFranchise.displayName = "EditCategoryFranchise";

export default EditCategoryFranchise