import { useQuery } from "@tanstack/react-query";
import useApiConfig from "./useApiConfig";

const useWhProducts = () => {
    const baseUrl = useApiConfig();

    const { data: whProducts = [], isLoading: whProductsLoading, refetch } = useQuery({
        queryKey: ['whProducts'],
        queryFn: async () => {
            const url = `${baseUrl}/wh-products`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [whProducts, whProductsLoading, refetch];
};

export default useWhProducts;