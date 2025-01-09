import { useQuery } from "@tanstack/react-query";

const useAllUsers = () => {
    const { data: allUsers = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['allUsers'],
        queryFn: async () => {
            const url = 'http://localhost:5000/users';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [allUsers, loading, refetch];
};

export default useAllUsers;