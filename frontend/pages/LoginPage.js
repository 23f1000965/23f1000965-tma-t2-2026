const LoginPage = {
    template: `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-5">
                    <div class="card shadow-sm">
                        <div class="card-body p-4">
                            <h3 class="card-title text-center mb-4">Login</h3>
                            <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
                            <form @submit.prevent="handleLogin">
                                <div class="mb-3">
                                    <label for="loginEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="loginEmail"
                                           v-model="email" required placeholder="you@example.com">
                                </div>
                                <div class="mb-3">
                                    <label for="loginPassword" class="form-label">Password</label>
                                    <input type="password" class="form-control" id="loginPassword"
                                           v-model="password" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Login</button>
                            </form>
                            <p class="text-center mt-3 mb-0">
                                New trekker? <router-link to="/register">Register here</router-link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            email: "",
            password: "",
            errorMsg: "",
        };
    },
    methods: {
        async handleLogin() {
            this.errorMsg = "";
            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    this.$root.login(data.role, data.access_token);
                    if (data.role === "ADMIN") {
                        this.$router.push("/admin/dashboard");
                    } else if (data.role === "STAFF") {
                        this.$router.push("/staff/dashboard");
                    } else {
                        this.$router.push("/");
                    }
                } else {
                    this.errorMsg = data.message || "Invalid email or password.";
                }
            } catch (error) {
                this.errorMsg = "An error occurred. Please try again.";
            }
        },
    },
};

export default LoginPage;
