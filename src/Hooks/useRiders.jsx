import { useQuery } from "@tanstack/react-query";

const useRiders = () => {
    const { data: riders = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['riders'],
        queryFn: async () => {
            const url = 'http://localhost:5000/riders';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [riders, loading, refetch];
};

export default useRiders;