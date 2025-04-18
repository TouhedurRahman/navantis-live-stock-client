const useApiConfig = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    return baseUrl;
};

export default useApiConfig;