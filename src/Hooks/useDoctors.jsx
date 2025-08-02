import { useQuery } from "@tanstack/react-query";
import useApiConfig from "./useApiConfig";

const useDoctors = () => {
    const baseUrl = useApiConfig();

    const { data: doctors = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['doctors'],
        queryFn: async () => {
            const url = `${baseUrl}/doctors`;
            const result = await fetch(url);
            return result.json();
        }
    })

    return [doctors, loading, refetch];
};

export default useDoctors;