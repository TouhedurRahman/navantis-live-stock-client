import { Link } from "react-router-dom";

const PageTitle = ({ from, to }) => {
    return (
        <div className="bg-white p-5 mb-2">
            <h1><Link to="/" className="hover:link">Dashboard</Link> / {from} / <span className="font-bold">{to}</span></h1>
        </div>
    );
};

export default PageTitle;