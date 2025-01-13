import { useQuery } from "@tanstack/react-query";

const usePharmacies = () => {
    const { data: pharmacies = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['pharmacies'],
        queryFn: async () => {
            const url = '/pharmacies.json';
            // const url = 'http://localhost:5000/';
            const result = await fetch(url);
            return result.json();
        }
    })

    return [pharmacies, loading, refetch];
};

export default usePharmacies;