import React from 'react';
import LoginPage from '../loggin/LogginPage';
import Header from '../components/header/Header';
const aboutImage = require('../assets/slider/about.jpg');

const Loggin = () => {
    return (
        <>
        <Header />
            <LoginPage heroImage={aboutImage} />
        </>
    );
};

export default Loggin;
