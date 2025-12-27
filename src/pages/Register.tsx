import React from 'react';
import LoginPage from '../loggin/LogginPage';
import Header from '../components/header/Header';
import CreateAccountPage from '../loggin/RegisterPage';
const aboutImage = require('../assets/slider/about.jpg');

const Register = () => {
    return (
        <>
        <Header />
            <CreateAccountPage heroImage={aboutImage} />
        </>
    );
};

export default Register;
