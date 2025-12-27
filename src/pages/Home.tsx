
import FoodPage from "../components/food/GetFood4";
import Header from "../components/header/Header";
import AboutMe from "../components/home/AboutMe";
import Footer from "../components/home/Footer";
import Time from "../components/home/Time";
import Slider from "../components/home/Slider";
const heroImage = require('../assets/slider/slider.jpg');
const aboutImage = require('../assets/slider/about.jpg');
const sliderImage = require('../assets/slider/slider.jpg');

const HomePage: React.FC = () => {
    return (
        <>
            <Header />
            <Slider sliderImage={sliderImage} />
            <FoodPage />
            <Time />
            <AboutMe aboutImage={aboutImage} />
            <Footer heroImage={heroImage} />
        </>
    );
};

export default HomePage;