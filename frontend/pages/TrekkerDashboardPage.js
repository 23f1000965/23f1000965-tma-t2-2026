const TrekkerDashboardPage = {
    template: `
        <div class="container py-4">
            <!-- Header Section -->
            <div class="mb-4 d-flex align-items-center justify-content-between">
                <h2 class="mb-0 d-flex align-items-center">
                    <i class="bi bi-person-walking text-primary me-2"></i>
                    Trekker Dashboard
                </h2>
                <!-- Profile Button -->
                <button class="btn btn-outline-primary rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;" @click="openProfileModal" title="View Profile">
                    <i class="bi bi-person-circle fs-3"></i>
                </button>
            </div>

            <!-- Stats Summary Cards -->
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm bg-primary text-white h-100">
                        <div class="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-uppercase mb-1 opacity-75 small">Total Bookings</h6>
                                <h3 class="mb-0 fw-bold">{{ stats.totalBookings }}</h3>
                            </div>
                            <i class="bi bi-journal-list fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm bg-success text-white h-100">
                        <div class="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-uppercase mb-1 opacity-75 small">Active Bookings</h6>
                                <h3 class="mb-0 fw-bold">{{ stats.activeBookings }}</h3>
                            </div>
                            <i class="bi bi-check-circle fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm bg-danger text-white h-100">
                        <div class="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-uppercase mb-1 opacity-75 small">Cancelled</h6>
                                <h3 class="mb-0 fw-bold">{{ stats.cancelledBookings }}</h3>
                            </div>
                            <i class="bi bi-x-circle fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Messages Banners -->
            <div v-if="errorMsg" class="alert alert-danger alert-dismissible fade show shadow-sm mb-4" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMsg }}
                <button type="button" class="btn-close" @click="errorMsg = ''" aria-label="Close"></button>
            </div>
            <div v-if="successMsg" class="alert alert-success alert-dismissible fade show shadow-sm mb-4" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i> {{ successMsg }}
                <button type="button" class="btn-close" @click="successMsg = ''" aria-label="Close"></button>
            </div>

            <!-- Main Tabs navigation -->
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-header bg-transparent border-0 pt-3 px-4">
                    <ul class="nav nav-pills card-header-pills" id="dashboardTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active fw-semibold" id="browse-tab" data-bs-toggle="tab" data-bs-target="#browse" type="button" role="tab">
                                <i class="bi bi-compass me-1"></i> Browse Open Treks
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link fw-semibold" id="history-tab" data-bs-toggle="tab" data-bs-target="#history" type="button" role="tab" @click="fetchBookings">
                                <i class="bi bi-clock-history me-1"></i> My Bookings & History
                            </button>
                        </li>
                    </ul>
                </div>
                <div class="card-body tab-content p-4">
                    <!-- Browse Tab -->
                    <div class="tab-pane fade show active" id="browse" role="tabpanel">
                        <div class="row g-4">
                            <!-- Filters Sidebar -->
                            <div class="col-md-3">
                                <div class="card border-0 bg-light p-3 shadow-sm rounded-3">
                                    <h6 class="fw-bold mb-3 text-dark d-flex align-items-center">
                                        <i class="bi bi-funnel-fill text-primary me-2"></i> Filter Treks
                                    </h6>
                                    
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold text-muted">Location</label>
                                        <input type="text" class="form-control form-control-sm" placeholder="e.g. Kashmir, Nepal" v-model="filterLocation" @input="fetchTreks">
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold text-muted">Difficulty</label>
                                        <select class="form-select form-select-sm" v-model="filterDifficulty" @change="fetchTreks">
                                            <option value="">All Difficulties</option>
                                            <option value="EASY">EASY</option>
                                            <option value="MODERATE">MODERATE</option>
                                            <option value="HARD">HARD</option>
                                        </select>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold text-muted d-flex justify-content-between">
                                            <span>Max Duration</span>
                                            <span class="text-primary">{{ filterDuration }} days</span>
                                        </label>
                                        <input type="range" class="form-range" min="1" max="30" v-model="filterDuration" @change="fetchTreks">
                                    </div>

                                    <button class="btn btn-outline-secondary btn-sm w-100 mt-2" @click="clearFilters">
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            <!-- Treks List -->
                            <div class="col-md-9">
                                <div v-if="treksLoading" class="text-center py-5">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="text-muted mt-2">Searching treks...</p>
                                </div>
                                <div v-else-if="treks.length === 0" class="text-center py-5">
                                    <i class="bi bi-search text-muted display-4"></i>
                                    <p class="text-muted mt-3">No open treks matched your search criteria.</p>
                                </div>
                                <div v-else class="row row-cols-1 row-cols-md-2 g-3">
                                    <div class="col" v-for="trek in treks" :key="trek.id">
                                        <div class="card border-0 shadow-sm h-100 hover-card">
                                            <div class="card-body p-4 d-flex flex-column">
                                                <div class="d-flex justify-content-between align-items-start mb-2">
                                                    <h5 class="fw-bold text-dark mb-0">{{ trek.name }}</h5>
                                                    <span :class="getDifficultyBadgeClass(trek.difficulty)">{{ trek.difficulty }}</span>
                                                </div>
                                                <p class="text-muted small mb-2"><i class="bi bi-geo-alt-fill text-danger me-1"></i> {{ trek.location }}</p>
                                                <p class="card-text text-secondary mb-3 flex-grow-1" style="font-size: 0.9rem;">
                                                    {{ trek.description || 'No description provided.' }}
                                                </p>
                                                <hr class="my-3 text-muted">
                                                <div class="d-flex justify-content-between align-items-center mb-3">
                                                    <div>
                                                        <small class="text-muted d-block"><i class="bi bi-calendar-event me-1"></i> {{ formatDate(trek.start_date) }}</small>
                                                        <small class="text-muted d-block"><i class="bi bi-clock me-1"></i> {{ trek.duration_days }} days duration</small>
                                                    </div>
                                                    <div class="text-end">
                                                        <span class="fw-bold text-dark d-block">{{ trek.slots_remaining }}</span>
                                                        <small class="text-muted">slots left</small>
                                                    </div>
                                                </div>
                                                <button class="btn w-100 rounded-pill" 
                                                        :class="trek.slots_remaining > 0 ? 'btn-primary' : 'btn-secondary disabled'"
                                                        :disabled="trek.slots_remaining <= 0"
                                                        @click="triggerBookTrek(trek)">
                                                    {{ trek.slots_remaining > 0 ? 'Book Trek' : 'Fully Booked' }}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- History Tab -->
                    <div class="tab-pane fade" id="history" role="tabpanel">
                        <div class="d-flex align-items-center justify-content-between mb-3" v-if="bookings.length > 0">
                            <h5 class="mb-0 fw-bold text-secondary">My Booking History</h5>
                            <button class="btn btn-outline-success btn-sm rounded-pill px-3" 
                                    :disabled="exportLoading"
                                    @click="triggerExport">
                                <span v-if="exportLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                                <i class="bi bi-file-earmark-spreadsheet-fill me-1"></i>
                                {{ exportLoading ? 'Exporting...' : 'History' }}
                            </button>
                        </div>
                        <h5 class="mb-3 fw-bold text-secondary" v-else>My Booking History</h5>

                        <!-- Export Status Banners -->
                        <div v-if="exportStatusMsg" class="alert alert-info py-2 mb-3 d-flex align-items-center justify-content-between shadow-sm">
                            <span><i class="bi bi-info-circle-fill me-2"></i> {{ exportStatusMsg }}</span>
                            <a v-if="exportDownloadUrl" :href="exportDownloadUrl" class="btn btn-primary btn-sm rounded-pill px-3 ms-2" download>
                                <i class="bi bi-download me-1"></i> Download CSV File
                            </a>
                        </div>
                        <div v-if="exportErrorMsg" class="alert alert-danger py-2 mb-3 shadow-sm">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ exportErrorMsg }}
                        </div>

                        <div v-if="bookingsLoading" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="text-muted mt-2">Loading booking history...</p>
                        </div>
                        <div v-else-if="bookings.length === 0" class="text-center py-5">
                            <i class="bi bi-calendar-x text-muted display-4"></i>
                            <p class="text-muted mt-3">You have not booked any treks yet.</p>
                        </div>
                        <div v-else class="table-responsive">
                            <table class="table align-middle table-hover mb-0">
                                <thead class="table-light">
                                    <tr class="text-muted" style="font-size: 0.9rem;">
                                        <th>Trek Details</th>
                                        <th>Dates</th>
                                        <th>Booking Date</th>
                                        <th>Status</th>
                                        <th class="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="b in bookings" :key="b.id">
                                        <td>
                                            <div class="fw-bold text-dark">{{ b.trek_name }}</div>
                                            <small class="text-muted"><i class="bi bi-geo-alt-fill text-danger me-1"></i> {{ b.trek_location }}</small>
                                        </td>
                                        <td>
                                            <small class="text-dark d-block fw-semibold">{{ formatDate(b.trek_start_date) }}</small>
                                            <small class="text-muted">to {{ formatDate(b.trek_end_date) }}</small>
                                        </td>
                                        <td>
                                            <small class="text-muted">{{ formatDate(b.booking_date) }}</small>
                                        </td>
                                        <td>
                                            <span :class="getBookingBadgeClass(b.status)">{{ b.status }}</span>
                                        </td>
                                        <td class="text-end">
                                            <button class="btn btn-outline-danger btn-sm rounded-pill px-3" 
                                                    v-if="canCancel(b)"
                                                    @click="triggerCancelBooking(b)">
                                                Cancel Booking
                                            </button>
                                            <span v-else class="text-muted small">-</span>

                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Booking Confirmation Modal -->
            <div class="modal fade" id="bookModal" tabindex="-1" aria-hidden="true" ref="bookModalRef">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow" v-if="trekToBook">
                        <div class="modal-header bg-primary text-white p-3">
                            <h5 class="modal-title fw-bold"><i class="bi bi-compass-fill me-2"></i> Confirm Booking</h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeBookModal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4 text-center">
                            <p class="mb-3">Are you sure you want to book the following trek?</p>
                            <h4 class="fw-bold text-indigo mb-2">{{ trekToBook.name }}</h4>
                            <p class="text-muted mb-4"><i class="bi bi-geo-alt-fill text-danger me-1"></i> {{ trekToBook.location }}</p>
                            <div class="bg-light p-3 rounded-3 text-start small mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="text-muted">Start Date:</span>
                                    <span class="fw-semibold text-dark">{{ formatDate(trekToBook.start_date) }}</span>
                                </div>
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="text-muted">Duration:</span>
                                    <span class="fw-semibold text-dark">{{ trekToBook.duration_days }} days</span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span class="text-muted">Slots Left:</span>
                                    <span class="fw-semibold text-dark">{{ trekToBook.slots_remaining }} slots</span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-light border-0">
                            <button type="button" class="btn btn-secondary px-4 rounded-pill" @click="closeBookModal" :disabled="bookingActionLoading">Dismiss</button>
                            <button type="button" class="btn btn-primary px-4 rounded-pill" @click="bookTrek" :disabled="bookingActionLoading">
                                <span v-if="bookingActionLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cancellation Confirmation Modal -->
            <div class="modal fade" id="cancelModal" tabindex="-1" aria-hidden="true" ref="cancelModalRef">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow" v-if="bookingToCancel">
                        <div class="modal-header bg-danger text-white p-3">
                            <h5 class="modal-title fw-bold"><i class="bi bi-exclamation-triangle-fill me-2"></i> Cancel Booking</h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeCancelModal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4 text-center">
                            <p class="mb-3">Are you sure you want to cancel your booking for this trek?</p>
                            <h4 class="fw-bold text-danger mb-2">{{ bookingToCancel.trek_name }}</h4>
                            <p class="text-muted mb-4"><i class="bi bi-geo-alt-fill text-danger me-1"></i> {{ bookingToCancel.trek_location }}</p>
                            <div class="alert alert-warning small border-0 mb-0" role="alert">
                                <i class="bi bi-info-circle-fill me-1"></i> This action will free up your slot for other trekkers and cannot be undone.
                            </div>
                        </div>
                        <div class="modal-footer bg-light border-0">
                            <button type="button" class="btn btn-secondary px-4 rounded-pill" @click="closeCancelModal" :disabled="bookingActionLoading">Keep Booking</button>
                            <button type="button" class="btn btn-danger px-4 rounded-pill" @click="cancelBooking" :disabled="bookingActionLoading">
                                <span v-if="bookingActionLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                                Yes, Cancel Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile Details Modal -->
            <div class="modal fade" id="profileModal" tabindex="-1" aria-hidden="true" ref="profileModalRef">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-dark text-white p-3">
                            <h5 class="modal-title fw-bold"><i class="bi bi-person-badge me-2"></i> Trekker Profile Details</h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeProfileModal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4 text-dark">
                            <div class="text-center mb-4">
                                <i class="bi bi-person-circle text-primary display-3"></i>
                                <h4 class="fw-bold mt-2 mb-1" v-if="!isEditingProfile">{{ trekkerProfile.name }}</h4>
                                <span class="badge bg-secondary text-uppercase" v-if="!isEditingProfile">{{ trekkerProfile.role }}</span>
                            </div>

                            <div v-if="profileErrorMsg" class="alert alert-danger py-2 small mb-3">
                                <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ profileErrorMsg }}
                            </div>

                            <div class="list-group list-group-flush">
                                <div class="list-group-item px-0 py-3 d-flex align-items-center">
                                    <div class="text-primary me-3 fs-4" style="width: 30px; text-align: center;">
                                        <i class="bi bi-envelope-fill"></i>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block fw-semibold" style="font-size: 0.75rem; text-uppercase: true;">Email Address</small>
                                        <span class="fw-medium">{{ trekkerProfile.email }}</span>
                                    </div>
                                </div>
                                
                                <!-- Name field -->
                                <div class="list-group-item px-0 py-3 d-flex align-items-center">
                                    <div class="text-primary me-3 fs-4" style="width: 30px; text-align: center;">
                                        <i class="bi bi-person-fill"></i>
                                    </div>
                                    <div class="flex-grow-1">
                                        <small class="text-muted d-block fw-semibold" style="font-size: 0.75rem; text-uppercase: true;">Full Name</small>
                                        <span class="fw-medium" v-if="!isEditingProfile">{{ trekkerProfile.name }}</span>
                                        <input type="text" class="form-control form-control-sm mt-1" v-else v-model="editProfileForm.name" required>
                                    </div>
                                </div>

                                <!-- Contact Number field -->
                                <div class="list-group-item px-0 py-3 d-flex align-items-center">
                                    <div class="text-primary me-3 fs-4" style="width: 30px; text-align: center;">
                                        <i class="bi bi-telephone-fill"></i>
                                    </div>
                                    <div class="flex-grow-1">
                                        <small class="text-muted d-block fw-semibold" style="font-size: 0.75rem; text-uppercase: true;">Contact Number</small>
                                        <span class="fw-medium" v-if="!isEditingProfile">{{ trekkerProfile.contact || 'Not Provided' }}</span>
                                        <input type="text" class="form-control form-control-sm mt-1" v-else v-model="editProfileForm.contact">
                                    </div>
                                </div>

                                <!-- Optional Password field when editing -->
                                <div class="list-group-item px-0 py-3 d-flex align-items-center" v-if="isEditingProfile">
                                    <div class="text-primary me-3 fs-4" style="width: 30px; text-align: center;">
                                        <i class="bi bi-shield-lock-fill"></i>
                                    </div>
                                    <div class="flex-grow-1">
                                        <small class="text-muted d-block fw-semibold" style="font-size: 0.75rem; text-uppercase: true;">New Password (Optional)</small>
                                        <input type="password" class="form-control form-control-sm mt-1" placeholder="Leave blank to keep current" v-model="editProfileForm.password">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-light border-0">
                            <!-- Non-editing buttons -->
                            <template v-if="!isEditingProfile">
                                <button type="button" class="btn btn-secondary px-4 rounded-pill" @click="closeProfileModal">Close</button>
                                <button type="button" class="btn btn-primary px-4 rounded-pill" @click="startEditProfile">Edit Profile</button>
                            </template>
                            <!-- Editing buttons -->
                            <template v-else>
                                <button type="button" class="btn btn-secondary px-4 rounded-pill" @click="cancelEditProfile" :disabled="profileUpdateLoading">Cancel</button>
                                <button type="button" class="btn btn-success px-4 rounded-pill" @click="saveProfile" :disabled="profileUpdateLoading">
                                    <span v-if="profileUpdateLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                                    Save Changes
                                </button>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            trekkerName: "",
            treks: [],
            bookings: [],
            stats: {
                totalBookings: 0,
                activeBookings: 0,
                cancelledBookings: 0,
            },
            filterLocation: "",
            filterDifficulty: "",
            filterDuration: 15,
            treksLoading: false,
            bookingsLoading: false,
            bookingActionLoading: false,
            errorMsg: "",
            successMsg: "",
            trekToBook: null,
            bookingToCancel: null,
            trekkerProfile: {
                name: "",
                email: "",
                contact: "",
                role: ""
            },
            isEditingProfile: false,
            profileUpdateLoading: false,
            profileErrorMsg: "",
            editProfileForm: {
                name: "",
                contact: "",
                password: ""
            },
            exportLoading: false,
            exportStatusMsg: "",
            exportErrorMsg: "",
            exportDownloadUrl: "",
            profileModalObj: null,
            bookModalObj: null,
            cancelModalObj: null
        };
    },
    created() {
        const name = localStorage.getItem("userName") || "Trekker";
        this.trekkerName = name;

        this.fetchTreks();
        this.fetchBookings();
        this.fetchTrekkerProfile();
    },
    mounted() {
        this.profileModalObj = new bootstrap.Modal(this.$refs.profileModalRef);
        this.bookModalObj = new bootstrap.Modal(this.$refs.bookModalRef);
        this.cancelModalObj = new bootstrap.Modal(this.$refs.cancelModalRef);
    },
    methods: {
        async fetchTrekkerProfile() {
            const token = localStorage.getItem("authToken");
            if (!token) return;
            try {
                const response = await fetch("/api/auth/profile", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    this.trekkerName = data.name;
                    localStorage.setItem("userName", data.name);
                    this.trekkerProfile = {
                        name: data.name,
                        email: data.email,
                        contact: data.contact,
                        role: data.role
                    };
                }
            } catch (err) {
                console.error("Error fetching trekker profile:", err);
            }
        },
        openProfileModal() {
            this.isEditingProfile = false;
            this.profileErrorMsg = "";
            if (this.profileModalObj) this.profileModalObj.show();
        },
        closeProfileModal() {
            if (this.profileModalObj) this.profileModalObj.hide();
        },
        startEditProfile() {
            this.editProfileForm = {
                name: this.trekkerProfile.name,
                contact: this.trekkerProfile.contact || "",
                password: ""
            };
            this.profileErrorMsg = "";
            this.isEditingProfile = true;
        },
        cancelEditProfile() {
            this.isEditingProfile = false;
            this.profileErrorMsg = "";
        },
        async saveProfile() {
            if (!this.editProfileForm.name || !this.editProfileForm.name.trim()) {
                this.profileErrorMsg = "Name cannot be empty";
                return;
            }
            this.profileUpdateLoading = true;
            this.profileErrorMsg = "";
            const token = localStorage.getItem("authToken");
            try {
                const response = await fetch("/api/auth/profile", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: this.editProfileForm.name,
                        contact: this.editProfileForm.contact,
                        password: this.editProfileForm.password || undefined
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    this.successMsg = "Profile updated successfully!";
                    this.isEditingProfile = false;
                    
                    // Reload profile details
                    await this.fetchTrekkerProfile();
                    
                    // Automatically close the modal after a short delay
                    setTimeout(() => {
                        this.closeProfileModal();
                    }, 1000);
                } else {
                    this.profileErrorMsg = data.message || "Failed to update profile.";
                }
            } catch (err) {
                this.profileErrorMsg = "An error occurred while updating profile.";
            } finally {
                this.profileUpdateLoading = false;
            }
        },
        async fetchTreks() {
            this.treksLoading = true;
            this.errorMsg = "";
            const token = localStorage.getItem("authToken");
            try {
                let url = `/api/trekkers/treks?location=${encodeURIComponent(this.filterLocation)}&difficulty=${this.filterDifficulty}&max_duration=${this.filterDuration}`;
                const response = await fetch(url, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    this.treks = data;
                } else {
                    this.errorMsg = data.message || "Failed to load treks.";
                }
            } catch (err) {
                this.errorMsg = "An error occurred while loading treks.";
            } finally {
                this.treksLoading = false;
            }
        },
        async fetchBookings() {
            this.bookingsLoading = true;
            this.errorMsg = "";
            const token = localStorage.getItem("authToken");
            try {
                const response = await fetch("/api/trekkers/bookings", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    this.bookings = data;
                    this.calculateStats();
                } else {
                    this.errorMsg = data.message || "Failed to load booking history.";
                }
            } catch (err) {
                this.errorMsg = "An error occurred while loading bookings.";
            } finally {
                this.bookingsLoading = false;
            }
        },
        calculateStats() {
            this.stats.totalBookings = this.bookings.length;
            this.stats.activeBookings = this.bookings.filter(b => b.status === "BOOKED").length;
            this.stats.cancelledBookings = this.bookings.filter(b => b.status === "CANCELLED").length;
        },
        clearFilters() {
            this.filterLocation = "";
            this.filterDifficulty = "";
            this.filterDuration = 15;
            this.fetchTreks();
        },
        triggerBookTrek(trek) {
            this.trekToBook = trek;
            if (this.bookModalObj) this.bookModalObj.show();
        },
        closeBookModal() {
            this.trekToBook = null;
            if (this.bookModalObj) this.bookModalObj.hide();
        },
        async bookTrek() {
            if (!this.trekToBook) return;
            this.bookingActionLoading = true;
            this.errorMsg = "";
            this.successMsg = "";
            const token = localStorage.getItem("authToken");
            try {
                const response = await fetch("/api/trekkers/bookings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ trek_id: this.trekToBook.id })
                });
                const data = await response.json();
                if (response.ok) {
                    this.successMsg = "Trek booked successfully!";
                    this.closeBookModal();
                    await this.fetchTreks();
                    await this.fetchBookings();
                } else {
                    this.errorMsg = data.message || "Failed to book trek.";
                    this.closeBookModal();
                }
            } catch (err) {
                this.errorMsg = "An error occurred while booking the trek.";
                this.closeBookModal();
            } finally {
                this.bookingActionLoading = false;
            }
        },
        triggerCancelBooking(booking) {
            this.bookingToCancel = booking;
            if (this.cancelModalObj) this.cancelModalObj.show();
        },
        closeCancelModal() {
            this.bookingToCancel = null;
            if (this.cancelModalObj) this.cancelModalObj.hide();
        },
        async cancelBooking() {
            if (!this.bookingToCancel) return;
            this.bookingActionLoading = true;
            this.errorMsg = "";
            this.successMsg = "";
            const token = localStorage.getItem("authToken");
            try {
                const response = await fetch(`/api/trekkers/bookings/${this.bookingToCancel.id}/cancel`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    this.successMsg = "Booking cancelled successfully.";
                    this.closeCancelModal();
                    await this.fetchTreks();
                    await this.fetchBookings();
                } else {
                    this.errorMsg = data.message || "Failed to cancel booking.";
                    this.closeCancelModal();
                }
            } catch (err) {
                this.errorMsg = "An error occurred while cancelling booking.";
                this.closeCancelModal();
            } finally {
                this.bookingActionLoading = false;
            }
        },
        async triggerExport() {
            this.exportLoading = true;
            this.exportStatusMsg = "Queuing export task in background...";
            this.exportErrorMsg = "";
            this.exportDownloadUrl = "";
            const token = localStorage.getItem("authToken");
            try {
                const response = await fetch("/api/trekkers/bookings/export", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                let data = {};
                try {
                    data = await response.json();
                } catch (e) {
                    data = { message: "Internal server error. Make sure Redis & Celery are running." };
                }
                if (response.ok) {
                    this.pollExportStatus(data.task_id);
                } else {
                    this.exportLoading = false;
                    this.exportErrorMsg = data.message || "Failed to trigger export.";
                    this.exportStatusMsg = "";
                }
            } catch (err) {
                this.exportLoading = false;
                this.exportErrorMsg = "An error occurred while starting export. Make sure Redis & Celery are running.";
                this.exportStatusMsg = "";
            }
        },
        async pollExportStatus(taskId) {
            const token = localStorage.getItem("authToken");
            const interval = setInterval(async () => {
                try {
                    const response = await fetch(`/api/tasks/${taskId}/status`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    let data = {};
                    try {
                        data = await response.json();
                    } catch (e) {
                        data = { status: "FAILED", message: "Failed to parse server response. Make sure Celery is running." };
                    }
                    if (response.ok) {
                        if (data.status === "SUCCESS") {
                            clearInterval(interval);
                            this.exportLoading = false;
                            this.exportStatusMsg = "Export ready!";
                            this.exportDownloadUrl = data.download_url;
                        } else if (data.status === "FAILED") {
                            clearInterval(interval);
                            this.exportLoading = false;
                            this.exportErrorMsg = data.message || "Export task failed.";
                            this.exportStatusMsg = "";
                        } else {
                            this.exportStatusMsg = "Processing export file in background...";
                        }
                    } else {
                        clearInterval(interval);
                        this.exportLoading = false;
                        this.exportErrorMsg = data.message || "Failed to poll task status.";
                        this.exportStatusMsg = "";
                    }
                } catch (err) {
                    clearInterval(interval);
                    this.exportLoading = false;
                    this.exportErrorMsg = "Connection error while checking status.";
                    this.exportStatusMsg = "";
                }
            }, 1500);
        },
        formatDate(dateStr) {
            if (!dateStr) return "";
            try {
                const options = { year: "numeric", month: "short", day: "numeric" };
                return new Date(dateStr).toLocaleDateString(undefined, options);
            } catch (e) {
                return dateStr;
            }
        },
        getDifficultyBadgeClass(difficulty) {
            if (difficulty === "EASY") return "badge bg-success-light text-success border border-success-subtle";
            if (difficulty === "MODERATE") return "badge bg-warning-light text-warning border border-warning-subtle";
            if (difficulty === "HARD") return "badge bg-danger-light text-danger border border-danger-subtle";
            return "badge bg-light text-dark";
        },
        getBookingBadgeClass(status) {
            if (status === "BOOKED") return "badge bg-success";
            if (status === "CANCELLED") return "badge bg-danger";
            if (status === "COMPLETED") return "badge bg-info text-dark";
            return "badge bg-secondary";
        },
        canCancel(b) {
            if (b.status !== 'BOOKED') return false;
            if (b.trek_status === 'CLOSED' || b.trek_status === 'COMPLETED') return false;
            if (!b.trek_start_date) return false;
            const startDate = new Date(b.trek_start_date);
            const today = new Date();
            startDate.setHours(0,0,0,0);
            today.setHours(0,0,0,0);
            return startDate > today;
        }

    }
};

export default TrekkerDashboardPage;
