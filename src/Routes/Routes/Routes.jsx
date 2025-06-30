import { createBrowserRouter } from "react-router-dom";
import Main from "../../Layout/Main/Main";
import DailyCollections from "../../Pages/Accounts/DailyCollections/DailyCollections/DailyCollections";
import DueList from "../../Pages/Accounts/DueList/DueList/DueList";
import MPOStatement from "../../Pages/Accounts/MPOStatement/MPOStatement/MPOStatement";
import AdminDamagedExpiredList from "../../Pages/Admin/AdminDamagedExpiredList/AdminDamagedExpiredList";
import Customer from "../../Pages/Admin/Customer/Customer";
import DamageRequest from "../../Pages/Admin/DamageRequest/DamageRequest";
import DepotRequest from "../../Pages/Admin/DepotRequest/DepotRequest";
import ExpireRequest from "../../Pages/Admin/ExpireRequest/ExpireRequest";
import ExReturnReq from "../../Pages/Admin/ExReturnReq/ExReturnReq";
import MissingProductsList from "../../Pages/Admin/MissingProductsList/MissingProductsList";
import PriceUpdateList from "../../Pages/Admin/PriceUpdateList/PriceUpdateList";
import PurchaseList from "../../Pages/Admin/PurchaseList/PurchaseList";
import PurchaseOrder from "../../Pages/Admin/PurchaseOrder/PurchaseOrder";
import WarehouseStockRequest from "../../Pages/Admin/WarehouseStockRequest/WarehouseStockRequest";
import AddNewCustomer from "../../Pages/Customer/AddNewCustomer/AddNewCustomer";
import CustomerList from "../../Pages/Customer/CustomerList/CustomerList";
import CustomerRequest from "../../Pages/Customer/CustomerRequest/CustomerRequest";
import UpdateCustomer from "../../Pages/Customer/UpdateCustomer/UpdateCustomer";
import DeliveryReport from "../../Pages/Depot/DeliveryReport/DeliveryReport";
import DepotExpiredProduct from "../../Pages/Depot/DepotExpiredProduct/DepotExpiredProduct";
import DepotProductsList from "../../Pages/Depot/DepotProductsList/DepotProductsList";
import DepotRecieveReq from "../../Pages/Depot/DepotRecieveReq/DepotRecieveReq";
import DepotStockInList from "../../Pages/Depot/DepotStockInList/DepotStockInList";
import DepotStockOutList from "../../Pages/Depot/DepotStockOutList/DepotStockOutList";
import DispatchRider from "../../Pages/Depot/DispatchRider/DispatchRider/DispatchRider";
import UpdateRider from "../../Pages/Depot/DispatchRider/UpdateRider/UpdateRider";
import ExpiredReturns from "../../Pages/Depot/ExpiredReturns/ExpiredReturns/ExpiredReturns";
import ExpiredReturnsStatus from "../../Pages/Depot/ExpiredReturns/ExpiredReturnsStatus/ExpiredReturnsStatus";
import InvoicePayment from "../../Pages/Depot/InvoicePayment/InvoicePayment/InvoicePayment";
import OrderDelivery from "../../Pages/Depot/OrderDelivery/OrderDelivery";
import AddDoctorRequisition from "../../Pages/DoctorRequisition/AddDoctorRequisition/AddDoctorRequisition";
import PlaceDrReqOrder from "../../Pages/DoctorRequisition/PlaceDrReqOrder/PlaceDrReqOrder";
import Home from "../../Pages/Home/Home/Home";
import AddNewInstitute from "../../Pages/Institute/AddNewInstitute/AddNewInstitute";
import InstituteList from "../../Pages/Institute/InstituteList/InstituteList";
import PlaceInstituteOrder from "../../Pages/Institute/PlaceInstituteOrder/PlaceInstituteOrder";
import UpdateInstitute from "../../Pages/Institute/UpdateInstitute/UpdateInstitute";
import MyOrder from "../../Pages/Order/MyOrder/MyOrder";
import MyOrderReport from "../../Pages/Order/MyOrderReport/MyOrderReport";
import PlaceOrder from "../../Pages/Order/PlaceOrder/PlaceOrder";
import Profile from "../../Pages/Profile/Profile/Profile";
import ExpireReturns from "../../Pages/ReportsComponents/ExpireReturns/ExpireReturns";
import NetSales from "../../Pages/ReportsComponents/NetSales/NetSales";
import ProductsSalesReturn from "../../Pages/ReportsComponents/ProductsSalesReturn/ProductsSalesReturn";
import ProductSummary from "../../Pages/ReportsComponents/ProductSummary/ProductSummary";
import SalesReturns from "../../Pages/ReportsComponents/SalesReturns/SalesReturns";
import SetTarget from "../../Pages/Target/SetTarget/SetTarget";
import Territory from "../../Pages/Territory/Territory/Territory";
import AllUsers from "../../Pages/Users/AllUsers/AllUsers";
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
            /********** Institute **********/
            {
                path: "/add-institute",
                element: <AddNewInstitute />
            },
            {
                path: "/institute-list",
                element: <InstituteList />
            },
            {
                path: "/update-institute/:id",
                element: <UpdateInstitute />
            },
            {
                path: "/institute-order",
                element: <PlaceInstituteOrder />
            },
            /********** Dr. Requisition **********/
            {
                path: "/add-requision",
                element: <AddDoctorRequisition />
            },
            {
                path: "/dr-req-order",
                element: <PlaceDrReqOrder />
            },
            /********** Customer **********/
            {
                path: "/add-customer",
                element: <AddNewCustomer />
            },
            {
                path: "/customer-request",
                element: <CustomerRequest />
            },
            {
                path: "/update-customer/:id",
                element: <UpdateCustomer />
            },
            {
                path: "/customer-list",
                element: <CustomerList />
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
                path: "/ex-return-req",
                element: <ExReturnReq />
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
                path: "/dmg-exp",
                element: <AdminDamagedExpiredList />
            },
            {
                path: "/customer-admin",
                element: <Customer />
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
            /********** Depot **********/
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
                path: "/depot-out",
                element: <DepotStockOutList />
            },
            {
                path: "/depot-expired",
                element: <DepotExpiredProduct />
            },
            {
                path: "/expired-returns-status",
                element: <ExpiredReturnsStatus />
            },
            {
                path: "/expired-returns",
                element: <ExpiredReturns />
            },
            {
                path: "/dispatch-rider",
                element: <DispatchRider />
            },
            {
                path: "/update-rider/:id",
                element: <UpdateRider />
            },
            {
                path: "/order-delivery",
                element: <OrderDelivery />
            },
            {
                path: "/invoice-payment",
                element: <InvoicePayment />
            },
            {
                path: "/delivery-report",
                element: <DeliveryReport />
            },
            /********** Target **********/
            {
                path: '/set-target',
                element: <SetTarget />
            },
            /********** Accounts Reports **********/
            {
                path: "/daily-collections",
                element: <DailyCollections />
            },
            {
                path: "/due-payments",
                element: <DueList />
            },
            {
                path: "/mpo-statement",
                element: <MPOStatement />
            },
            /********** Order **********/
            {
                path: "/place-order",
                element: <PlaceOrder />
            },
            {
                path: "/my-order",
                element: <MyOrder />
            },
            {
                path: "/my-order-report",
                element: <MyOrderReport />
            },
            /********** Profile **********/
            {
                path: '/profile',
                element: <Profile />
            },
            {
                path: '/all-users',
                element: <AllUsers />
            },
            {
                path: '/territory',
                element: <Territory />
            },
            /********** Sales Reports & Summary **********/
            {
                path: '/net-sales-report',
                element: <NetSales />
            },
            {
                path: '/product-summary',
                element: <ProductSummary />
            },
            {
                path: '/sales-returns',
                element: <SalesReturns />
            },
            {
                path: '/products-sales-returns',
                element: <ProductsSalesReturn />
            },
            {
                path: '/expire-returns',
                element: <ExpireReturns />
            },
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