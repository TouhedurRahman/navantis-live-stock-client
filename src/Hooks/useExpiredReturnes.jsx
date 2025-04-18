import { useQuery } from '@tanstack/react-query';
import useApiConfig from './useApiConfig';

const useExpiredReturnes = () => {
    const baseUrl = useApiConfig();

    const { data: expiredReturns = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['expiredReturns'],
        queryFn: async () => {
            const url = `${baseUrl}/expired-returns`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [expiredReturns, loading, refetch];
};

export default useExpiredReturnes;