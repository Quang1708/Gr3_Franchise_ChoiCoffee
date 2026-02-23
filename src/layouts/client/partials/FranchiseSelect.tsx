import type { Franchise } from "@/models/franchise.model";


type Props = {
  isOpen: boolean;
  franchises: Franchise[];
  selectedFranchise: number;
  onSelectFranchise: (franchiseId: number) => void;
}

const FranchiseSelect = ({ isOpen, franchises, selectedFranchise, onSelectFranchise }: Props) => {
  const selectedBranchId = localStorage.getItem("selectedFranchise");
    const selectedBranch = franchises.find(franchise => franchise.id === Number(selectedBranchId));

  return (
    <>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {selectedBranch ? selectedBranch.name : "Chọn khu vực"}
        </span>
      </div>

      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 max-h-80 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 pb-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Chọn chi nhánh
            </p>
          </div>
          
          
          <div className="py-1">
            {franchises.length > 0 ? (
              franchises.map((franchise) => (
                <button
                  key={franchise.id}
                  onClick={() => onSelectFranchise(franchise.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    
                    <div className="flex flex-col items-start">
                      <span className={`font-medium ${
                        selectedFranchise === franchise.id 
                          ? 'text-primary' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {franchise.name}
                      </span>
                      {/* {franchise.address && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {franchise.address}
                        </span>
                      )} */}
                    </div>
                  </div>
                  
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Không có chi nhánh nào
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default FranchiseSelect