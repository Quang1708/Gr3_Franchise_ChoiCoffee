
import type { Franchise } from "@/components/categoryFranchise/models/client06.model";
import { getFranchiseName } from "@/components/categoryFranchise/services/client06.service";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const MapScript = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [franchise, setFranchise] = useState<Franchise | null>(null);

    const franchiseId = localStorage.getItem("selectedFranchise");

    

    useEffect(() => {
        const fetchFranchise = async () => {
            try {
                const response = await getFranchiseName(franchiseId || "");
                if (response) {
                    setFranchise(response);
                }
            } catch (error) {
                console.error("Error fetching franchise:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (franchiseId) {
            fetchFranchise();
        }
    }, [franchiseId]);

    if(isLoading) {
        return (
            <Loader2 className="animate-spin" />
        );
    }

  return (
    <div className="w-full h-full border-0 contrast-[1.1]"
        dangerouslySetInnerHTML={{ __html: franchise?.google_map_script || "" }}
    >     
    </div>
  )
}



export default MapScript;