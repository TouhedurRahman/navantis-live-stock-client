import { useQuery } from "@tanstack/react-query";

const useCustomer = () => {
    const { data: customers = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const url = 'http://localhost:5000/customers';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [customers, loading, refetch];
};

export default useCustomer;