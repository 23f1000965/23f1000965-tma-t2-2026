import HomePage from "../pages/HomePage.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";

const routes = [
    { path: "/", component: HomePage, name: "Home" },
    { path: "/login", component: LoginPage, name: "Login" },
    { path: "/register", component: RegisterPage, name: "Register" },
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("authToken");
    const publicPages = ["/", "/login", "/register"];
    const authRequired = !publicPages.includes(to.path);

    if (authRequired && !token) {
        return next("/login");
    }

    next();
});

export default router;
