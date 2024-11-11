import { createBrowserRouter } from "react-router-dom";
import Main from "../../Layout/Main/Main";
import Home from "../../Pages/Home/Home/Home";
import WarehouseAddProduct from "../../Pages/Warehouse/WarehouseAddProduct/WarehouseAddProduct";
import WhProductsList from "../../Pages/Warehouse/WhProductsList/WhProductsList";
import StockInList from "../../Pages/Warehouse/StockInList/StockInList";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Main />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/add-product-warehouse",
                element: <WarehouseAddProduct />
            },
            {
                path: "/warehouse-list",
                element: <WhProductsList />
            },
            {
                path: "/warehouse-in",
                element: <StockInList />
            }
        ],
    },
]);

export default router;