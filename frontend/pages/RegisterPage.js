const RegisterPage = {
    template: `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-5">
                    <div class="card shadow-sm">
                        <div class="card-body p-4">
                            <h3 class="card-title text-center mb-4">Register as Trekker</h3>
                            <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
                            <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
                            <form @submit.prevent="handleRegister">
                                <div class="mb-3">
                                    <label for="registerName" class="form-label">Full Name</label>
                                    <input type="text" class="form-control" id="registerName"
                                           v-model="name" required placeholder="John Doe">
                                </div>
                                <div class="mb-3">
                                    <label for="registerEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="registerEmail"
                                           v-model="email" required placeholder="you@example.com">
                                </div>
                                <div class="mb-3">
                                    <label for="registerContact" class="form-label">Contact Number</label>
                                    <input type="text" class="form-control" id="registerContact"
                                           v-model="contact" required placeholder="1234567890">
                                </div>
                                <div class="mb-3">
                                    <label for="registerPassword" class="form-label">Password</label>
                                    <input type="password" class="form-control" id="registerPassword"
                                           v-model="password" required>
                                </div>
                                <div class="mb-3">
                                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                                    <input type="password" class="form-control" id="confirmPassword"
                                           v-model="confirmPassword" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Register</button>
                            </form>
                            <p class="text-center mt-3 mb-0">
                                Already registered? <router-link to="/login">Login here</router-link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            name: "",
            email: "",
            contact: "",
            password: "",
            confirmPassword: "",
            errorMsg: "",
            successMsg: "",
        };
    },
    methods: {
        async handleRegister() {
            this.errorMsg = "";
            this.successMsg = "";

            if (this.password !== this.confirmPassword) {
                this.errorMsg = "Passwords do not match.";
                return;
            }

            try {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: this.name,
                        email: this.email,
                        contact: this.contact,
                        password: this.password,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    this.successMsg = "Registration successful! Redirecting to login...";
                    setTimeout(() => {
                        this.$router.push("/login");
                    }, 1500);
                } else {
                    this.errorMsg = data.message || "Registration failed.";
                }
            } catch (error) {
                this.errorMsg = "An error occurred during registration. Please try again.";
            }
        },
    },
};

export default RegisterPage;
