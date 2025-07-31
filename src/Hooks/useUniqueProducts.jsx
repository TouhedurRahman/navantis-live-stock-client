import { useMemo } from 'react';
import useDepotProducts from './useDepotProducts';
import useOrders from './useOrders';
import useWhProducts from './useWhProducts';

const useUniqueProducts = () => {
    const [wearhouseProducts] = useWhProducts();
    const [depotProducts] = useDepotProducts();
    const [orderdProducts] = useOrders();

    const uniqueProducts = useMemo(() => {
        const productMap = new Map();

        const addToMap = (product) => {
            const name = (product.productName || product.name)?.trim().toLowerCase();
            const netWeight = product.netWeight?.trim().toLowerCase();
            const key = `${name}|${netWeight}`;

            if (!productMap.has(key)) {
                productMap.set(key, {
                    productName: product.productName || product.name,
                    netWeight: product.netWeight,
                    productCode: product.productCode || "",
                });
            }
        };

        wearhouseProducts?.forEach(addToMap);
        depotProducts?.forEach(addToMap);
        orderdProducts?.forEach(order => {
            order.products?.forEach(addToMap);
        });

        return Array.from(productMap.values()).sort((a, b) =>
            a.productName.localeCompare(b.productName)
        );
    }, [wearhouseProducts, depotProducts, orderdProducts]);

    return [uniqueProducts];
};

export default useUniqueProducts;