const findDateRange = (products) => {
    if (!products.length) {
        return { firstDate: null, lastDate: null };
    }

    const sortedDates = products
        .map((product) => new Date(product.date))
        .sort((a, b) => a - b);

    const firstDate = sortedDates[0].toLocaleDateString('en-GB').replace(/\//g, '-');
    const lastDate = sortedDates[sortedDates.length - 1].toLocaleDateString('en-GB').replace(/\//g, '-');

    return { firstDate, lastDate };
};

export default findDateRange;