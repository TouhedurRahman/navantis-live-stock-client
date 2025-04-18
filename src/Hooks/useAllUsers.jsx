import { useQuery } from "@tanstack/react-query";
import useApiConfig from "./useApiConfig";

const useAllUsers = () => {
    const baseUrl = useApiConfig();

    const { data: allUsers = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['allUsers'],
        queryFn: async () => {
            const url = `${baseUrl}/users`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [allUsers, loading, refetch];
};

export default useAllUsers;