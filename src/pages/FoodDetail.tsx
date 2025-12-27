import React, { useState, } from 'react';
import Header from '../components/header/Header';
import GetFoodDetail from '../components/food/GetFoodDetail';
import AboutMe from '../components/home/AboutMe';
const aboutImage = require('../assets/slider/about.jpg');

const FoodDetailPage = () => {
    return (
        <>
            <Header />
            <GetFoodDetail />
            <AboutMe aboutImage={aboutImage} />
        </>
    );
};

export default FoodDetailPage;
