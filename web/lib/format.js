const trimNumber = (value) => {
  return Number(value.toFixed(2)).toString();
};

export const formatPrice = (price) => {
  if (price >= 10000000) {
    return `₹${trimNumber(price / 10000000)} Cr`;
  }
  if (price >= 100000) {
    return `₹${trimNumber(price / 100000)} Lakh`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
};
