import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';

const useSingleUser = () => {
    const { user } = useAuth();

    const { data: singleUser = {}, isLoading: loadingSingleUser, refetch } = useQuery({
        queryKey: ['singleUser', user?.email],
        queryFn: async () => {
            const url = `http://localhost:5000/user/${user.email}`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [singleUser, loadingSingleUser, refetch];
};

export default useSingleUser;