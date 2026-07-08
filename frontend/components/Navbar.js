const Navbar = {
    props: ["userRole", "isAuthenticated"],
    template: `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <router-link class="navbar-brand" to="/">
                    <i class="bi bi-mountain"></i> TMA
                </router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#mainNav" aria-controls="mainNav"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="mainNav">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <router-link class="nav-link" to="/">Home</router-link>
                        </li>
                    </ul>
                    <!-- Authenticated View -->
                    <div class="d-flex align-items-center" v-if="isAuthenticated">
                        <span class="badge bg-secondary me-3">{{ userRole }}</span>
                        <button class="btn btn-outline-light btn-sm" @click="$emit('logout')">
                            Logout
                        </button>
                    </div>
                    <!-- Guest View -->
                    <div class="d-flex align-items-center" v-else>
                        <router-link class="btn btn-outline-light btn-sm me-2" to="/login">Login</router-link>
                        <router-link class="btn btn-primary btn-sm" to="/register">Register</router-link>
                    </div>
                </div>
            </div>
        </nav>
    `,
};

export default Navbar;
