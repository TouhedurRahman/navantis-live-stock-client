import { useQuery } from "@tanstack/react-query";
import useApiConfig from "./useApiConfig";

const useDepotRequest = () => {
    const baseUrl = useApiConfig();

    const { data: depotReqProducts = [], isLoading: dptReqLoading, refetch: dptReqRefetch } = useQuery({
        queryKey: ['depotReqProducts'],
        queryFn: async () => {
            const url = `${baseUrl}/depot-request`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [depotReqProducts, dptReqLoading, dptReqRefetch];
};

export default useDepotRequest;