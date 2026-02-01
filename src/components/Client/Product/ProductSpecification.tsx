
import type { Product } from "./type";
type ProductSpecificationProps = {
    product: Product
};
const ProductSpecification = ( {product}: ProductSpecificationProps) => {
    const specifications = (cate:string) => {
        switch(cate) {
            case "coffee-beans":
                return(
                    <>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Vùng trồng</span>
                        <span className="font-medium">{product.specifications?.origin}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Mức độ rang</span>
                        <span className="font-medium">{product.specifications?.roastLevel}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Quy cách đóng gói</span>
                        <span className="font-medium">{product.specifications?.grindSize}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Hạn sử dụng</span>
                        <span className="font-medium">12 tháng kể từ NSX</span>
                    </div>
                    </>                   
                ) 
            case "machines":
                return(
                    <>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Công suất</span>
                        <span className="font-medium">{product.specifications?.power}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Tiêu thụ</span>
                        <span className="font-medium">{product.specifications?.voltage}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Dung tích</span>
                        <span className="font-medium">{product.specifications?.capacity}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Chất liệu</span>
                        <span className="font-medium">{product.specifications?.material}</span>
                    </div>
                     <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Bảo hành</span>
                        <span className="font-medium">{product.specifications?.warranty}</span>
                    </div>
                    </> 
                )
       
            case "supplies":
                    return(
                         <>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Xuất xứ</span>
                        <span className="font-medium">{product.specifications?.origin}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Chất liệu</span>
                        <span className="font-medium">{product.specifications?.material}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Bảo hành</span>
                        <span className="font-medium">{product.specifications?.warranty}</span>
                    </div>
                    </>
                    )
            case "tools":
                return(
                         <>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Xuất xứ</span>
                        <span className="font-medium">{product.specifications?.origin}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Chất liệu</span>
                        <span className="font-medium">{product.specifications?.material}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-clay dark:text-[#a5947d]">Bảo hành</span>
                        <span className="font-medium">{product.specifications?.warranty}</span>
                    </div>
                    </>
                    )

    }
}
  return (
    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
        {specifications(product.category)}
    </div>
  )
}


export default ProductSpecification