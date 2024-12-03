import { useQuery } from "@tanstack/react-query";

const useWhProducts = () => {
    const { data: whProducts = [], isLoading: whProductsLoading, refetch } = useQuery({
        queryKey: ['whProducts'],
        queryFn: async () => {
            const url = 'http://localhost:5000/wh-products';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [whProducts, whProductsLoading, refetch];
};

export default useWhProducts;