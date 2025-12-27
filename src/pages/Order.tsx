
import Header from '../components/header/Header';
import GetFoodDetail from '../components/food/GetFoodDetail';
import AboutMe from '../components/home/AboutMe';
import CartDetail from '../components/cart/CartDetail';
import Reservation from '../components/order/Reservation';
const aboutImage = require('../assets/slider/about.jpg');

const Order = () => {
    return (
        <>
            <Header />
            <Reservation />
        </>
    );
};

export default Order;
