import { useNavigate } from "react-router-dom"

export const useNavigation = () => {
    const navigate = useNavigate();

    return{
        goToHome: () => navigate("/"),
        goToMenu: () => navigate("/menu"),
        goToIntroduction: () => navigate("/introduction"),
        goToFoodDetail: (id: number) => navigate(`/menu/${id}`),
        goToCart: () => navigate("/cart"),
        goToOrderForm: () => navigate("/order"),
        goToLogin: () => navigate("/login"),
        goToRegister: () => navigate("/register"),
        goToBlog: () => navigate("/blog/"),
        goToBlogDetail: (id: number) => navigate(`/blog/${id}`),
        goToOrderHistory: () => navigate("/order-history"),
        goToDashboard: () => navigate("/admin/dashboard"),
        goToCategoriesDashboard: () => navigate("/admin/categories"),
        goToInfo: () => navigate("/info"),
    }
}