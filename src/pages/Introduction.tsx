
import Header from "../components/header/Header";
import AboutMe from "../components/home/AboutMe";
import Footer from "../components/home/Footer";
import Slider from "../components/home/Slider";
import AboutSection from "../components/introduction/AboutSection";
import CustomerReviews from "../components/introduction/Reviews";
const sliderImage = require('../assets/slider/slider.jpg');
const aboutImage = require('../assets/slider/about.jpg');
const heroImage = require('../assets/slider/slider.jpg');
const spaceImage = require('../assets/slider/P2.jpg');
const foodImage = require('../assets/slider/P1.jpg');

const HomePage: React.FC = () => {
    return (
        <>
            <Header />
            <AboutSection wineImage={sliderImage} foodImage={foodImage} spaceImage={spaceImage} />
            <CustomerReviews />
            <AboutMe aboutImage={aboutImage} />
            <Footer heroImage={heroImage} />
        </>
    );
};

export default HomePage;