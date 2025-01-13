import { useQuery } from "@tanstack/react-query";

const useTempUsers = () => {
    const { data: tempUsers = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['tempUsers'],
        queryFn: async () => {
            const url = '/users';
            // const url = 'http://localhost:5000/users';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [tempUsers, loading, refetch];
};

export default useTempUsers;