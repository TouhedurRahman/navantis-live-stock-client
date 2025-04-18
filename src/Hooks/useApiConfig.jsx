const useApiConfig = () => {
    // const baseUrl = 'http://localhost:5000';
    // VITE_BASE_URL = http://localhost:5000;

    const baseUrl = import.meta.env.VITE_BASE_URL;
    return baseUrl;
};

export default useApiConfig;