// VendorBridge - Hybrid Design Controller (Stitch & Wireframe Mockups)

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Nodes Cache ---
  const body = document.body;
  const loginPortal = document.getElementById("login-portal");
  const authCardContainer = document.getElementById("auth-card-container");
  const appContainer = document.getElementById("app-container");
  
  // Forms
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  
  // Toggles
  const btnShowRegister = document.getElementById("btn-show-register");
  const btnShowLogin = document.getElementById("btn-show-login");
  const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
  
  // Sidebar/Header Badges
  const sidebarUserAvatar = document.getElementById("sidebar-user-avatar");
  const sidebarUserName = document.getElementById("sidebar-user-name");
  const sidebarUserRole = document.getElementById("sidebar-user-role");
  const headerPageTitle = document.getElementById("header-page-title");
  
  const navLinks = document.querySelectorAll(".nav-link");
  const pageSections = document.querySelectorAll(".page-section");
  const toastContainer = document.getElementById("toast-container");

  // Detailed Analytics Panel
  const cardSpendingTrends = document.getElementById("card-spending-trends");
  const analyticsDetailsPanel = document.getElementById("analytics-details-panel");
  const btnCloseAnalytics = document.getElementById("btn-close-analytics");



  // Active Session Status
  let currentActiveTab = "dashboard";

  // --- Check Auth Status on Load ---
  function checkAuth() {
    const isLoggedIn = localStorage.getItem("stitch_vb_logged_in") === "true";
    if (isLoggedIn) {
      loginPortal.style.display = "none";
      appContainer.style.display = "flex";
      updateSidebarUserInfo();
      navigateTo(currentActiveTab);
    } else {
      loginPortal.style.display = "flex";
      appContainer.style.display = "none";
    }
  }

  function updateSidebarUserInfo() {
    const name = localStorage.getItem("stitch_vb_user_name") || "Jessica Davis";
    const role = localStorage.getItem("stitch_vb_current_role") || "Senior Procurement Director";
    sidebarUserName.textContent = name;
    sidebarUserRole.textContent = role;
    
    const avatarImg = localStorage.getItem("stitch_vb_user_avatar_img");
    if (avatarImg) {
      sidebarUserAvatar.innerHTML = `<img src="${avatarImg}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`;
    } else {
      // Initials
      const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
      sidebarUserAvatar.textContent = initials;
    }
  }

  // --- Toast Alert Helper ---
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "";
    if (type === "success") {
      icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="color:var(--success);"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === "danger") {
      icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="color:var(--danger);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
      icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="color:var(--warning);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="12" x2="12" y2="16"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      ${icon}
      <span style="font-weight:600; font-size:12.5px;">${message}</span>
    `;

    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-30px)";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- Audit Logger ---
  function logActivity(action, details) {
    const activities = window.VBState.getData("activities", []);
    const date = new Date();
    const timestamp = date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ", " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    activities.unshift({
      id: "ACT-" + Date.now(),
      timestamp: timestamp,
      user: localStorage.getItem("stitch_vb_user_name") || "Jessica Davis",
      action: action,
      details: details
    });
    window.VBState.setData("activities", activities);
  }

  // --- Router ---
  function navigateTo(targetId) {
    currentActiveTab = targetId;

    // Hide all pages, show active
    pageSections.forEach(sec => {
      sec.style.display = "none";
      sec.classList.remove("active");
    });

    const targetSection = document.getElementById(`section-${targetId}`);
    if (targetSection) {
      targetSection.style.display = "block";
      setTimeout(() => targetSection.classList.add("active"), 10);
    }

    // Highlight links
    navLinks.forEach(link => {
      if (link.getAttribute("data-target") === targetId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Page titles in Header
    let headingTitle = targetId.charAt(0).toUpperCase() + targetId.slice(1);
    if (targetId === "po") headingTitle = "Purchase Order";
    if (targetId === "rfqs") headingTitle = "Requests for Quotations";
    if (targetId === "quotations") headingTitle = "Quotation Comparison";
    if (targetId === "approvals") headingTitle = "Approval Workflow";
    headerPageTitle.textContent = headingTitle;

    // Render screen hooks
    if (targetId === "dashboard") renderDashboard();
    if (targetId === "vendors") renderVendors();
    if (targetId === "rfqs") renderRFQs();
    if (targetId === "quotations") renderQuotations();
    if (targetId === "approvals") renderApprovals();
    if (targetId === "po") renderPO();
    if (targetId === "invoices") renderInvoices();
    if (targetId === "activity") renderActivityLogs();
  }

  // --- Card flipping animations ---
  btnShowRegister.addEventListener("click", () => {
    authCardContainer.classList.add("register-active");
  });

  btnShowLogin.addEventListener("click", () => {
    authCardContainer.classList.remove("register-active");
  });

  // Photo Upload Handler matching wireframe
  const regPhotoContainer = document.getElementById("reg-photo-container");
  const regPhotoInput = document.getElementById("reg-photo-input");
  const regPhotoPreview = document.getElementById("reg-photo-preview");
  const regPhotoPlaceholder = document.getElementById("reg-photo-placeholder");
  let uploadedPhotoUrl = "";

  if (regPhotoContainer && regPhotoInput) {
    regPhotoContainer.addEventListener("click", () => {
      regPhotoInput.click();
    });

    regPhotoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedPhotoUrl = event.target.result;
          if (regPhotoPreview) {
            regPhotoPreview.src = uploadedPhotoUrl;
            regPhotoPreview.style.display = "block";
          }
          if (regPhotoPlaceholder) {
            regPhotoPlaceholder.style.display = "none";
          }
          showToast("Photo uploaded successfully!");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Login submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("login-email").value.trim().toLowerCase();
    
    // Check if there is a registered user matching this email
    const registeredUserStr = localStorage.getItem("stitch_vb_registered_user");
    if (registeredUserStr) {
      const regUser = JSON.parse(registeredUserStr);
      if (regUser.email.trim().toLowerCase() === emailInput) {
        localStorage.setItem("stitch_vb_logged_in", "true");
        localStorage.setItem("stitch_vb_user_name", regUser.fullName);
        localStorage.setItem("stitch_vb_current_role", regUser.role);
        if (regUser.photoUrl) {
          localStorage.setItem("stitch_vb_user_avatar_img", regUser.photoUrl);
        } else {
          localStorage.removeItem("stitch_vb_user_avatar_img");
        }
        
        logActivity("User Login", `Access authorized for registered user: ${regUser.fullName} (${regUser.role}).`);
        showToast(`Signed in successfully as ${regUser.fullName}!`);
        checkAuth();
        return;
      }
    }

    // Default Fallback
    localStorage.setItem("stitch_vb_logged_in", "true");
    localStorage.setItem("stitch_vb_user_name", "Jessica Davis");
    localStorage.setItem("stitch_vb_current_role", "Senior Procurement Director");
    localStorage.removeItem("stitch_vb_user_avatar_img");
    
    logActivity("User Login", "Access authorized to corporate procurement dashboard.");
    showToast("Signed in successfully as Jessica Davis!");
    checkAuth();
  });

  // Registration submission matching new wireframe (Screen 2)
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const firstName = document.getElementById("reg-first-name").value.trim();
    const lastName = document.getElementById("reg-last-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const role = document.getElementById("reg-role").value;
    const country = document.getElementById("reg-country").value.trim();
    const additionalInfo = document.getElementById("reg-additional-info").value.trim();

    const fullName = `${firstName} ${lastName}`;
    const newUser = {
      firstName,
      lastName,
      fullName,
      email,
      phone,
      role,
      country,
      additionalInfo,
      photoUrl: uploadedPhotoUrl
    };

    // Store registered user in localStorage
    localStorage.setItem("stitch_vb_registered_user", JSON.stringify(newUser));

    // Log the user in immediately
    localStorage.setItem("stitch_vb_logged_in", "true");
    localStorage.setItem("stitch_vb_user_name", fullName);
    localStorage.setItem("stitch_vb_current_role", role);
    if (uploadedPhotoUrl) {
      localStorage.setItem("stitch_vb_user_avatar_img", uploadedPhotoUrl);
    } else {
      localStorage.removeItem("stitch_vb_user_avatar_img");
    }
    
    logActivity("User Self-Signup", `Profile created for ${fullName} (${role}), Email: ${email}.`);
    showToast(`Welcome to VendorBridge, ${fullName}!`);
    checkAuth();
  });

  // Demo shortcut login
  document.querySelectorAll(".demo-login-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.setItem("stitch_vb_logged_in", "true");
      localStorage.setItem("stitch_vb_user_name", "Jessica Davis");
      localStorage.setItem("stitch_vb_current_role", "Senior Procurement Director");
      
      logActivity("Demo Bypass Login", "Authorized bypass.");
      showToast("Developer mode: Authenticated as CPO Jessica Davis.");
      checkAuth();
    });
  });

  // Log out action
  document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.setItem("stitch_vb_logged_in", "false");
    logActivity("User Sign-Out", "Session terminated.");
    showToast("Signed out successfully.");
    checkAuth();
  });

  // Reset database state
  document.getElementById("btn-reset").addEventListener("click", () => {
    if (confirm("Reset local storage databases to initial mockup states?")) {
      window.VBState.resetAll();
    }
  });

  // --- Collapsible Sidebar Menu ---
  btnToggleSidebar.addEventListener("click", () => {
    if (window.innerWidth > 992) {
      body.classList.toggle("sidebar-collapsed");
    } else {
      body.classList.toggle("sidebar-open");
    }
  });

  // Mobile sidebar auto hide on navigation
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      body.classList.remove("sidebar-open");
    });
  });

  // --- Dynamic Dashboard Rendering ---
  function renderDashboard() {
    const role = localStorage.getItem("stitch_vb_current_role") || "Senior Procurement Director";
    const welcomeText = document.getElementById("dashboard-welcome");
    if (welcomeText) {
      welcomeText.textContent = `Welcome back, ${role} - Today's Overview`;
    }

    // Analytics Details toggles
    cardSpendingTrends.onclick = () => {
      analyticsDetailsPanel.classList.add("active");
      drawMonthlySpendChart();
      analyticsDetailsPanel.scrollIntoView({ behavior: "smooth" });
    };

    const trendsLink = document.getElementById("btn-open-trends-link");
    if (trendsLink) {
      trendsLink.onclick = () => {
        analyticsDetailsPanel.classList.add("active");
        drawMonthlySpendChart();
        analyticsDetailsPanel.scrollIntoView({ behavior: "smooth" });
      };
    }

    btnCloseAnalytics.onclick = () => {
      analyticsDetailsPanel.classList.remove("active");
    };

    // Bottom Action Buttons
    const dashNewRfq = document.getElementById("dash-btn-new-rfq");
    if (dashNewRfq) {
      dashNewRfq.onclick = () => {
        navigateTo("rfqs");
        const createBtn = document.getElementById("btn-show-create-rfq");
        if (createBtn) createBtn.click();
      };
    }

    const dashAddVendor = document.getElementById("dash-btn-add-vendor");
    if (dashAddVendor) {
      dashAddVendor.onclick = () => {
        navigateTo("vendors");
        // Simulate adding a vendor or opening add dialog
        const addVendorBtn = document.getElementById("btn-add-vendor");
        if (addVendorBtn) addVendorBtn.click();
      };
    }

    const dashViewInvoices = document.getElementById("dash-btn-view-invoices");
    if (dashViewInvoices) {
      dashViewInvoices.onclick = () => {
        navigateTo("invoices");
      };
    }

    // Dashboard navigation links for POs
    document.querySelectorAll(".dash-po-link").forEach(link => {
      link.onclick = () => {
        navigateTo("po");
      };
    });
  }

  function drawMonthlySpendChart() {
    const canvas = document.getElementById("monthly-chart-canvas");
    canvas.innerHTML = ""; // Clear

    const data = [
      { month: "Jan", val: 28000, label: "28k" },
      { month: "Feb", val: 45000, label: "45k" },
      { month: "Mar", val: 84000, label: "84k" },
      { month: "Apr", val: 52000, label: "52k" },
      { month: "May", val: 120000, label: "120k" }
    ];

    const maxVal = 120000;

    data.forEach(item => {
      const heightPercent = (item.val / maxVal) * 100;
      
      const bar = document.createElement("div");
      bar.className = "trend-bar-element";
      bar.setAttribute("data-val", `$${item.label}`);
      bar.setAttribute("data-label", item.month);
      
      // Blue bar fill styles for light theme
      bar.style.backgroundColor = "var(--sidebar-bg)";
      bar.style.border = "none";
      
      // Animate height entry
      bar.style.height = "0%";
      canvas.appendChild(bar);
      
      setTimeout(() => {
        bar.style.height = `${heightPercent}%`;
      }, 100);
    });
  }

  // --- Screen 3: Render Vendors list ---
  function renderVendors() {
    const vendors = window.VBState.getData("vendors", []);
    const searchInput = document.getElementById("vendor-search-input");
    const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";
    
    const activePill = document.querySelector(".filter-pill.active");
    const filterValue = activePill ? activePill.getAttribute("data-filter") : "All";
    
    // Update pill counts dynamically
    const allPill = document.querySelector(".filter-pill[data-filter='All']");
    const activePillBtn = document.querySelector(".filter-pill[data-filter='Active']");
    const pendingPill = document.querySelector(".filter-pill[data-filter='Pending']");
    const blockedPill = document.querySelector(".filter-pill[data-filter='Blocked']");
    
    if (allPill) allPill.textContent = `All (${vendors.length})`;
    if (activePillBtn) {
      const activeCount = vendors.filter(v => {
        const st = v.status.toLowerCase();
        return st === "active" || st === "approved";
      }).length;
      activePillBtn.textContent = `active (${activeCount})`;
    }
    if (pendingPill) {
      const pendingCount = vendors.filter(v => v.status.toLowerCase() === "pending").length;
      pendingPill.textContent = `Pending (${pendingCount})`;
    }
    if (blockedPill) {
      const blockedCount = vendors.filter(v => v.status.toLowerCase() === "blocked").length;
      blockedPill.textContent = `Blocked (${blockedCount})`;
    }

    const tbody = document.querySelector("#vendors-table tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = vendors.filter(v => {
      if (filterValue !== "All") {
        const filterValLower = filterValue.toLowerCase();
        const vendorStatusLower = v.status.toLowerCase();
        if (filterValLower === "active") {
          if (vendorStatusLower !== "active" && vendorStatusLower !== "approved") return false;
        } else {
          if (vendorStatusLower !== filterValLower) return false;
        }
      }
      if (searchValue) {
        const nameMatch = v.name.toLowerCase().includes(searchValue);
        const gstMatch = v.gst.toLowerCase().includes(searchValue);
        const categoryMatch = v.category.toLowerCase().includes(searchValue);
        return nameMatch || gstMatch || categoryMatch;
      }
      return true;
    });

    filtered.forEach(v => {
      const tr = document.createElement("tr");
      let statusClass = "status-active";
      if (v.status.toLowerCase() === "pending") statusClass = "status-pending";
      if (v.status.toLowerCase() === "blocked") statusClass = "status-blocked";

      tr.innerHTML = `
        <td>
          <div style="font-weight: 600; color: #1e293b;">${v.name}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">ID: ${v.id}</div>
        </td>
        <td style="font-weight: 500;">${v.category}</td>
        <td style="font-family: monospace; font-size: 12.5px; color: #475569;">${v.gst}</td>
        <td style="color: #475569;">${v.phone || "N/A"}</td>
        <td><span class="status-tag ${statusClass}">${v.status}</span></td>
        <td style="text-align: center;">
          <button class="btn-select btn-view-vendor" data-vendor-id="${v.id}" style="padding: 4px 8px; font-size: 11px; width: auto; min-width: 60px;">View</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach event listeners to View buttons
    tbody.querySelectorAll(".btn-view-vendor").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const vendorId = e.currentTarget.getAttribute("data-vendor-id");
        openViewVendorModal(vendorId);
      });
    });
  }

  // --- Screen 4: Render RFQs ---
  function renderRFQs() {
    const rfqs = window.VBState.getData("rfqs", []);
    const tbody = document.querySelector("#rfqs-table tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    rfqs.forEach(rfq => {
      const tr = document.createElement("tr");
      
      let statusClass = "status-pending";
      if (rfq.status === "PO Generated" || rfq.status === "Comparing") statusClass = "status-active";
      if (rfq.status === "Draft") statusClass = "status-blocked";

      // assigned vendors names mapping
      const vendors = window.VBState.getData("vendors", []);
      const poolNames = rfq.assignedVendors.map(vid => {
        const v = vendors.find(x => x.id === vid);
        return v ? v.name.split(" ")[0] : vid;
      }).join(", ");

      tr.innerHTML = `
        <td style="font-weight:700; color:var(--sidebar-bg); cursor: pointer;" class="rfq-row-link" data-rfqid="${rfq.id}">${rfq.id}</td>
        <td style="font-weight:600;">${rfq.title}</td>
        <td>${rfq.deadline}</td>
        <td>${poolNames || "None"}</td>
        <td><span class="status-tag ${statusClass}">${rfq.status}</span></td>
      `;
      tbody.appendChild(tr);
    });

    // Add click listeners to RFQ IDs to route to Approvals or Quotations
    document.querySelectorAll(".rfq-row-link").forEach(link => {
      link.addEventListener("click", () => {
        const rfqid = link.getAttribute("data-rfqid");
        const rfqsList = window.VBState.getData("rfqs", []);
        const rfq = rfqsList.find(r => r.id === rfqid);
        if (rfq) {
          if (rfq.status === "Pending L2 Approval" || rfq.status === "PO Generated") {
            navigateTo("approvals");
          } else {
            navigateTo("quotations");
          }
        }
      });
    });
  }

  // --- RFQs Create View Event Handlers ---
  const btnShowCreateRfq = document.getElementById("btn-show-create-rfq");
  const btnCancelCreateRfq = document.getElementById("btn-cancel-create-rfq");
  const rfqsListView = document.getElementById("rfqs-list-view");
  const rfqsCreateView = document.getElementById("rfqs-create-view");
  const btnAddRfqItem = document.getElementById("btn-add-rfq-item");
  const rfqItemsTableTbody = document.querySelector("#new-rfq-items-table tbody");
  const btnAddRfqVendor = document.getElementById("btn-add-rfq-vendor");
  const assignedVendorsContainer = document.getElementById("assigned-vendors-container");
  const btnSaveSendRfq = document.getElementById("btn-save-send-rfq");
  const btnSaveDraftRfq = document.getElementById("btn-save-draft-rfq");

  if (btnShowCreateRfq) {
    btnShowCreateRfq.addEventListener("click", () => {
      rfqsListView.style.display = "none";
      rfqsCreateView.style.display = "block";
    });
  }

  if (btnCancelCreateRfq) {
    btnCancelCreateRfq.addEventListener("click", () => {
      rfqsCreateView.style.display = "none";
      rfqsListView.style.display = "block";
    });
  }

  if (btnAddRfqItem && rfqItemsTableTbody) {
    btnAddRfqItem.addEventListener("click", () => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" class="form-input item-name-input" placeholder="Item Name" style="padding:6px; font-size:12px;"></td>
        <td><input type="number" class="form-input item-qty-input" value="1" style="padding:6px; font-size:12px; width:70px;"></td>
        <td><input type="text" class="form-input item-unit-input" value="NOS" style="padding:6px; font-size:12px; width:70px;"></td>
        <td><button class="btn-select btn-delete-item" style="padding:4px 8px; font-size:11px; width:auto; border-color:var(--danger); color:var(--danger);">x</button></td>
      `;
      rfqItemsTableTbody.appendChild(tr);

      // Bind delete handler
      tr.querySelector(".btn-delete-item").addEventListener("click", () => {
        tr.remove();
      });
    });
  }

  // Handle existing delete buttons
  document.querySelectorAll(".btn-delete-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.target.closest("tr").remove();
    });
  });

  // Handle removing assigned vendors
  function setupVendorRemoveHandlers() {
    document.querySelectorAll(".btn-remove-assigned-vendor").forEach(btn => {
      btn.onclick = (e) => {
        e.target.closest(".assigned-vendor-pill").remove();
      };
    });
  }
  setupVendorRemoveHandlers();

  // --- Assign Vendor To RFQ Modal Actions ---
  const assignVendorModal = document.getElementById("assign-vendor-modal");
  const assignVendorSelect = document.getElementById("assign-vendor-select");
  const btnConfirmAssignVendor = document.getElementById("btn-confirm-assign-vendor");
  const btnCancelAssignVendor = document.getElementById("btn-cancel-assign-vendor");
  const btnCloseAssignVendorModal = document.getElementById("btn-close-assign-vendor-modal");

  if (btnAddRfqVendor && assignedVendorsContainer) {
    btnAddRfqVendor.addEventListener("click", () => {
      const vendors = window.VBState.getData("vendors", []);
      const assignedIds = Array.from(document.querySelectorAll(".assigned-vendor-pill")).map(pill => pill.getAttribute("data-vendor"));
      const availableVendors = vendors.filter(v => !assignedIds.includes(v.id));

      if (availableVendors.length === 0) {
        showToast("All available vendors are already assigned!", "warning");
        return;
      }

      if (assignVendorSelect) {
        assignVendorSelect.innerHTML = availableVendors.map(v => `
          <option value="${v.id}">${v.name} (${v.category})</option>
        `).join("");
      }

      if (assignVendorModal) assignVendorModal.classList.add("active");
    });
  }

  if (btnCancelAssignVendor) {
    btnCancelAssignVendor.onclick = () => assignVendorModal.classList.remove("active");
  }
  if (btnCloseAssignVendorModal) {
    btnCloseAssignVendorModal.onclick = () => assignVendorModal.classList.remove("active");
  }

  if (btnConfirmAssignVendor) {
    btnConfirmAssignVendor.addEventListener("click", () => {
      if (!assignVendorSelect) return;
      const vendorId = assignVendorSelect.value;
      const vendors = window.VBState.getData("vendors", []);
      const selectedVendor = vendors.find(v => v.id === vendorId);

      if (selectedVendor) {
        const div = document.createElement("div");
        div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;";
        div.className = "assigned-vendor-pill";
        div.setAttribute("data-vendor", selectedVendor.id);
        div.innerHTML = `
          <span style="font-size: 13px; font-weight: 600;">${selectedVendor.name}</span>
          <span style="cursor: pointer; font-weight: 700; color: var(--danger); font-size: 14px;" class="btn-remove-assigned-vendor">×</span>
        `;
        assignedVendorsContainer.appendChild(div);
        setupVendorRemoveHandlers();
        showToast(`${selectedVendor.name} assigned successfully!`);
      }
      assignVendorModal.classList.remove("active");
    });
  }

  // --- Attachments Click Upload ---
  const rfqUploadZone = document.getElementById("rfq-upload-zone");
  const rfqFileInput = document.getElementById("rfq-file-input");
  const rfqUploadLabel = document.getElementById("rfq-upload-label");

  if (rfqUploadZone && rfqFileInput) {
    rfqUploadZone.addEventListener("click", () => rfqFileInput.click());
    rfqFileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        rfqUploadLabel.textContent = `Attached: ${e.target.files[0].name}`;
        rfqUploadLabel.style.color = "var(--success)";
        showToast(`File ${e.target.files[0].name} uploaded!`);
      }
    });
  }

  function saveRFQ(isDraft) {
    const title = document.getElementById("new-rfq-title").value.trim();
    const deadline = document.getElementById("new-rfq-deadline").value.trim();
    const category = document.getElementById("new-rfq-category").value.trim();
    const description = document.getElementById("new-rfq-description").value.trim();

    if (!title || !deadline) {
      showToast("RFQ Title and Deadline are required!", "danger");
      return;
    }

    const items = Array.from(document.querySelectorAll("#new-rfq-items-table tbody tr")).map(tr => {
      const name = tr.querySelector(".item-name-input").value.trim();
      const qty = parseInt(tr.querySelector(".item-qty-input").value) || 0;
      const unit = tr.querySelector(".item-unit-input").value.trim();
      return { name, qty, unit };
    }).filter(it => it.name !== "");

    if (items.length === 0) {
      showToast("Please add at least one line item!", "danger");
      return;
    }

    const assignedIds = Array.from(document.querySelectorAll(".assigned-vendor-pill")).map(p => p.getAttribute("data-vendor"));

    const rfqs = window.VBState.getData("rfqs", []);
    const newId = "RFQ-2024-" + String(100 + rfqs.length);
    const uploadedFileName = rfqFileInput && rfqFileInput.files.length > 0 ? rfqFileInput.files[0].name : "specs.pdf";
    
    const newRfq = {
      id: newId,
      title: title,
      category: category,
      deadline: deadline,
      description: description,
      status: isDraft ? "Draft" : "Comparing",
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      client: "Global Tech Solutions Inc.",
      totalValue: isDraft ? 0 : 185400,
      items: items,
      assignedVendors: assignedIds,
      attachment: uploadedFileName
    };

    rfqs.unshift(newRfq);
    window.VBState.setData("rfqs", rfqs);

    logActivity(isDraft ? "Created RFQ Draft" : "Dispatched RFQ", `Created ${newId}: "${title}" with ${items.length} line items.`);
    showToast(isDraft ? "RFQ saved as draft." : "RFQ dispatched to assigned vendors!");

    // Reset create form inputs
    document.getElementById("new-rfq-title").value = "Office Furniture procurement Q2";
    document.getElementById("new-rfq-category").value = "Furniture";
    document.getElementById("new-rfq-deadline").value = "15 June 2025";
    document.getElementById("new-rfq-description").value = "Ergonomic chairs and standing desks for 3rd floor";

    // Reset line items table to defaults (from Screen 5 screenshot)
    if (rfqItemsTableTbody) {
      rfqItemsTableTbody.innerHTML = `
        <tr>
          <td><input type="text" class="form-input item-name-input" value="Ergonomic chair" style="padding:6px; font-size:12px;"></td>
          <td><input type="number" class="form-input item-qty-input" value="25" style="padding:6px; font-size:12px; width:70px;"></td>
          <td><input type="text" class="form-input item-unit-input" value="NOS" style="padding:6px; font-size:12px; width:70px;"></td>
          <td><button class="btn-select btn-delete-item" style="padding:4px 8px; font-size:11px; width:auto; border-color:var(--danger); color:var(--danger);">x</button></td>
        </tr>
        <tr>
          <td><input type="text" class="form-input item-name-input" value="Standing desks" style="padding:6px; font-size:12px;"></td>
          <td><input type="number" class="form-input item-qty-input" value="10" style="padding:6px; font-size:12px; width:70px;"></td>
          <td><input type="text" class="form-input item-unit-input" value="NOS" style="padding:6px; font-size:12px; width:70px;"></td>
          <td><button class="btn-select btn-delete-item" style="padding:4px 8px; font-size:11px; width:auto; border-color:var(--danger); color:var(--danger);">x</button></td>
        </tr>
      `;
      // Re-bind delete events
      rfqItemsTableTbody.querySelectorAll(".btn-delete-item").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.target.closest("tr").remove();
        });
      });
    }

    // Reset assigned vendors to defaults
    if (assignedVendorsContainer) {
      assignedVendorsContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;" class="assigned-vendor-pill" data-vendor="VND-INFRA">
          <span style="font-size: 13px; font-weight: 600;">Infra Supplies Pvt ltd</span>
          <span style="cursor: pointer; font-weight: 700; color: var(--danger); font-size: 14px;" class="btn-remove-assigned-vendor">×</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;" class="assigned-vendor-pill" data-vendor="VND-TECHCORE">
          <span style="font-size: 13px; font-weight: 600;">Techcore LTD</span>
          <span style="cursor: pointer; font-weight: 700; color: var(--danger); font-size: 14px;" class="btn-remove-assigned-vendor">×</span>
        </div>
      `;
      setupVendorRemoveHandlers();
    }

    // Reset attachment label
    if (rfqUploadLabel) {
      rfqUploadLabel.textContent = "Drag & drop files or click to upload";
      rfqUploadLabel.style.color = "var(--text-muted)";
    }
    if (rfqFileInput) rfqFileInput.value = "";

    // Switch view back to list
    rfqsCreateView.style.display = "none";
    rfqsListView.style.display = "block";
    renderRFQs();
  }

  if (btnSaveSendRfq) {
    btnSaveSendRfq.addEventListener("click", () => saveRFQ(false));
  }
  if (btnSaveDraftRfq) {
    btnSaveDraftRfq.addEventListener("click", () => saveRFQ(true));
  }

  // --- Screen 5: Quotations Calculations & Submits ---
  const priceInput1 = document.getElementById("submit-price-1");
  const priceInput2 = document.getElementById("submit-price-2");
  const delivInput1 = document.getElementById("submit-deliv-1");
  const delivInput2 = document.getElementById("submit-deliv-2");
  const gstInput = document.getElementById("submit-gst-input");
  const notesInput = document.getElementById("submit-notes-input");
  const btnSubmitQuotation = document.getElementById("btn-submit-quotation");
  const btnDraftQuotation = document.getElementById("btn-draft-quotation");
  const quotationsSubmitView = document.getElementById("quotations-submit-view");
  const quotationsCompareView = document.getElementById("quotations-compare-view");

  function recalculateQuotationSubmitForm() {
    const qty1 = 25;
    const qty2 = 10;
    
    const price1 = parseFloat(priceInput1.value) || 0;
    const price2 = parseFloat(priceInput2.value) || 0;
    
    const total1 = qty1 * price1;
    const total2 = qty2 * price2;
    
    document.getElementById("submit-total-1").textContent = total1.toLocaleString();
    document.getElementById("submit-total-2").textContent = total2.toLocaleString();
    
    const subtotal = total1 + total2;
    document.getElementById("submit-calc-subtotal").textContent = subtotal.toLocaleString();
    
    // Parse GST percent
    const gstPercentStr = gstInput.value.replace(/[^0-9.]/g, '');
    const gstPercent = parseFloat(gstPercentStr) || 18;
    
    const gstAmount = subtotal * (gstPercent / 100);
    document.getElementById("submit-calc-gst").textContent = Math.round(gstAmount).toLocaleString();
    
    const grandTotal = subtotal + gstAmount;
    document.getElementById("submit-calc-grand-total").textContent = Math.round(grandTotal).toLocaleString();
  }

  function renderQuotations() {
    const rfqs = window.VBState.getData("rfqs", []);
    const activeRFQ = rfqs.find(r => r.id === "RFQ-2024-089") || rfqs[0];
    
    if (!quotationsSubmitView || !quotationsCompareView) return;
    
    // Load saved TechCore quote if exists
    const savedQuoteStr = localStorage.getItem("stitch_vb_techcore_submitted_quote");
    if (savedQuoteStr) {
      const savedQuote = JSON.parse(savedQuoteStr);
      if (document.getElementById("comp-total-techcore")) {
        document.getElementById("comp-total-techcore").textContent = savedQuote.total;
      }
      if (document.getElementById("comp-gst-techcore")) {
        document.getElementById("comp-gst-techcore").textContent = savedQuote.gst;
      }
      if (document.getElementById("comp-deliv-techcore")) {
        document.getElementById("comp-deliv-techcore").textContent = savedQuote.delivery;
      }
      // Set values back in inputs in case user wants to re-submit
      if (priceInput1) priceInput1.value = savedQuote.price1;
      if (priceInput2) priceInput2.value = savedQuote.price2;
      if (gstInput) gstInput.value = savedQuote.gst + " %";
      if (notesInput) notesInput.value = savedQuote.notes;
    }
    
    if (activeRFQ && (activeRFQ.status === "Comparing" || activeRFQ.status === "Pending L2 Approval" || activeRFQ.status === "PO Generated")) {
      quotationsSubmitView.style.display = "none";
      quotationsCompareView.style.display = "block";
    } else {
      quotationsSubmitView.style.display = "block";
      quotationsCompareView.style.display = "none";
      recalculateQuotationSubmitForm();
    }
  }

  if (priceInput1) priceInput1.addEventListener("input", recalculateQuotationSubmitForm);
  if (priceInput2) priceInput2.addEventListener("input", recalculateQuotationSubmitForm);
  if (gstInput) gstInput.addEventListener("input", recalculateQuotationSubmitForm);

  if (btnSubmitQuotation) {
    btnSubmitQuotation.addEventListener("click", () => {
      const price1 = parseFloat(priceInput1.value) || 0;
      const price2 = parseFloat(priceInput2.value) || 0;
      const deliv1 = parseInt(delivInput1.value) || 7;
      const deliv2 = parseInt(delivInput2.value) || 14;
      const gstPercentStr = gstInput.value.replace(/[^0-9.]/g, '');
      const gstPercent = parseFloat(gstPercentStr) || 18;

      const subtotal = (25 * price1) + (10 * price2);
      const grandTotal = Math.round(subtotal * (1 + gstPercent/100));
      const maxDeliv = Math.max(deliv1, deliv2);

      // Save TechCore quote details in localStorage
      const techcoreQuote = {
        total: grandTotal,
        gst: gstPercent,
        delivery: maxDeliv,
        price1: price1,
        price2: price2,
        notes: notesInput.value.trim()
      };
      localStorage.setItem("stitch_vb_techcore_submitted_quote", JSON.stringify(techcoreQuote));

      // Update comparison table values dynamically
      document.getElementById("comp-total-techcore").textContent = grandTotal;
      document.getElementById("comp-gst-techcore").textContent = gstPercent;
      document.getElementById("comp-deliv-techcore").textContent = maxDeliv;

      // Update active RFQ status in DB
      const rfqs = window.VBState.getData("rfqs", []);
      const activeRFQ = rfqs.find(r => r.id === "RFQ-2024-089");
      if (activeRFQ) {
        activeRFQ.status = "Comparing";
        window.VBState.setData("rfqs", rfqs);
      }

      logActivity("Submitted TechCore Quote", `Entered quote: subtotal $${subtotal.toLocaleString()}, total $${grandTotal.toLocaleString()} with GST ${gstPercent}%.`);
      showToast("Quotation submitted successfully! Comparative analysis board loaded.");

      // Switch view
      quotationsSubmitView.style.display = "none";
      quotationsCompareView.style.display = "block";
    });
  }

  if (btnDraftQuotation) {
    btnDraftQuotation.addEventListener("click", () => {
      showToast("Quotation saved as draft.");
      navigateTo("dashboard");
    });
  }

  // --- Screen 5 comparison grid select actions ---
  const btnSelectApproveInfra = document.getElementById("btn-select-approve-infra");
  const btnSelectTechcore = document.getElementById("btn-select-techcore");
  const btnSelectOfficeneed = document.getElementById("btn-select-officeneed");

  function selectQuotationAndRoute(vendorId, vendorName, totalValue) {
    const rfqs = window.VBState.getData("rfqs", []);
    const activeRFQ = rfqs.find(r => r.id === "RFQ-2024-089");
    
    if (activeRFQ) {
      activeRFQ.status = "Pending L2 Approval";
      activeRFQ.selectedVendor = vendorId;
      activeRFQ.totalValue = totalValue;
      window.VBState.setData("rfqs", rfqs);
      
      // Update PO details in DB to reflect selected vendor
      const pos = window.VBState.getData("pos", []);
      const po = pos.find(p => p.rfqId === "RFQ-2024-089") || pos[0];
      if (po) {
        po.vendorId = vendorId;
        po.toOrg = vendorName;
        po.total = totalValue;
        po.subtotal = Math.round(totalValue / 1.18);
        po.cgst = Math.round((totalValue - po.subtotal) / 2);
        po.sgst = po.cgst;
        
        const vendors = window.VBState.getData("vendors", []);
        const vendor = vendors.find(v => v.id === vendorId);
        if (vendor) {
          po.toAddress = `${vendor.address || "New Delhi, India"}\nVAT ID: ${vendor.gst || "US88392011"}`;
        }
        window.VBState.setData("pos", pos);
      }

      // Update UI of Approvals screen dynamically before navigating
      document.getElementById("approval-rfq-title").textContent = `RFQ-2024-089: ${activeRFQ.title}`;
      document.getElementById("approval-rfq-meta").textContent = `${vendorName} • $${totalValue.toLocaleString()}.00`;
      
      const timelineUser = document.querySelector(".approval-chain-timeline");
      if (timelineUser) {
        timelineUser.innerHTML = `
          <div class="chain-item">
            <div class="chain-node checked"></div>
            <div class="chain-header-row">
              <span class="chain-user">Rahul Mehta</span>
              <span class="chain-time">Oct 12, 10:45 AM</span>
            </div>
            <div style="font-size:11.5px; color:var(--text-secondary); margin-bottom:6px;">Procurement Analyst (Initiator)</div>
            <p class="chain-comment-bubble">"Urgent requirement for Q4 maintenance cycle."</p>
          </div>

          <div class="chain-item">
            <div class="chain-node awaiting"></div>
            <div class="chain-header-row">
              <span class="chain-user">Priya Shah</span>
              <span class="badge badge-warning" style="font-size:9.5px; padding:3px 8px; border-radius:12px;">Awaiting Action</span>
            </div>
            <div style="font-size:11.5px; color:var(--text-secondary); margin-bottom:6px;">Department Manager (L1)</div>
          </div>
        `;
      }

      // Update Quotation Summary box
      const initial = vendorName[0];
      const summaryBox = document.querySelector("#section-approvals .two-column-layout > div:last-child");
      if (summaryBox) {
        summaryBox.innerHTML = `
          <div class="card" style="padding:0; overflow:hidden; margin-bottom:20px;">
            <div style="background-color:var(--sidebar-bg); color:white; padding:16px 20px;">
              <h3 style="font-size:14px; font-weight:600; color:white;">Quotation Summary</h3>
              <span style="font-size:11px; opacity:0.8;">Ref: QUO-INFRA-8842</span>
            </div>
            
            <div style="padding:20px;">
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px;">
                <div style="width:36px; height:36px; border-radius:4px; background-color:#e2f4ee; color:var(--success); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px;">${initial}</div>
                <div>
                  <h4 style="font-size:13.5px; font-weight:700;">${vendorName}</h4>
                  <span style="font-size:11px; color:#fbbf24;">★★★★★ <span style="color:var(--text-secondary); font-size:11px;">(4.5 Platinum Vendor)</span></span>
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:16px;">
                <div>
                  <span style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:2px;">Total Value</span>
                  <span style="font-size:14px; font-weight:700; color:var(--sidebar-bg);">$${totalValue.toLocaleString()}.00</span>
                </div>
                <div>
                  <span style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:2px;">Delivery ETA</span>
                  <span style="font-size:13.5px; font-weight:600;">10 Days</span>
                </div>
                <div>
                  <span style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:2px;">Payment Terms</span>
                  <span style="font-size:13.5px; font-weight:600;">30 Days</span>
                </div>
                <div>
                  <span style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:2px;">Warranty</span>
                  <span style="font-size:13.5px; font-weight:600;">12 Months</span>
                </div>
              </div>

              <div style="margin-bottom:16px;">
                <span style="font-size:11px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); display:block; margin-bottom:8px;">Line Item Breakdown</span>
                <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:6px;">
                  <span>Ergonomic chair (x25)</span>
                  <span style="font-weight:600;">$75,000.00</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:6px;">
                  <span>Standing desks (x10)</span>
                  <span style="font-weight:600;">$82,119.00</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:12px;">
                  <span>Tax (18% GST)</span>
                  <span style="font-weight:600;">$28,281.00</span>
                </div>
              </div>

              <div style="background-color:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.15); border-radius:6px; padding:12px 14px; margin-bottom:20px; display:flex; gap:10px; align-items:flex-start;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--info)" stroke-width="2" style="margin-top:2px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <p style="font-size:11.5px; color:var(--text-secondary); line-height:1.45;">Selected bid representing L1 optimal costs, certified local delivery, and including 12 months service SLA.</p>
              </div>

              <div style="text-align:center; margin-bottom: 20px;">
                <a href="#" class="auth-toggle-link" style="margin-top:0; font-size:13px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  View Full Quote Document
                </a>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:12px; margin-bottom: 20px;">
            <button class="btn-select-approve" id="btn-approve-rfq" style="flex:1;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Approve
            </button>
            <button class="btn-select-approve" id="btn-reject-rfq" style="flex:1; background-color:var(--danger); border-color:var(--danger);">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Reject
            </button>
          </div>

          <div class="card" style="padding:0; overflow:hidden;">
            <div class="stamp-image-container" style="height:150px; background-color:#1e293b; color:#fff; position:relative; flex-direction:column; justify-content:flex-end; padding:20px; align-items:flex-start;">
              <div style="position:absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1)); z-index:1;"></div>
              <div style="position:relative; z-index:2;">
                <h4 style="color:#ffffff; font-size:13.5px; font-weight:700;">Certified Facility: ${vendorName} HQ</h4>
                <span style="color:rgba(255,255,255,0.7); font-size:11px; display:block; margin-top:2px;">Last inspection: Sept 2025 • Grade A</span>
              </div>
            </div>
          </div>
        `;
        // Re-bind actions since elements were dynamically redrawn
        document.getElementById("btn-approve-rfq").addEventListener("click", approveRFQAction);
        document.getElementById("btn-reject-rfq").addEventListener("click", rejectRFQAction);
      }

      logActivity("Quotation Selected", `Selected ${vendorName} proposal for ${activeRFQ.id} totaling $${totalValue.toLocaleString()}. Routing L2 Approval chain.`);
      showToast(`${vendorName} selected! Dispatched to Jessica Davis approvals queue.`);
      navigateTo("approvals");
    }
  }

  if (btnSelectApproveInfra) {
    btnSelectApproveInfra.addEventListener("click", () => {
      selectQuotationAndRoute("VND-INFRA", "Infra Supplies Pvt ltd", 185400);
    });
  }
  if (btnSelectTechcore) {
    btnSelectTechcore.addEventListener("click", () => {
      const parsedCompPrice = parseInt(document.getElementById("comp-total-techcore").textContent) || 200010;
      selectQuotationAndRoute("VND-TECHCORE", "Tech Core LTD", parsedCompPrice);
    });
  }
  if (btnSelectOfficeneed) {
    btnSelectOfficeneed.addEventListener("click", () => {
      selectQuotationAndRoute("VND-OFFICENEED", "Office Need Co.", 214800);
    });
  }

  // --- Screen 6: Render Approvals Workflows ---
  const btnApproveRfq = document.getElementById("btn-approve-rfq");
  const btnRejectRfq = document.getElementById("btn-reject-rfq");

  function renderApprovals() {
    const rfqs = window.VBState.getData("rfqs", []);
    const currentRfq = rfqs.find(r => r.id === "RFQ-2024-089");

    const step1 = document.getElementById("approval-step-1");
    const step2 = document.getElementById("approval-step-2");
    const step3 = document.getElementById("approval-step-3");
    const step4 = document.getElementById("approval-step-4");
    const stepperFill = document.getElementById("approval-stepper-fill");

    const appBtn = document.getElementById("btn-approve-rfq");
    const rejBtn = document.getElementById("btn-reject-rfq");

    if (currentRfq && currentRfq.status === "PO Generated") {
      // Completed approvals stepper layout
      if (step3) {
        step3.className = "step-node completed";
        step3.innerHTML = "✓";
        const dateL2 = document.getElementById("approval-step-3-date");
        if (dateL2) {
          dateL2.textContent = "Approved";
          dateL2.style.color = "var(--text-secondary)";
        }
      }
      
      if (step4) {
        step4.className = "step-node active";
      }
      if (stepperFill) {
        stepperFill.style.width = "100%";
      }

      if (appBtn) appBtn.disabled = true;
      if (rejBtn) rejBtn.disabled = true;
      if (appBtn) appBtn.style.opacity = "0.5";
      if (rejBtn) rejBtn.style.opacity = "0.5";
    } else {
      // Default L2 Approval Active state layout
      if (step3) {
        step3.className = "step-node active";
        step3.innerHTML = `
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        `;
        const dateL2 = document.getElementById("approval-step-3-date");
        if (dateL2) {
          dateL2.textContent = "Current Step";
          dateL2.style.color = "var(--info)";
        }
      }
      
      if (step4) {
        step4.className = "step-node";
      }
      if (stepperFill) {
        stepperFill.style.width = "50%";
      }

      if (appBtn) appBtn.disabled = false;
      if (rejBtn) rejBtn.disabled = false;
      if (appBtn) appBtn.style.opacity = "1";
      if (rejBtn) rejBtn.style.opacity = "1";
    }
  }

  function approveRFQAction() {
    const remarks = document.getElementById("approval-remarks").value.trim() || "Authorized for purchase order generation.";
    const rfqs = window.VBState.getData("rfqs", []);
    const targetR = rfqs.find(r => r.id === "RFQ-2024-089");

    if (targetR) {
      targetR.status = "PO Generated";
      window.VBState.setData("rfqs", rfqs);

      // Progresses the Purchase Order details
      const pos = window.VBState.getData("pos", []);
      const targetPo = pos.find(p => p.rfqId === "RFQ-2024-089") || pos[0];
      if (targetPo) {
        targetPo.status = "Pending Payment";
        
        // Dynamically assign PO properties based on selected vendor
        const selectedVid = targetR.selectedVendor || "VND-INFRA";
        const vendors = window.VBState.getData("vendors", []);
        const vendor = vendors.find(v => v.id === selectedVid) || vendors[0];
        targetPo.vendorId = selectedVid;
        targetPo.toOrg = vendor.name;
        targetPo.toAddress = `${vendor.address}\nVAT ID: ${vendor.gst}`;
        targetPo.total = targetR.totalValue || 185400;
        targetPo.subtotal = Math.round(targetPo.total / 1.18);
        targetPo.cgst = Math.round((targetPo.total - targetPo.subtotal) / 2);
        targetPo.sgst = targetPo.cgst;

        window.VBState.setData("pos", pos);
      }

      logActivity("Quotation Authorized", `Jessica Davis approved ${targetPo ? targetPo.toOrg : "vendor"} proposal. Remarks: "${remarks}". Dispatched PO.`);
      showToast("RFQ Authorized! Purchase Order generated successfully.");
      
      renderApprovals();
      navigateTo("po");
    }
  }

  function rejectRFQAction() {
    const remarks = document.getElementById("approval-remarks").value.trim() || "Quotation pricing exceeds allocated department budgets.";
    const rfqs = window.VBState.getData("rfqs", []);
    const targetR = rfqs.find(r => r.id === "RFQ-2024-089");

    if (targetR) {
      targetR.status = "Comparing";
      window.VBState.setData("rfqs", rfqs);

      logActivity("Quotation Rejected", `Jessica Davis rejected quotation. Remarks: "${remarks}". RFQ returned to comparative stage.`);
      showToast("Quotation rejected. Reset back to Comparative board.", "danger");
      
      renderApprovals();
      navigateTo("quotations");
    }
  }

  if (btnApproveRfq) {
    btnApproveRfq.addEventListener("click", approveRFQAction);
  }

  if (btnRejectRfq) {
    btnRejectRfq.addEventListener("click", rejectRFQAction);
  }

  // --- Screen 7: Purchase Orders (Image 5 toggles) ---
  const btnPendingPayment = document.getElementById("btn-pending-payment");
  const btnMarkPaid = document.getElementById("btn-mark-paid");

  function renderPO() {
    const pos = window.VBState.getData("pos", []);
    const po = pos.find(p => p.rfqId === "RFQ-2024-089") || pos[0];
    if (!po) return;

    // Dynamically update the PO document boxes in the DOM
    const poDocNumber = document.getElementById("po-doc-number");
    const poDocDate = document.getElementById("po-doc-date");
    const poToOrg = document.getElementById("po-to-org");
    const poToAddress = document.getElementById("po-to-address");
    const poSubtotal = document.getElementById("po-subtotal");
    const poCgst = document.getElementById("po-cgst");
    const poSgst = document.getElementById("po-sgst");
    const poGrandTotal = document.getElementById("po-grand-total");
    const poItemsTbody = document.getElementById("po-items-tbody");
    
    if (poDocNumber) poDocNumber.textContent = po.poNumber;
    if (poDocDate) poDocDate.textContent = `Created on ${po.createdAt}`;
    if (poToOrg) poToOrg.textContent = po.toOrg;
    if (poToAddress) poToAddress.innerHTML = po.toAddress.replace(/\n/g, "<br>");
    if (poSubtotal) poSubtotal.textContent = `$${po.subtotal.toLocaleString()}.00`;
    if (poCgst) poCgst.textContent = `$${po.cgst.toLocaleString()}.00`;
    if (poSgst) poSgst.textContent = `$${po.sgst.toLocaleString()}.00`;
    if (poGrandTotal) poGrandTotal.textContent = `$${po.total.toLocaleString()}.00`;

    if (poItemsTbody) {
      poItemsTbody.innerHTML = po.items.map(item => `
        <tr>
          <td>
            <span style="font-weight:600; display:block;">${item.desc}</span>
            <span style="font-size:11px; color:var(--text-muted);">${item.partNo || "NOS"}</span>
          </td>
          <td style="text-align:center;">${item.qty}</td>
          <td style="text-align:right;">$${item.price.toLocaleString()}</td>
          <td style="text-align:right; font-weight:600;">$${(item.qty * item.price).toLocaleString()}</td>
        </tr>
      `).join("");
    }

    if (po && po.status === "Paid") {
      btnPendingPayment.innerHTML = `
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        PO Fully Paid
      `;
      btnPendingPayment.style.color = "var(--success)";
      btnPendingPayment.style.borderColor = "var(--success)";
      btnPendingPayment.style.background = "rgba(16,185,129,0.05)";
      
      btnMarkPaid.disabled = true;
      btnMarkPaid.style.opacity = "0.5";
      btnMarkPaid.textContent = "Payment Recorded";
    } else {
      btnPendingPayment.innerHTML = `
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        Pending Payment
      `;
      btnPendingPayment.style.color = "var(--warning)";
      btnPendingPayment.style.borderColor = "var(--warning)";
      btnPendingPayment.style.background = "rgba(245,158,11,0.05)";
      
      btnMarkPaid.disabled = false;
      btnMarkPaid.style.opacity = "1";
      btnMarkPaid.innerHTML = `
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Mark as Paid
      `;
    }
  }

  if (btnMarkPaid) {
    btnMarkPaid.addEventListener("click", () => {
      const pos = window.VBState.getData("pos", []);
      const po = pos.find(p => p.rfqId === "RFQ-2024-089") || pos[0];
      if (po) {
        po.status = "Paid";
        window.VBState.setData("pos", pos);

        logActivity("PO Invoice Settled", `Marked invoice for ${po.poNumber} as fully settled (Paid).`);
        showToast(`Payment recorded successfully for ${po.poNumber}!`);
        
        renderPO();
      }
    });
  }

  // --- Screen 8: Invoices ---
  function renderInvoices() {
    const pos = window.VBState.getData("pos", []);
    const tbody = document.querySelector("#invoices-table tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    pos.forEach(po => {
      let statusClass = "badge-warning";
      if (po.status === "Paid") statusClass = "badge-success";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700; color:var(--sidebar-bg);">INV-${po.poNumber.split("-")[1]}</td>
        <td style="font-weight:600;">${po.poNumber}</td>
        <td>${po.toOrg}</td>
        <td style="font-weight:700; color:var(--sidebar-bg);">$${po.total.toLocaleString()}</td>
        <td><span class="status-tag ${po.status === "Paid" ? 'status-active' : 'status-pending'}">${po.status === "Paid" ? 'Paid' : 'Unpaid'}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- Screen 9: Activity Logs Timeline ---
  function renderActivityLogs() {
    const activities = window.VBState.getData("activities", []);
    const container = document.getElementById("activities-timeline");
    if (!container) return;
    container.innerHTML = "";

    activities.forEach(act => {
      const item = document.createElement("div");
      item.className = "chain-item";
      item.style.marginBottom = "24px";
      item.innerHTML = `
        <div class="chain-node" style="left:-24px; top:4px; border-color:#ffffff;"></div>
        <div class="chain-header-row">
          <span class="chain-user" style="color:#1e293b;">${act.action}</span>
          <span class="chain-time">${act.timestamp}</span>
        </div>
        <div style="font-size:11.5px; color:#475569; margin-bottom:6px;">By: ${act.user}</div>
        <p class="chain-comment-bubble" style="font-style:normal; background-color:#f8fafc; border:1px solid var(--border-color); color:#475569;">${act.details}</p>
      `;
      container.appendChild(item);
    });
  }

  // --- Event Hooks & Initialization ---
  const vendorSearch = document.getElementById("vendor-search-input");
  if (vendorSearch) {
    vendorSearch.addEventListener("input", renderVendors);
  }

  const vendorPills = document.querySelectorAll(".filter-pill");
  vendorPills.forEach(pill => {
    pill.addEventListener("click", () => {
      vendorPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      renderVendors();
    });
  });

  // --- View Vendor Modal Actions ---
  const viewVendorModal = document.getElementById("view-vendor-modal");
  
  function openViewVendorModal(vendorId) {
    const vendors = window.VBState.getData("vendors", []);
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    document.getElementById("view-vendor-name").textContent = vendor.name;
    document.getElementById("view-vendor-id").textContent = `ID: ${vendor.id}`;
    document.getElementById("view-vendor-cat").textContent = vendor.category;
    document.getElementById("view-vendor-gst-no").textContent = vendor.gst;
    document.getElementById("view-vendor-phone-no").textContent = vendor.phone || "N/A";
    document.getElementById("view-vendor-email-id").textContent = vendor.email || "N/A";
    document.getElementById("view-vendor-performance-val").textContent = `${vendor.performance || 90}%`;
    document.getElementById("view-vendor-address-details").textContent = vendor.address || "N/A";
    document.getElementById("view-vendor-avatar").textContent = vendor.name ? vendor.name.charAt(0).toUpperCase() : "V";

    const badge = document.getElementById("view-vendor-status-badge");
    if (badge) {
      badge.textContent = vendor.status;
      badge.className = "status-tag";
      const stLower = vendor.status.toLowerCase();
      if (stLower === "active" || stLower === "approved") {
        badge.classList.add("status-active");
      } else if (stLower === "pending") {
        badge.classList.add("status-pending");
      } else if (stLower === "blocked") {
        badge.classList.add("status-blocked");
      }
    }

    if (viewVendorModal) viewVendorModal.classList.add("active");
  }

  const closeViewModalBtn = document.getElementById("btn-close-view-vendor-modal");
  const closeViewBtn = document.getElementById("btn-close-view-vendor");
  if (closeViewModalBtn) {
    closeViewModalBtn.onclick = () => viewVendorModal.classList.remove("active");
  }
  if (closeViewBtn) {
    closeViewBtn.onclick = () => viewVendorModal.classList.remove("active");
  }

  // --- Add Vendor Modal Actions ---
  const btnAddVendor = document.getElementById("btn-add-vendor");
  const addVendorModal = document.getElementById("add-vendor-modal");
  const addVendorForm = document.getElementById("add-vendor-form");

  if (btnAddVendor) {
    btnAddVendor.addEventListener("click", () => {
      if (addVendorForm) addVendorForm.reset();
      if (addVendorModal) addVendorModal.classList.add("active");
    });
  }

  const btnCancelAddVendor = document.getElementById("btn-cancel-add-vendor");
  const btnCloseAddVendorModal = document.getElementById("btn-close-add-vendor-modal");

  if (btnCancelAddVendor) {
    btnCancelAddVendor.onclick = () => addVendorModal.classList.remove("active");
  }
  if (btnCloseAddVendorModal) {
    btnCloseAddVendorModal.onclick = () => addVendorModal.classList.remove("active");
  }

  if (addVendorForm) {
    addVendorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("add-vendor-name").value.trim();
      const category = document.getElementById("add-vendor-category").value.trim();
      const gst = document.getElementById("add-vendor-gst").value.trim();
      const phone = document.getElementById("add-vendor-phone").value.trim();
      const email = document.getElementById("add-vendor-email").value.trim() || `${name.toLowerCase().replace(/\s/g, "")}@vendor.com`;
      const status = document.getElementById("add-vendor-status").value;
      const address = document.getElementById("add-vendor-address").value.trim() || "New Delhi, India";

      const vendors = window.VBState.getData("vendors", []);
      const newId = "VND-" + name.substring(0, 5).toUpperCase().replace(/\s/g, "");
      
      const newVendor = {
        id: newId,
        name: name,
        category: category,
        gst: gst,
        email: email,
        phone: phone,
        rating: 4.0,
        status: status,
        performance: 90,
        address: address
      };

      vendors.push(newVendor);
      window.VBState.setData("vendors", vendors);
      
      logActivity("Vendor Added", `Registered new vendor partner: ${name} (ID: ${newId}).`);
      showToast(`Vendor ${name} added successfully!`);
      
      addVendorModal.classList.remove("active");
      renderVendors();
    });
  }

  // Hook navigation listeners
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const target = link.getAttribute("data-target");
      navigateTo(target);
    });
  });

  // Init auth check
  checkAuth();
});
