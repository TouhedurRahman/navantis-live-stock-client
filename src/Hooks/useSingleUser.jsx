import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useApiConfig from './useApiConfig';

const useSingleUser = () => {
    const { user } = useAuth();
    const baseUrl = useApiConfig();

    const { data: singleUser = {}, isLoading: loadingSingleUser, refetch } = useQuery({
        queryKey: ['singleUser', user?.email],
        queryFn: async () => {
            const url = `${baseUrl}/user/${user.email}`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [singleUser, loadingSingleUser, refetch];
};

export default useSingleUser;