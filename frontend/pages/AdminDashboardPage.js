export default {
    name: "AdminDashboardPage",
    template: `
        <div class="container my-4">
            <h2 class="mb-4 d-flex align-items-center">
                <i class="bi bi-shield-lock-fill text-primary me-2"></i>
                Admin Management Console
            </h2>

            <!-- Alert Messages -->
            <div v-if="alert.message" :class="'alert alert-dismissible fade show alert-' + alert.type" role="alert">
                {{ alert.message }}
                <button type="button" class="btn-close" @click="clearAlert" aria-label="Close"></button>
            </div>

            <!-- Stats Summary Cards -->
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm bg-primary text-white h-100">
                        <div class="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-uppercase mb-1 opacity-75 small">Total Treks</h6>
                                <h3 class="mb-0 fw-bold">{{ stats.total_treks }}</h3>
                            </div>
                            <i class="bi bi-compass-fill fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm bg-success text-white h-100">
                        <div class="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-uppercase mb-1 opacity-75 small">Active Staff</h6>
                                <h3 class="mb-0 fw-bold">{{ stats.total_staff }}</h3>
                            </div>
                            <i class="bi bi-people-fill fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm bg-info text-white h-100">
                        <div class="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-uppercase mb-1 opacity-75 small">Total Trekkers</h6>
                                <h3 class="mb-0 fw-bold">{{ stats.total_trekkers }}</h3>
                            </div>
                            <i class="bi bi-person-fill-check fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm bg-warning text-white h-100">
                        <div class="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-uppercase mb-1 opacity-75 small">Bookings</h6>
                                <h3 class="mb-0 fw-bold">{{ stats.total_bookings }}</h3>
                            </div>
                            <i class="bi bi-journal-check fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-header bg-white border-0 py-3">
                    <ul class="nav nav-tabs card-header-tabs" role="tablist">
                        <li class="nav-item">
                            <button class="nav-link active fw-semibold" id="treks-tab" data-bs-toggle="tab" data-bs-target="#treks" type="button" role="tab">
                                <i class="bi bi-compass me-1"></i> Treks
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link fw-semibold" id="staff-tab" data-bs-toggle="tab" data-bs-target="#staff" type="button" role="tab">
                                <i class="bi bi-people me-1"></i> Staff Members
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link fw-semibold" id="trekkers-tab" data-bs-toggle="tab" data-bs-target="#trekkers" type="button" role="tab">
                                <i class="bi bi-person-walking me-1"></i> Trekkers
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link fw-semibold" id="bookings-tab" data-bs-toggle="tab" data-bs-target="#bookings" type="button" role="tab">
                                <i class="bi bi-journal-list me-1"></i> Bookings History
                            </button>
                        </li>
                    </ul>
                </div>
                <div class="card-body tab-content">
                    
                    <!-- Treks Tab -->
                    <div class="tab-pane fade show active" id="treks" role="tabpanel">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0 fw-bold text-secondary">Trek Routes</h5>
                            <button class="btn btn-primary btn-sm" @click="openTrekModal(null)">
                                <i class="bi bi-plus-circle me-1"></i> Add New Trek
                            </button>
                        </div>
                        <div class="table-responsive">
                            <table class="table align-middle table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Location</th>
                                        <th>Difficulty</th>
                                        <th>Duration</th>
                                        <th>Available Slots</th>
                                        <th>Status</th>
                                        <th>Start / End Date</th>
                                        <th>Assigned Staff</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="trek in treks" :key="trek.id">
                                        <td><strong>{{ trek.name }}</strong></td>
                                        <td>{{ trek.location }}</td>
                                        <td>
                                            <span :class="getDifficultyBadgeClass(trek.difficulty)">
                                                {{ trek.difficulty }}
                                            </span>
                                        </td>
                                        <td>{{ trek.duration_days }} days</td>
                                        <td>{{ trek.available_slots }}</td>
                                        <td>
                                            <span :class="getStatusBadgeClass(trek.status)">
                                                {{ trek.status }}
                                            </span>
                                        </td>
                                        <td class="small">{{ trek.start_date }} to {{ trek.end_date }}</td>
                                        <td>
                                            <span v-if="trek.assigned_staff_id">
                                                {{ getStaffName(trek.assigned_staff_id) }}
                                            </span>
                                            <span v-else class="text-muted italic small">Unassigned</span>
                                        </td>
                                        <td>
                                            <button class="btn btn-outline-secondary btn-sm me-1" @click="openTrekModal(trek)">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-outline-danger btn-sm" @click="deleteTrek(trek.id)">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="treks.length === 0">
                                        <td colspan="9" class="text-center text-muted py-4">No treks created yet.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Staff Tab -->
                    <div class="tab-pane fade" id="staff" role="tabpanel">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0 fw-bold text-secondary">Trek Guides / Staff</h5>
                            <button class="btn btn-primary btn-sm" @click="openStaffModal">
                                <i class="bi bi-person-plus me-1"></i> Register New Staff
                            </button>
                        </div>
                        <div class="table-responsive">
                            <table class="table align-middle table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Contact</th>
                                        <th>Account Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="member in staffList" :key="member.id">
                                        <td><strong>{{ member.name }}</strong></td>
                                        <td>{{ member.email }}</td>
                                        <td>{{ member.contact || 'N/A' }}</td>
                                        <td>
                                            <span :class="member.is_active ? 'badge bg-success' : 'badge bg-danger'">
                                                {{ member.is_active ? 'Active' : 'Deactivated' }}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                :class="member.is_active ? 'btn btn-outline-danger btn-sm' : 'btn btn-outline-success btn-sm'"
                                                @click="toggleUserStatus(member.id)"
                                            >
                                                {{ member.is_active ? 'Deactivate' : 'Activate' }}
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="staffList.length === 0">
                                        <td colspan="5" class="text-center text-muted py-4">No staff members registered.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Trekkers Tab -->
                    <div class="tab-pane fade" id="trekkers" role="tabpanel">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0 fw-bold text-secondary">Registered Trekkers</h5>
                            <input 
                                type="text" 
                                class="form-control form-control-sm w-25" 
                                placeholder="Search trekkers..." 
                                v-model="trekkerSearchQuery"
                            />
                        </div>
                        <div class="table-responsive">
                            <table class="table align-middle table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Contact</th>
                                        <th>Account Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="trekker in filteredTrekkers" :key="trekker.id">
                                        <td><strong>{{ trekker.name }}</strong></td>
                                        <td>{{ trekker.email }}</td>
                                        <td>{{ trekker.contact || 'N/A' }}</td>
                                        <td>
                                            <span :class="trekker.is_active ? 'badge bg-success' : 'badge bg-danger'">
                                                {{ trekker.is_active ? 'Active' : 'Deactivated' }}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                :class="trekker.is_active ? 'btn btn-outline-danger btn-sm' : 'btn btn-outline-success btn-sm'"
                                                @click="toggleUserStatus(trekker.id)"
                                            >
                                                {{ trekker.is_active ? 'Deactivate' : 'Activate' }}
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="filteredTrekkers.length === 0">
                                        <td colspan="5" class="text-center text-muted py-4">No trekkers found.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Bookings Tab -->
                    <div class="tab-pane fade" id="bookings" role="tabpanel">
                        <h5 class="mb-3 fw-bold text-secondary">Booking Requests & Payments</h5>
                        <div class="table-responsive">
                            <table class="table align-middle table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Booking ID</th>
                                        <th>Trek Name</th>
                                        <th>User Name</th>
                                        <th>User Email</th>
                                        <th>Booking Date</th>
                                        <th>Booking Status</th>
                                        <th>Payment Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="b in bookings" :key="b.id">
                                        <td>#{{ b.id }}</td>
                                        <td><strong>{{ b.trek_name }}</strong></td>
                                        <td>{{ b.user_name }}</td>
                                        <td>{{ b.user_email }}</td>
                                        <td class="small">{{ formatDate(b.booking_date) }}</td>
                                        <td>
                                            <span :class="getBookingStatusBadge(b.status)">
                                                {{ b.status }}
                                            </span>
                                        </td>
                                        <td>
                                            <span :class="getPaymentStatusBadge(b.payment_status)">
                                                {{ b.payment_status }}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr v-if="bookings.length === 0">
                                        <td colspan="7" class="text-center text-muted py-4">No bookings made yet.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Trek Form Modal (Create & Edit) -->
            <div class="modal fade" id="trekModal" tabindex="-1" aria-hidden="true" ref="trekModalRef">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-light border-0">
                            <h5 class="modal-title fw-bold">
                                {{ editTrekId ? 'Edit Trek Details' : 'Add New Trek Route' }}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form @submit.prevent="saveTrek">
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">Trek Name</label>
                                    <input type="text" class="form-control" v-model="trekForm.name" required placeholder="E.g., Hampta Pass Trek"/>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">Location</label>
                                    <input type="text" class="form-control" v-model="trekForm.location" required placeholder="E.g., Himachal Pradesh"/>
                                </div>
                                <div class="row mb-3">
                                    <div class="col">
                                        <label class="form-label fw-semibold">Difficulty</label>
                                        <select class="form-select" v-model="trekForm.difficulty" required>
                                            <option value="EASY">EASY</option>
                                            <option value="MODERATE">MODERATE</option>
                                            <option value="HARD">HARD</option>
                                        </select>
                                    </div>
                                    <div class="col">
                                        <label class="form-label fw-semibold">Duration (Days)</label>
                                        <input type="number" class="form-control" v-model.number="trekForm.duration_days" required min="1"/>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col">
                                        <label class="form-label fw-semibold">Total Slots</label>
                                        <input type="number" class="form-control" v-model.number="trekForm.available_slots" required min="1"/>
                                    </div>
                                    <div class="col">
                                        <label class="form-label fw-semibold">Assign Guide</label>
                                        <select class="form-select" v-model="trekForm.assigned_staff_id">
                                            <option :value="null">Unassigned</option>
                                            <option v-for="s in staffList" :key="s.id" :value="s.id">{{ s.name }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col">
                                        <label class="form-label fw-semibold">Start Date</label>
                                        <input type="date" class="form-control" v-model="trekForm.start_date" required/>
                                    </div>
                                    <div class="col">
                                        <label class="form-label fw-semibold">End Date</label>
                                        <input type="date" class="form-control" v-model="trekForm.end_date" required/>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">Description</label>
                                    <textarea class="form-control" rows="3" v-model="trekForm.description" placeholder="Provide trek description..."></textarea>
                                </div>
                            </div>
                            <div class="modal-footer border-0 bg-light">
                                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary btn-sm">Save Trek</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Staff Form Modal -->
            <div class="modal fade" id="staffModal" tabindex="-1" aria-hidden="true" ref="staffModalRef">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-light border-0">
                            <h5 class="modal-title fw-bold">Register Staff</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form @submit.prevent="registerStaff">
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">Full Name</label>
                                    <input type="text" class="form-control" v-model="staffForm.name" required/>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">Email Address</label>
                                    <input type="email" class="form-control" v-model="staffForm.email" required/>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">Contact Number</label>
                                    <input type="text" class="form-control" v-model="staffForm.contact"/>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">Password</label>
                                    <input type="password" class="form-control" v-model="staffForm.password" required/>
                                </div>
                            </div>
                            <div class="modal-footer border-0 bg-light">
                                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary btn-sm">Register</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            stats: {
                total_treks: 0,
                total_staff: 0,
                total_trekkers: 0,
                total_bookings: 0,
            },
            treks: [],
            staffList: [],
            trekkers: [],
            bookings: [],
            trekkerSearchQuery: "",
            alert: {
                message: "",
                type: "success",
            },
            editTrekId: null,
            trekForm: {
                name: "",
                location: "",
                difficulty: "EASY",
                duration_days: 3,
                available_slots: 15,
                start_date: "",
                end_date: "",
                description: "",
                assigned_staff_id: null,
            },
            staffForm: {
                name: "",
                email: "",
                contact: "",
                password: "",
            },
            trekModalObj: null,
            staffModalObj: null,
        };
    },
    computed: {
        filteredTrekkers() {
            const query = this.trekkerSearchQuery.toLowerCase().trim();
            if (!query) return this.trekkers;
            return this.trekkers.filter(t => 
                t.name.toLowerCase().includes(query) || 
                t.email.toLowerCase().includes(query)
            );
        }
    },
    mounted() {
        // Initialize bootstrap modals
        this.trekModalObj = new bootstrap.Modal(this.$refs.trekModalRef);
        this.staffModalObj = new bootstrap.Modal(this.$refs.staffModalRef);
        
        // Fetch all admin data
        this.fetchData();
    },
    methods: {
        getHeaders() {
            const token = localStorage.getItem("authToken");
            return {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };
        },
        showAlert(message, type = "success") {
            this.alert.message = message;
            this.alert.type = type;
            // auto dismiss after 5 seconds
            setTimeout(() => {
                this.clearAlert();
            }, 5000);
        },
        clearAlert() {
            this.alert.message = "";
        },
        async fetchData() {
            try {
                const headers = this.getHeaders();
                
                // Fetch Stats
                const statsRes = await fetch("/api/admin/dashboard-stats", { headers });
                if (statsRes.ok) this.stats = await statsRes.json();

                // Fetch Treks
                const treksRes = await fetch("/api/admin/treks", { headers });
                if (treksRes.ok) this.treks = await treksRes.json();

                // Fetch Staff
                const staffRes = await fetch("/api/admin/staff", { headers });
                if (staffRes.ok) this.staffList = await staffRes.json();

                // Fetch Trekkers
                const trekkersRes = await fetch("/api/admin/trekkers", { headers });
                if (trekkersRes.ok) this.trekkers = await trekkersRes.json();

                // Fetch Bookings
                const bookingsRes = await fetch("/api/admin/bookings", { headers });
                if (bookingsRes.ok) this.bookings = await bookingsRes.json();

            } catch (err) {
                this.showAlert("Error loading system metrics: " + err.message, "danger");
            }
        },
        getStaffName(staffId) {
            const found = this.staffList.find(s => s.id === staffId);
            return found ? found.name : "Unknown Guide";
        },
        getDifficultyBadgeClass(diff) {
            if (diff === "EASY") return "badge bg-success";
            if (diff === "MODERATE") return "badge bg-warning text-dark";
            return "badge bg-danger";
        },
        getStatusBadgeClass(status) {
            if (status === "OPEN" || status === "APPROVED") return "badge bg-success";
            if (status === "PENDING") return "badge bg-secondary";
            if (status === "CLOSED") return "badge bg-dark";
            return "badge bg-info";
        },
        getBookingStatusBadge(status) {
            if (status === "BOOKED") return "badge bg-success";
            if (status === "CANCELLED") return "badge bg-danger";
            return "badge bg-info";
        },
        getPaymentStatusBadge(status) {
            if (status === "PAID") return "badge bg-success";
            if (status === "PENDING") return "badge bg-warning text-dark";
            if (status === "FAILED") return "badge bg-danger";
            return "badge bg-secondary";
        },
        formatDate(dateStr) {
            if (!dateStr) return "";
            const d = new Date(dateStr);
            return d.toLocaleDateString();
        },
        openTrekModal(trek = null) {
            this.clearAlert();
            if (trek) {
                this.editTrekId = trek.id;
                this.trekForm = {
                    name: trek.name,
                    location: trek.location,
                    difficulty: trek.difficulty,
                    duration_days: trek.duration_days,
                    available_slots: trek.available_slots,
                    start_date: trek.start_date,
                    end_date: trek.end_date,
                    description: trek.description || "",
                    assigned_staff_id: trek.assigned_staff_id,
                };
            } else {
                this.editTrekId = null;
                this.trekForm = {
                    name: "",
                    location: "",
                    difficulty: "EASY",
                    duration_days: 3,
                    available_slots: 15,
                    start_date: "",
                    end_date: "",
                    description: "",
                    assigned_staff_id: null,
                };
            }
            this.trekModalObj.show();
        },
        async saveTrek() {
            try {
                const headers = this.getHeaders();
                const method = this.editTrekId ? "PUT" : "POST";
                const url = this.editTrekId ? `/api/admin/treks/${this.editTrekId}` : "/api/admin/treks";
                
                const response = await fetch(url, {
                    method,
                    headers,
                    body: JSON.stringify(this.trekForm)
                });
                const data = await response.json();
                
                if (response.ok) {
                    this.showAlert(data.message || "Trek configuration updated.", "success");
                    this.trekModalObj.hide();
                    this.fetchData();
                } else {
                    this.showAlert(data.message || "Could not save trek configuration.", "danger");
                }
            } catch (err) {
                this.showAlert(err.message, "danger");
            }
        },
        async deleteTrek(trekId) {
            if (!confirm("Are you sure you want to delete this trek? This cannot be undone.")) return;
            try {
                const headers = this.getHeaders();
                const response = await fetch(`/api/admin/treks/${trekId}`, {
                    method: "DELETE",
                    headers
                });
                const data = await response.json();
                if (response.ok) {
                    this.showAlert("Trek route deleted successfully.", "success");
                    this.fetchData();
                } else {
                    this.showAlert(data.message, "danger");
                }
            } catch (err) {
                this.showAlert(err.message, "danger");
            }
        },
        openStaffModal() {
            this.clearAlert();
            this.staffForm = {
                name: "",
                email: "",
                contact: "",
                password: "",
            };
            this.staffModalObj.show();
        },
        async registerStaff() {
            try {
                const headers = this.getHeaders();
                const response = await fetch("/api/admin/staff", {
                    method: "POST",
                    headers,
                    body: JSON.stringify(this.staffForm)
                });
                const data = await response.json();
                if (response.ok) {
                    this.showAlert("New guide/staff member registered successfully.", "success");
                    this.staffModalObj.hide();
                    this.fetchData();
                } else {
                    this.showAlert(data.message, "danger");
                }
            } catch (err) {
                this.showAlert(err.message, "danger");
            }
        },
        async toggleUserStatus(userId) {
            try {
                const headers = this.getHeaders();
                const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
                    method: "POST",
                    headers
                });
                const data = await response.json();
                if (response.ok) {
                    this.showAlert(data.message, "success");
                    this.fetchData();
                } else {
                    this.showAlert(data.message, "danger");
                }
            } catch (err) {
                this.showAlert(err.message, "danger");
            }
        }
    }
};
