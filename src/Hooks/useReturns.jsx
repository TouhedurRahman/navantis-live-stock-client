import { useQuery } from "@tanstack/react-query";

const useReturns = () => {
    const { data: returns = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['returns'],
        queryFn: async () => {
            const url = 'http://localhost:5000/returns';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [returns, loading, refetch];
};

export default useReturns;