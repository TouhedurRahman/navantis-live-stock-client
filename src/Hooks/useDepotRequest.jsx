import { useQuery } from "@tanstack/react-query";

const useDepotRequest = () => {
    const { data: depotReqProducts = [], isLoading: dptReqLoading, refetch: dptReqRefetch } = useQuery({
        queryKey: ['depotReqProducts'],
        queryFn: async () => {
            const url = 'http://localhost:5000/depot-request';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [depotReqProducts, dptReqLoading, dptReqRefetch];
};

export default useDepotRequest;