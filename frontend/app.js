import Navbar from "./components/Navbar.js";
import router from "./utils/router.js";

const RootApp = {
    components: {
        "navbar-component": Navbar,
    },
    template: `
        <div>
            <navbar-component
                :is-authenticated="isAuthenticated"
                :user-role="userRole"
                @logout="logout"
            ></navbar-component>
            <router-view></router-view>
        </div>
    `,
    data() {
        return {
            isAuthenticated: false,
            userRole: null,
            authToken: null,
        };
    },
    created() {
        // restore session from localStorage on page reload
        const token = localStorage.getItem("authToken");
        const role = localStorage.getItem("userRole");
        if (token && role) {
            this.isAuthenticated = true;
            this.authToken = token;
            this.userRole = role;
        }
    },
    methods: {
        login(role, token) {
            this.isAuthenticated = true;
            this.userRole = role;
            this.authToken = token;
            localStorage.setItem("authToken", token);
            localStorage.setItem("userRole", role);
        },
        logout() {
            this.isAuthenticated = false;
            this.userRole = null;
            this.authToken = null;
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");
            this.$router.push("/login");
        },
    },
};

Vue.createApp(RootApp).use(router).mount("#app");
