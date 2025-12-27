
import Header from '../components/header/Header';
import GetFoodDetail from '../components/food/GetFoodDetail';
import AboutMe from '../components/home/AboutMe';
import CartDetail from '../components/cart/CartDetail';
const aboutImage = require('../assets/slider/about.jpg');

const CartDetailPage = () => {
    return (
        <>
            <Header />
            <CartDetail />
        </>
    );
};

export default CartDetailPage;
