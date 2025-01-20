import { useQuery } from "@tanstack/react-query";

const useOrders = () => {
    const { data: orders = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const url = 'http://localhost:5000/orders';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [orders, loading, refetch];
};

export default useOrders;