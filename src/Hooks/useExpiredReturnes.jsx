import { useQuery } from '@tanstack/react-query';

const useExpiredReturnes = () => {
    const { data: expiredReturns = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['expiredReturns'],
        queryFn: async () => {
            const url = 'http://localhost:5000/expired-returns';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [expiredReturns, loading, refetch];
};

export default useExpiredReturnes;