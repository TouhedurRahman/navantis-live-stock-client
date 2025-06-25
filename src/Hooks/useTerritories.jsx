import { useQuery } from '@tanstack/react-query';
import useApiConfig from './useApiConfig';

const useTerritories = () => {
    const baseUrl = useApiConfig();

    const { data: territories, isloading: loading, refetch } = useQuery({
        queryKey: ['territories'],
        queryFn: async () => {
            const url = `${baseUrl}/territories`;
            const result = await fetch(url);
            return result.json();
        }
    });

    return [territories, loading, refetch];
};

export default useTerritories;