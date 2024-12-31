import { createBrowserRouter } from "react-router-dom";
import Main from "../../Layout/Main/Main";
import DamageRequest from "../../Pages/Admin/DamageRequest/DamageRequest";
import DepotRequest from "../../Pages/Admin/DepotRequest/DepotRequest";
import ExpireRequest from "../../Pages/Admin/ExpireRequest/ExpireRequest";
import MissingProductsList from "../../Pages/Admin/MissingProductsList/MissingProductsList";
import PriceUpdateList from "../../Pages/Admin/PriceUpdateList/PriceUpdateList";
import PurchaseList from "../../Pages/Admin/PurchaseList/PurchaseList";
import PurchaseOrder from "../../Pages/Admin/PurchaseOrder/PurchaseOrder";
import WarehouseStockRequest from "../../Pages/Admin/WarehouseStockRequest/WarehouseStockRequest";
import DepotExpiredProduct from "../../Pages/Depot/DepotExpiredProduct/DepotExpiredProduct";
import DepotProductsList from "../../Pages/Depot/DepotProductsList/DepotProductsList";
import DepotRecieveReq from "../../Pages/Depot/DepotRecieveReq/DepotRecieveReq";
import DepotStockInList from "../../Pages/Depot/DepotStockInList/DepotStockInList";
import Home from "../../Pages/Home/Home/Home";
import DepotDelivery from "../../Pages/Warehouse/DepotDelivery/DepotDelivery";
import StockInList from "../../Pages/Warehouse/StockInList/StockInList";
import StockOutList from "../../Pages/Warehouse/StockOutList/StockOutList";
import WarehouseAddProduct from "../../Pages/Warehouse/WarehouseAddProduct/WarehouseAddProduct";
import WhDamagedProduct from "../../Pages/Warehouse/WhDamagedProduct/WhDamagedProduct";
import WhProductsList from "../../Pages/Warehouse/WhProductsList/WhProductsList";
import Login from "./LoginAndRegistration/Login/Login";
import Registration from "./LoginAndRegistration/Registration/Registration";

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
                path: "/admin-po",
                element: <PurchaseOrder />
            },
            {
                path: "/purchase-list",
                element: <PurchaseList />
            },
            {
                path: "/warehouse-request",
                element: <WarehouseStockRequest />
            },
            {
                path: "/damage-request",
                element: <DamageRequest />
            },
            {
                path: "/depot-request",
                element: <DepotRequest />
            },
            {
                path: "/expire-request",
                element: <ExpireRequest />
            },
            {
                path: "/missing-products",
                element: <MissingProductsList />
            },
            {
                path: "/price-update",
                element: <PriceUpdateList />
            },
            {
                path: "/add-product-warehouse",
                element: <WarehouseAddProduct />
            },
            {
                path: "/depot-delivery",
                element: <DepotDelivery />
            },
            {
                path: "/warehouse-list",
                element: <WhProductsList />
            },
            {
                path: "/warehouse-in",
                element: <StockInList />
            },
            {
                path: "/warehouse-out",
                element: <StockOutList />
            },
            {
                path: "/damaged-in-warehouse",
                element: <WhDamagedProduct />
            },
            {
                path: "/depot-receive-request",
                element: <DepotRecieveReq />
            },
            {
                path: "/depot-list",
                element: <DepotProductsList />
            },
            {
                path: "/depot-in",
                element: <DepotStockInList />
            },
            {
                path: "/depot-expired",
                element: <DepotExpiredProduct />
            }
        ],
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/registration',
        element: <Registration />
    },
]);

export default router;