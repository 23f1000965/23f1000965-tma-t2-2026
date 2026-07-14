const StaffDashboardPage = {
    template: `
        <div class="container py-4">
            <div class="mb-4 d-flex align-items-center justify-content-between">
                <h2 class="mb-0 d-flex align-items-center">
                    <i class="bi bi-person-workspace text-primary me-2"></i>
                    Staff Management Console
                </h2>
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
                                <h6 class="text-uppercase mb-1 opacity-75 small">Assigned Treks</h6>
                                <h3 class="mb-0 fw-bold">{{ stats.totalTreks }}</h3>
                            </div>
                            <i class="bi bi-signpost-split fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm bg-success text-white h-100">
                        <div class="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-uppercase mb-1 opacity-75 small">Total Participants</h6>
                                <h3 class="mb-0 fw-bold">{{ stats.totalParticipants }}</h3>
                            </div>
                            <i class="bi bi-people fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm bg-info text-white h-100">
                        <div class="card-body d-flex align-items-center justify-content-between">
                            <div>
                                <h6 class="text-uppercase mb-1 opacity-75 small">Active Treks</h6>
                                <h3 class="mb-0 fw-bold">{{ stats.activeTreks }}</h3>
                            </div>
                            <i class="bi bi-check2-circle fs-1 opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="errorMsg" class="alert alert-danger alert-dismissible fade show shadow-sm mb-4" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMsg }}
                <button type="button" class="btn-close" @click="errorMsg = ''" aria-label="Close"></button>
            </div>

            <div v-if="successMsg" class="alert alert-success alert-dismissible fade show shadow-sm mb-4" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i> {{ successMsg }}
                <button type="button" class="btn-close" @click="successMsg = ''" aria-label="Close"></button>
            </div>

            <div class="row g-4">
                <!-- Treks Column -->
                <div class="col-lg-7">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex align-items-center justify-content-between">
                            <h5 class="fw-bold text-dark mb-0">Assigned Treks</h5>
                            <button class="btn btn-outline-secondary btn-sm" @click="fetchTreks" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                <i v-else class="bi bi-arrow-clockwise me-1"></i> Refresh
                            </button>
                        </div>
                        <div class="card-body p-4">
                            <div v-if="loading && treks.length === 0" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="text-muted mt-3">Fetching assigned treks...</p>
                            </div>
                            <div v-else-if="treks.length === 0" class="text-center py-5">
                                <i class="bi bi-map text-muted display-4"></i>
                                <p class="text-muted mt-3">No treks currently assigned to you.</p>
                            </div>
                            <div v-else class="table-responsive">
                                <table class="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr class="text-muted" style="font-size: 0.9rem;">
                                            <th>Trek Details</th>
                                            <th>Slots</th>
                                            <th>Status</th>
                                            <th class="text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="trek in treks" :key="trek.id" 
                                            :class="{'table-active border-primary': selectedTrek && selectedTrek.id === trek.id}"
                                            style="cursor: pointer;"
                                            @click="selectTrek(trek)">
                                            <td>
                                                <div class="fw-bold text-dark">{{ trek.name }}</div>
                                                <small class="text-muted d-block">
                                                    <i class="bi bi-geo-alt-fill text-danger me-1"></i> {{ trek.location }}
                                                </small>
                                                <small class="text-muted d-block">
                                                    <i class="bi bi-calendar-event me-1"></i> {{ formatDate(trek.start_date) }} to {{ formatDate(trek.end_date) }}
                                                </small>
                                            </td>
                                            <td>
                                                <div class="fw-semibold">{{ trek.available_slots }} slots</div>
                                                <small class="text-muted">{{ trek.bookings_count }} Booked</small>
                                            </td>
                                            <td>
                                                <span :class="getStatusBadgeClass(trek.status)">{{ trek.status }}</span>
                                                <span :class="getDifficultyBadgeClass(trek.difficulty)" class="d-block mt-1">{{ trek.difficulty }}</span>
                                            </td>
                                            <td class="text-end">
                                                <button class="btn btn-primary btn-sm rounded-pill px-3" @click.stop="selectTrek(trek)">
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Management Details Column -->
                <div class="col-lg-5">
                    <!-- Placeholder when no trek is selected -->
                    <div v-if="!selectedTrek" class="card border-0 shadow-sm text-center py-5 h-100 d-flex align-items-center justify-content-center">
                        <div class="p-4">
                            <div class="text-muted mb-3 display-4">
                                <i class="bi bi-compass"></i>
                            </div>
                            <h5 class="fw-bold text-dark">No Trek Selected</h5>
                            <p class="text-muted px-4" style="max-width: 320px;">
                                Click on any assigned trek from the list to view participants, edit available slots, and update its status.
                            </p>
                        </div>
                    </div>

                    <!-- Details Card when trek is selected -->
                    <div v-else class="card border-0 shadow-sm">
                        <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex align-items-center justify-content-between">
                            <h5 class="fw-bold text-dark mb-0">Management Console</h5>
                            <button class="btn-close" @click="selectedTrek = null" aria-label="Close"></button>
                        </div>
                        <div class="card-body p-4">
                            <div class="mb-4">
                                <h4 class="fw-bold text-indigo mb-1">{{ selectedTrek.name }}</h4>
                                <p class="text-muted mb-2"><i class="bi bi-geo-alt-fill text-danger me-1"></i> {{ selectedTrek.location }}</p>
                                <span :class="getStatusBadgeClass(selectedTrek.status)">{{ selectedTrek.status }}</span>
                            </div>

                            <!-- Actions Section -->
                            <div class="card bg-light border-0 mb-4">
                                <div class="card-body p-3">
                                    <h6 class="fw-bold text-dark mb-3">Quick Actions</h6>
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-success d-flex align-items-center justify-content-center" 
                                                :disabled="selectedTrek.status === 'CLOSED' || selectedTrek.status === 'COMPLETED' || actionLoading"
                                                @click="updateTrekStatus('CLOSED')">
                                            <i class="bi bi-play-fill me-2 fs-5"></i> Start Trek (Close Bookings)
                                        </button>
                                        <button class="btn btn-info text-white d-flex align-items-center justify-content-center" 
                                                :disabled="selectedTrek.status === 'COMPLETED' || actionLoading"
                                                @click="updateTrekStatus('COMPLETED')">
                                            <i class="bi bi-check-circle-fill me-2"></i> Complete Trek
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Edit Slots and Manual Status -->
                            <div class="mb-4">
                                <h6 class="fw-bold text-dark mb-3">Update Parameters</h6>
                                
                                <form @submit.prevent="saveTrekParameters">
                                    <div class="row g-2 align-items-end">
                                        <div class="col-6">
                                            <label class="form-label text-muted fw-semibold" style="font-size: 0.8rem;">Available Slots</label>
                                            <input type="number" class="form-control" v-model.number="editSlots" min="0" required>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label text-muted fw-semibold" style="font-size: 0.8rem;">Manual Status</label>
                                            <select class="form-select" v-model="editStatus">
                                                <option value="OPEN">OPEN</option>
                                                <option value="CLOSED">CLOSED</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                            </select>
                                        </div>
                                        <div class="col-12 mt-3 d-grid">
                                            <button type="submit" class="btn btn-outline-primary" :disabled="actionLoading">
                                                <span v-if="actionLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <!-- Participants Section -->
                            <div>
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <h6 class="fw-bold text-dark mb-0">Participants Roster ({{ participants.length }})</h6>
                                    <button class="btn btn-link btn-sm p-0 text-decoration-none" @click="fetchParticipants" :disabled="participantsLoading">
                                        <i class="bi bi-arrow-clockwise me-1"></i> Reload List
                                    </button>
                                </div>

                                <div v-if="participantsLoading" class="text-center py-4">
                                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                                <div v-else-if="participants.length === 0" class="text-center py-4 bg-light rounded-3">
                                    <p class="text-muted mb-0" style="font-size: 0.9rem;">No participants booked yet.</p>
                                </div>
                                <div v-else>
                                    <!-- Search input for roster -->
                                    <div class="input-group input-group-sm mb-2">
                                        <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
                                        <input type="text" class="form-control border-start-0" placeholder="Filter participants..." v-model="rosterSearch">
                                    </div>

                                    <div style="max-height: 250px; overflow-y: auto;" class="border rounded-3">
                                        <ul class="list-group list-group-flush">
                                            <li v-for="p in filteredParticipants" :key="p.id" class="list-group-item p-3">
                                                <div class="d-flex align-items-start justify-content-between">
                                                    <div>
                                                        <div class="fw-bold text-dark" style="font-size: 0.95rem;">{{ p.user_name }}</div>
                                                        <small class="text-muted d-block" style="font-size: 0.8rem;">
                                                            <i class="bi bi-envelope me-1"></i> {{ p.user_email }}
                                                        </small>
                                                        <small v-if="p.user_contact" class="text-muted d-block" style="font-size: 0.8rem;">
                                                            <i class="bi bi-telephone me-1"></i> {{ p.user_contact }}
                                                        </small>
                                                    </div>
                                                    <span :class="getBookingBadgeClass(p.status)" style="font-size: 0.75rem;">{{ p.status }}</span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile Details Modal -->
            <div class="modal fade" id="profileModal" tabindex="-1" aria-hidden="true" ref="profileModalRef">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-dark text-white p-3">
                            <h5 class="modal-title fw-bold"><i class="bi bi-person-badge me-2"></i> Staff Profile Details</h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeProfileModal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4 text-dark">
                            <div class="text-center mb-4">
                                <i class="bi bi-person-circle text-primary display-3"></i>
                                <h4 class="fw-bold mt-2 mb-1">{{ staffProfile.name }}</h4>
                                <span class="badge bg-secondary text-uppercase">{{ staffProfile.role }}</span>
                            </div>
                            <div class="list-group list-group-flush">
                                <div class="list-group-item px-0 py-3 d-flex align-items-center">
                                    <div class="text-primary me-3 fs-4" style="width: 30px; text-align: center;">
                                        <i class="bi bi-envelope-fill"></i>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block fw-semibold" style="font-size: 0.75rem; text-uppercase: true;">Email Address</small>
                                        <span class="fw-medium">{{ staffProfile.email }}</span>
                                    </div>
                                </div>
                                <div class="list-group-item px-0 py-3 d-flex align-items-center">
                                    <div class="text-primary me-3 fs-4" style="width: 30px; text-align: center;">
                                        <i class="bi bi-telephone-fill"></i>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block fw-semibold" style="font-size: 0.75rem; text-uppercase: true;">Contact Number</small>
                                        <span class="fw-medium">{{ staffProfile.contact || 'Not Provided' }}</span>
                                    </div>
                                </div>
                                <div class="list-group-item px-0 py-3 d-flex align-items-center">
                                    <div class="text-primary me-3 fs-4" style="width: 30px; text-align: center;">
                                        <i class="bi bi-shield-lock-fill"></i>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block fw-semibold" style="font-size: 0.75rem; text-uppercase: true;">Account Status</small>
                                        <span class="badge bg-success">Active (Read-Only)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-light border-0">
                            <button type="button" class="btn btn-secondary px-4 rounded-pill" @click="closeProfileModal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            staffName: "",
            treks: [],
            selectedTrek: null,
            participants: [],
            loading: false,
            actionLoading: false,
            participantsLoading: false,
            errorMsg: "",
            successMsg: "",
            editSlots: 0,
            editStatus: "",
            rosterSearch: "",
            stats: {
                totalTreks: 0,
                totalParticipants: 0,
                activeTreks: 0,
            },
            staffProfile: {
                name: "",
                email: "",
                contact: "",
                role: ""
            },
            profileModalObj: null
        };
    },
    computed: {
        filteredParticipants() {
            if (!this.rosterSearch) return this.participants;
            const search = this.rosterSearch.toLowerCase();
            return this.participants.filter(p => 
                (p.user_name && p.user_name.toLowerCase().includes(search)) ||
                (p.user_email && p.user_email.toLowerCase().includes(search)) ||
                (p.user_contact && p.user_contact.toLowerCase().includes(search))
            );
        }
    },
    created() {
        // Retrieve staff info
        const name = localStorage.getItem("userName") || "Staff Member";
        this.staffName = name;
        
        // Fetch dashboard data
        this.fetchTreks();
        this.fetchStaffProfile();
    },
    mounted() {
        this.profileModalObj = new bootstrap.Modal(this.$refs.profileModalRef);
    },
    methods: {
        async fetchStaffProfile() {
            const token = localStorage.getItem("authToken");
            if (!token) return;
            try {
                const response = await fetch("/api/auth/profile", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    this.staffName = data.name;
                    localStorage.setItem("userName", data.name);
                    this.staffProfile = {
                        name: data.name,
                        email: data.email,
                        contact: data.contact,
                        role: data.role
                    };
                }
            } catch (err) {
                console.error("Error fetching staff profile:", err);
            }
        },
        openProfileModal() {
            if (this.profileModalObj) {
                this.profileModalObj.show();
            }
        },
        closeProfileModal() {
            if (this.profileModalObj) {
                this.profileModalObj.hide();
            }
        },
        async fetchTreks() {
            this.loading = true;
            this.errorMsg = "";
            const token = localStorage.getItem("authToken");
            try {
                const response = await fetch("/api/staff/treks", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (response.ok) {
                    this.treks = data;
                    this.calculateStats();
                    
                    // Keep previously selected trek updated in memory if it exists
                    if (this.selectedTrek) {
                        const updated = this.treks.find(t => t.id === this.selectedTrek.id);
                        if (updated) {
                            this.selectedTrek = updated;
                        }
                    }
                } else {
                    this.errorMsg = data.message || "Failed to load assigned treks.";
                }
            } catch (err) {
                this.errorMsg = "An error occurred while loading treks.";
            } finally {
                this.loading = false;
            }
        },
        calculateStats() {
            this.stats.totalTreks = this.treks.length;
            this.stats.totalParticipants = this.treks.reduce((sum, t) => sum + (t.bookings_count || 0), 0);
            this.stats.activeTreks = this.treks.filter(t => t.status === "OPEN" || t.status === "APPROVED").length;
        },
        selectTrek(trek) {
            this.selectedTrek = trek;
            this.editSlots = trek.available_slots;
            this.editStatus = trek.status;
            this.rosterSearch = "";
            this.fetchParticipants();
        },
        async fetchParticipants() {
            if (!this.selectedTrek) return;
            this.participantsLoading = true;
            const token = localStorage.getItem("authToken");
            try {
                const response = await fetch(`/api/staff/treks/${this.selectedTrek.id}/participants`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    this.participants = data;
                } else {
                    this.errorMsg = data.message || "Failed to load participants list.";
                }
            } catch (err) {
                this.errorMsg = "An error occurred while fetching participants.";
            } finally {
                this.participantsLoading = false;
            }
        },
        async updateTrekStatus(status) {
            if (!this.selectedTrek) return;
            this.actionLoading = true;
            this.errorMsg = "";
            this.successMsg = "";
            const token = localStorage.getItem("authToken");
            try {
                const response = await fetch(`/api/staff/treks/${this.selectedTrek.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ status })
                });
                const data = await response.json();
                if (response.ok) {
                    this.successMsg = `Trek status updated successfully to ${status}!`;
                    await this.fetchTreks();
                } else {
                    this.errorMsg = data.message || "Failed to update trek status.";
                }
            } catch (err) {
                this.errorMsg = "An error occurred while updating trek status.";
            } finally {
                this.actionLoading = false;
            }
        },
        async saveTrekParameters() {
            if (!this.selectedTrek) return;
            this.actionLoading = true;
            this.errorMsg = "";
            this.successMsg = "";
            const token = localStorage.getItem("authToken");
            try {
                const response = await fetch(`/api/staff/treks/${this.selectedTrek.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        available_slots: this.editSlots,
                        status: this.editStatus
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    this.successMsg = "Trek parameters updated successfully!";
                    await this.fetchTreks();
                } else {
                    this.errorMsg = data.message || "Failed to update trek parameters.";
                }
            } catch (err) {
                this.errorMsg = "An error occurred while saving trek parameters.";
            } finally {
                this.actionLoading = false;
            }
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
        getStatusBadgeClass(status) {
            if (status === "OPEN" || status === "APPROVED") return "badge bg-success";
            if (status === "PENDING") return "badge bg-warning text-dark";
            if (status === "CLOSED") return "badge bg-secondary";
            if (status === "COMPLETED") return "badge bg-info text-dark";
            return "badge bg-dark";
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
        }
    }
};

export default StaffDashboardPage;
