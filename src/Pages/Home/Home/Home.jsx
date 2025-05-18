import PageTitle from '../../../Components/PageTitle/PageTitle';
/* import useOrders from '../../../Hooks/useOrders';
import useReturns from '../../../Hooks/useReturns'; */

const Home = () => {
    /* const [orders] = useOrders();
    const [returns] = useReturns();

    const orderInvoiceNumbers = orders.map(order => order.invoice);
    const returnInvoiceNotInOrders = returns
        .filter(ret => !orderInvoiceNumbers.includes(ret.invoice))
        .map(ret => ret.invoice); */

    return (
        <div>
            <div>
                <PageTitle
                    from={"Account"}
                    to={"Dashboard"}
                />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">My dashboard</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                <div>
                    <p className="text-gray-600 font-mono font-extrabold text-center mb-6">
                        Comming soon...
                    </p>
                    {/* {returnInvoiceNotInOrders.length > 0 && (
                        <div className="px-6 mt-4">
                            <h2 className="font-bold mb-2 text-red-600">
                                Returns not found in Orders:
                            </h2>
                            <ul className="list-disc list-inside text-sm text-gray-700">
                                {returnInvoiceNotInOrders.map((invoice, idx) => (
                                    <li key={idx}>{invoice}</li>
                                ))}
                            </ul>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
};

export default Home;