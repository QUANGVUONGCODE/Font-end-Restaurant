import BlogDetailPage from "../components/blog/BlogDetailPage";
import BlogPage from "../components/blog/BlogPage";
import Header from "../components/header/Header";
import AboutMe from "../components/home/AboutMe";
const aboutImage = require('../assets/slider/about.jpg');

const BlogDetail = () => {
    return (
        <>
            <Header />
            <BlogDetailPage />
            <AboutMe aboutImage={aboutImage} />
        </>
    );
};

export default BlogDetail;
