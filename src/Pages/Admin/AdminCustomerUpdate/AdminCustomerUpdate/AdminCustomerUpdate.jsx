import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useCustomer from "../../../../Hooks/useCustomer";
import useOrders from "../../../../Hooks/useOrders";

const AdminCustomerUpdate = () => {
    const [customers] = useCustomer();
    const [orders] = useOrders();

    return (
        <>
            <div>
                <PageTitle
                    from={"Admin"}
                    to={"Customer Update"}
                />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Admin customer update</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                <div>

                </div>
            </div>
        </>
    );
};

export default AdminCustomerUpdate;