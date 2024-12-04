import { useQuery } from "@tanstack/react-query";

const useUpdatePrice = () => {
    const { data: updatePrices = [], isLoading: updatePricesLoading, refetch } = useQuery({
        queryKey: ['updatePrices'],
        queryFn: async () => {
            const url = 'http://localhost:5000/price-update';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [updatePrices, updatePricesLoading, refetch];
};

export default useUpdatePrice;