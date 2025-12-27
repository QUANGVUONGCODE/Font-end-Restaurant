import React from "react";
import Food from "../components/food/Food";
import Footer from "../components/home/Footer";
import AboutMe from "../components/home/AboutMe";
import Header from "../components/header/Header";
const heroImage = require('../assets/slider/slider.jpg');
const aboutImage = require('../assets/slider/about.jpg');
const MenuPage = () => {
    return (
        <>
        <Header />
            <Food />
            <AboutMe aboutImage={aboutImage} />
        </>
    );
};

export default MenuPage;