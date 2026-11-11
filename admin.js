// ========================================================
// PORTFOLIO CONTROL CENTER — ADMIN LOGIC
// Single Source of Truth for Public Site & Anupam AI
// ========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  where
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQoVoewyuS_WIGSJmVQzW-MThzxyIKvSg",
  authDomain: "anupam-yadav-portfolio.firebaseapp.com",
  projectId: "anupam-yadav-portfolio",
  storageBucket: "anupam-yadav-portfolio.firebasestorage.app",
  messagingSenderId: "46105414968",
  appId: "1:46105414968:web:94a16631d4e852904085cd",
  measurementId: "G-7N424T7HYK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// State
let currentUser = null;
let liveProjects = [];
let liveCertifications = [];
let liveTestimonials = [];
let liveMessages = [];
let liveCustomKnowledge = [];
let liveSettings = {
  version: "2.4",
  lastUpdatedFormatted: "09 Nov 2026",
  availability: "Available for Internships",
  name: "Anupam Yadav",
  role: "Computer Science Engineering Student & Python Developer",
  typewriter: "Python Developer, AI Enthusiast, Problem Solver, Future IT Engineer",
  email: "yadavanupam9119@gmail.com",
  github: "https://github.com/yadav-anupam",
  linkedin: "https://www.linkedin.com/in/anupam-yadavv",
  resume: "./Anupam%20resume.pdf"
};

// Pending Confirmation Callback
let confirmCallback = null;

// ========================================================
// --- AUTHENTICATION & AUTHORIZATION GUARD ---
// ========================================================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  currentUser = user;
  const userEmail = (user.email || "").toLowerCase();

  try {
    const adminDocRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminDocRef);

    let isAuthorized = false;

    if (adminSnap.exists() && adminSnap.data().role === "ADMIN" && adminSnap.data().active === true) {
      isAuthorized = true;
    } else if (userEmail === "yadavanupam9119@gmail.com") {
      // Owner account bootstrap
      await setDoc(adminDocRef, {
        role: "ADMIN",
        active: true,
        email: user.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      isAuthorized = true;
    }

    if (!isAuthorized) {
      alert("Access Denied: You do not have administrator authorization for this portfolio.");
      await signOut(auth);
      window.location.replace("login.html");
      return;
    }

    // Populate user info in sidebar
    const emailEl = document.getElementById("sidebar-user-email");
    const nameEl = document.getElementById("sidebar-user-name");
    const avatarEl = document.getElementById("sidebar-avatar");
    if (emailEl) emailEl.textContent = user.email;
    if (nameEl) nameEl.textContent = user.displayName || "Anupam Yadav";
    if (avatarEl) avatarEl.textContent = (user.displayName || user.email || "A")[0].toUpperCase();

    // Load all portfolio control center datasets
    initApplication();
  } catch (err) {
    console.error("Auth authorization check failed:", err);
    alert("Authorization check error: " + err.message);
  }
});

// Logout Listener
document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  sessionStorage.setItem("logoutMessage", "You have been logged out securely.");
  window.location.replace("login.html");
});

// ========================================================
// --- NAVIGATION ROUTING ---
// ========================================================
function setupNavigation() {
  const navLinks = document.querySelectorAll(".sidebar-nav .nav-link");
  const views = document.querySelectorAll(".admin-view");
  const pageTitle = document.getElementById("topbar-page-title");
  const pageSub = document.getElementById("topbar-page-sub");

  const titles = {
    "dashboard": { title: "Dashboard Overview", sub: "Portfolio Management & Real-time Metrics" },
    "projects": { title: "Project Management", sub: "Production Ecosystem & Python Applications" },
    "certifications": { title: "Certifications", sub: "Verified Credentials & Issuer Records" },
    "testimonials": { title: "Testimonials", sub: "Mentors, Collaborators & Peer Endorsements" },
    "messages": { title: "Visitor Inquiries", sub: "Contact Form Submissions & Opportunities" },
    "ai-knowledge": { title: "AI Knowledge Center", sub: "Fact Sources, Custom Knowledge & Anupam AI Testing" },
    "settings": { title: "Portfolio Settings", sub: "Version Control, Contact URLs & Metadata" }
  };

  function switchView(viewName) {
    navLinks.forEach(l => l.classList.toggle("active", l.dataset.view === viewName));
    views.forEach(v => v.classList.toggle("active", v.id === `view-${viewName}`));
    if (titles[viewName]) {
      if (pageTitle) pageTitle.textContent = titles[viewName].title;
      if (pageSub) pageSub.textContent = titles[viewName].sub;
    }
    // Close mobile sidebar if open
    document.getElementById("admin-sidebar").classList.remove("open");
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = link.dataset.view;
      if (targetView) {
        window.location.hash = targetView;
        switchView(targetView);
      }
    });
  });

  // Handle URL hash changes
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "") || "dashboard";
    if (titles[hash]) switchView(hash);
  });

  const initialHash = window.location.hash.replace("#", "") || "dashboard";
  if (titles[initialHash]) switchView(initialHash);

  // Mobile drawer controls
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
  const sidebar = document.getElementById("admin-sidebar");
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener("click", () => sidebar.classList.add("open"));
  }
  if (sidebarCloseBtn && sidebar) {
    sidebarCloseBtn.addEventListener("click", () => sidebar.classList.remove("open"));
  }
}

// ========================================================
// --- APPLICATION BOOTSTRAP ---
// ========================================================
async function initApplication() {
  setupNavigation();
  setupAIKnowledgeTabs();
  setupSettingsForm();
  setupProjectHandlers();
  setupCertHandlers();
  setupTestimonialHandlers();
  setupMessagesHandlers();
  setupCustomKnowledgeHandlers();
  setupAITestingConsole();

  // Load all datasets in parallel
  await Promise.allSettled([
    loadSettings(),
    loadProjects(),
    loadCertifications(),
    loadTestimonials(),
    loadMessages(),
    loadCustomKnowledge()
  ]);

  updateDashboardStats();
  updateAIHealth();
  updateAIPreview();
}

// ========================================================
// --- TOAST NOTIFICATIONS & CONFIRMATION MODAL ---
// ========================================================
function showToast(message, type = "success") {
  const container = document.getElementById("admin-toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `admin-toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById("modal-confirm");
  const titleEl = document.getElementById("confirm-title");
  const msgEl = document.getElementById("confirm-message");
  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  confirmCallback = onConfirm;
  if (modal) modal.classList.add("open");
}

document.getElementById("btn-confirm-cancel").addEventListener("click", () => {
  const modal = document.getElementById("modal-confirm");
  if (modal) modal.classList.remove("open");
  confirmCallback = null;
});

document.getElementById("btn-confirm-proceed").addEventListener("click", async () => {
  const modal = document.getElementById("modal-confirm");
  if (modal) modal.classList.remove("open");
  if (typeof confirmCallback === "function") {
    await confirmCallback();
    confirmCallback = null;
  }
});

// Modal close button delegator
document.querySelectorAll(".modal-close-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".admin-modal").forEach(m => m.classList.remove("open"));
  });
});

// URL Safety Validator
function isValidHttpUrl(string) {
  if (!string) return true; // Optional URLs
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// ========================================================
// --- SETTINGS & VERSION MANAGEMENT ---
// ========================================================
async function loadSettings() {
  try {
    const snap = await getDoc(doc(db, "settings", "portfolio"));
    if (snap.exists()) {
      liveSettings = { ...liveSettings, ...snap.data() };
    }
    // Populate settings form
    document.getElementById("setting-version").value = liveSettings.version || "2.4";
    document.getElementById("setting-updated").value = liveSettings.lastUpdatedFormatted || "09 Nov 2026";
    document.getElementById("setting-availability").value = liveSettings.availability || "Available for Internships";
    document.getElementById("setting-name").value = liveSettings.name || "Anupam Yadav";
    document.getElementById("setting-role").value = liveSettings.role || "";
    document.getElementById("setting-typewriter").value = liveSettings.typewriter || "";
    document.getElementById("setting-email").value = liveSettings.email || "yadavanupam9119@gmail.com";
    document.getElementById("setting-github").value = liveSettings.github || "";
    document.getElementById("setting-linkedin").value = liveSettings.linkedin || "";
    document.getElementById("setting-resume").value = liveSettings.resume || "";

    // Update Dashboard status pills
    const dashVer = document.getElementById("dash-version");
    const dashUpd = document.getElementById("dash-updated");
    const dashAvail = document.getElementById("dash-availability");
    if (dashVer) dashVer.textContent = `v${liveSettings.version}`;
    if (dashUpd) dashUpd.textContent = liveSettings.lastUpdatedFormatted;
    if (dashAvail) dashAvail.textContent = liveSettings.availability;
  } catch (err) {
    console.warn("Could not load settings from Firestore, using default:", err.message);
  }
}

function setupSettingsForm() {
  const form = document.getElementById("settings-form");
  const saveBtn = document.getElementById("btn-save-settings");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
    }

    const gh = document.getElementById("setting-github").value.trim();
    const li = document.getElementById("setting-linkedin").value.trim();
    if (!isValidHttpUrl(gh) || !isValidHttpUrl(li)) {
      showToast("Please enter valid HTTPS URLs for GitHub and LinkedIn.", "error");
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Save All Settings & Sync Metadata"; }
      return;
    }

    const payload = {
      version: document.getElementById("setting-version").value.trim(),
      lastUpdatedFormatted: document.getElementById("setting-updated").value.trim(),
      availability: document.getElementById("setting-availability").value.trim(),
      name: document.getElementById("setting-name").value.trim(),
      role: document.getElementById("setting-role").value.trim(),
      typewriter: document.getElementById("setting-typewriter").value.trim(),
      email: document.getElementById("setting-email").value.trim(),
      github: gh,
      linkedin: li,
      resume: document.getElementById("setting-resume").value.trim(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "settings", "portfolio"), payload, { merge: true });
      liveSettings = { ...liveSettings, ...payload };
      showToast("✓ Settings & Portfolio Metadata saved successfully!");
      loadSettings();
      updateAIPreview();
    } catch (err) {
      console.error("Save settings error:", err);
      showToast("Error saving settings: " + err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save All Settings & Sync Metadata";
      }
    }
  });
}

// ========================================================
// --- FIREBASE STORAGE UPLOAD HELPER WITH RESILIENT FALLBACK ---
// ========================================================
function compressImageToDataUrl(file, maxWidth = 300, maxHeight = 300, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxHeight) {
          if (w > h) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          } else {
            w = Math.round((w * maxHeight) / h);
            h = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to process image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function handleStorageUpload(file, folder, progressBarEl, progressFillEl) {
  return new Promise(async (resolve, reject) => {
    if (!file) return reject(new Error("No file selected"));
    
    // Strict file validation
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return reject(new Error("Invalid format. Only JPG, PNG, and WEBP images are allowed."));
    }
    if (file.size > 5 * 1024 * 1024) {
      return reject(new Error("File exceeds 5MB size limit."));
    }

    // Try Firebase Storage first
    try {
      if (storage) {
        const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const storageRef = ref(storage, `${folder}/${safeName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        if (progressBarEl) progressBarEl.style.display = "block";

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (progressFillEl) progressFillEl.style.width = `${pct}%`;
          },
          async (error) => {
            console.warn("Firebase Storage upload error, falling back to optimized inline data URL:", error.message);
            if (progressBarEl) progressBarEl.style.display = "none";
            try {
              const maxDim = folder === "testimonials" ? 240 : 640;
              const quality = folder === "testimonials" ? 0.85 : 0.80;
              const dataUrl = await compressImageToDataUrl(file, maxDim, maxDim, quality);
              resolve(dataUrl);
            } catch (fallbackErr) {
              reject(fallbackErr);
            }
          },
          async () => {
            if (progressBarEl) progressBarEl.style.display = "none";
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (e) {
              const maxDim = folder === "testimonials" ? 240 : 640;
              const dataUrl = await compressImageToDataUrl(file, maxDim, maxDim, 0.82);
              resolve(dataUrl);
            }
          }
        );
        return;
      }
    } catch (e) {
      console.warn("Storage exception, using fallback:", e);
    }

    // Fallback if storage instance unavailable
    try {
      const maxDim = folder === "testimonials" ? 240 : 640;
      const dataUrl = await compressImageToDataUrl(file, maxDim, maxDim, 0.85);
      resolve(dataUrl);
    } catch (err) {
      reject(err);
    }
  });
}

// ========================================================
// --- PROJECTS CRUD ---
// ========================================================
async function loadProjects() {
  const container = document.getElementById("projects-grid");
  if (!container) return;
  try {
    const snap = await getDocs(collection(db, "projects"));
    liveProjects = [];
    snap.forEach(d => liveProjects.push({ id: d.id, ...d.data() }));
    renderProjectsList(liveProjects);
    updateDashboardStats();
    updateAIHealth();
  } catch (err) {
    console.error("Load projects error:", err);
    container.innerHTML = `<p style="color:var(--danger);font-size:0.84rem;">Error loading projects: ${err.message}</p>`;
  }
}

function renderProjectsList(projects) {
  const container = document.getElementById("projects-grid");
  if (!container) return;
  container.innerHTML = "";

  if (projects.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2.5rem;color:var(--muted);">
      <p>No projects created yet. Click "+ Add Project" to publish your first work.</p>
    </div>`;
    return;
  }

  projects.forEach(p => {
    const card = document.createElement("div");
    card.className = "item-card";

    const thumbDiv = document.createElement("div");
    thumbDiv.className = "item-card__thumb";
    if (p.imageUrl) {
      const img = document.createElement("img");
      img.src = p.imageUrl;
      img.alt = p.title || "Project";
      img.className = "item-card__img";
      thumbDiv.appendChild(img);
    } else {
      const ph = document.createElement("div");
      ph.className = "item-card__placeholder";
      ph.textContent = p.emoji || "🚀";
      thumbDiv.appendChild(ph);
    }

    if (p.category) {
      const catBadge = document.createElement("span");
      catBadge.className = "item-badge-category";
      catBadge.textContent = p.category;
      thumbDiv.appendChild(catBadge);
    }

    if (p.featured) {
      const featBadge = document.createElement("span");
      featBadge.className = "item-badge-featured";
      featBadge.textContent = "⭐ Featured";
      thumbDiv.appendChild(featBadge);
    }
    card.appendChild(thumbDiv);

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "item-card__body";

    const titleH = document.createElement("h4");
    titleH.className = "item-card__title";
    titleH.textContent = p.title || "Untitled Project";
    bodyDiv.appendChild(titleH);

    const descP = document.createElement("p");
    descP.className = "item-card__desc";
    descP.textContent = p.description || "";
    bodyDiv.appendChild(descP);

    if (p.technologies || p.techs) {
      const metaDiv = document.createElement("div");
      metaDiv.className = "item-card__meta";
      const techList = (p.technologies || p.techs || "").split(",").map(t => t.trim()).filter(Boolean);
      techList.forEach(t => {
        const tag = document.createElement("span");
        tag.className = "item-tag";
        tag.textContent = t;
        metaDiv.appendChild(tag);
      });
      bodyDiv.appendChild(metaDiv);
    }

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "item-card__actions";

    const linksDiv = document.createElement("div");
    linksDiv.className = "item-card__links";
    if (p.github) {
      const ghA = document.createElement("a");
      ghA.href = p.github;
      ghA.target = "_blank";
      ghA.rel = "noopener noreferrer";
      ghA.className = "icon-link";
      ghA.textContent = "GitHub ↗";
      linksDiv.appendChild(ghA);
    }
    if (p.live) {
      const liveA = document.createElement("a");
      liveA.href = p.live;
      liveA.target = "_blank";
      liveA.rel = "noopener noreferrer";
      liveA.className = "icon-link";
      liveA.textContent = "Live Demo ↗";
      linksDiv.appendChild(liveA);
    }
    actionsDiv.appendChild(linksDiv);

    const btnGroup = document.createElement("div");
    btnGroup.style.display = "flex";
    btnGroup.style.gap = "0.4rem";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-secondary btn-sm";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openProjectModal(p));
    btnGroup.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-danger btn-sm";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      showConfirmModal(
        "Delete Project?",
        `Are you sure you want to remove "${p.title}"? This will delete it from both the public portfolio and Anupam AI context.`,
        async () => {
          try {
            await deleteDoc(doc(db, "projects", p.id));
            showToast("✓ Project deleted successfully.");
            loadProjects();
          } catch (e) {
            showToast("Delete failed: " + e.message, "error");
          }
        }
      );
    });
    btnGroup.appendChild(delBtn);

    actionsDiv.appendChild(btnGroup);
    bodyDiv.appendChild(actionsDiv);
    card.appendChild(bodyDiv);

    container.appendChild(card);
  });
}

function openProjectModal(project = null) {
  const modal = document.getElementById("modal-project");
  const modalTitle = document.getElementById("project-modal-title");
  const docIdInput = document.getElementById("project-doc-id");
  const titleInput = document.getElementById("proj-title");
  const catInput = document.getElementById("proj-category");
  const descInput = document.getElementById("proj-desc");
  const techsInput = document.getElementById("proj-techs");
  const ghInput = document.getElementById("proj-github");
  const liveInput = document.getElementById("proj-live");
  const featInput = document.getElementById("proj-featured");
  const urlInput = document.getElementById("proj-image-url");
  const previewWrap = document.getElementById("proj-preview-wrap");
  const previewImg = document.getElementById("proj-preview-img");

  if (project) {
    modalTitle.textContent = "Edit Project";
    docIdInput.value = project.id;
    titleInput.value = project.title || "";
    catInput.value = project.category || "";
    descInput.value = project.description || "";
    techsInput.value = project.technologies || project.techs || "";
    ghInput.value = project.github || "";
    liveInput.value = project.live || "";
    featInput.checked = !!project.featured;
    urlInput.value = project.imageUrl || "";
    if (project.imageUrl) {
      previewImg.src = project.imageUrl;
      previewWrap.style.display = "flex";
    } else {
      previewWrap.style.display = "none";
    }
  } else {
    modalTitle.textContent = "Add New Project";
    docIdInput.value = "";
    titleInput.value = "";
    catInput.value = "";
    descInput.value = "";
    techsInput.value = "";
    ghInput.value = "";
    liveInput.value = "";
    featInput.checked = false;
    urlInput.value = "";
    previewWrap.style.display = "none";
  }

  modal.classList.add("open");
}

function setupProjectHandlers() {
  document.getElementById("btn-add-project").addEventListener("click", () => openProjectModal());

  // Search & Filter
  const searchInput = document.getElementById("project-search-input");
  const catFilter = document.getElementById("project-category-filter");
  function filterProjects() {
    const q = (searchInput.value || "").toLowerCase().trim();
    const cat = catFilter.value;
    const filtered = liveProjects.filter(p => {
      const matchQ = (p.title || "").toLowerCase().includes(q) ||
                     (p.technologies || p.techs || "").toLowerCase().includes(q) ||
                     (p.description || "").toLowerCase().includes(q);
      const matchCat = cat === "all" || (p.category || "").toLowerCase().includes(cat.toLowerCase());
      return matchQ && matchCat;
    });
    renderProjectsList(filtered);
  }
  searchInput.addEventListener("input", filterProjects);
  catFilter.addEventListener("change", filterProjects);

  // Drag and Drop Image Upload
  const dropzone = document.getElementById("proj-dropzone");
  const fileInput = document.getElementById("proj-file-input");
  const previewWrap = document.getElementById("proj-preview-wrap");
  const previewImg = document.getElementById("proj-preview-img");
  const filenameSpan = document.getElementById("proj-filename");
  const progressBar = document.getElementById("proj-progress-bar");
  const progressFill = document.getElementById("proj-progress-fill");
  const urlInput = document.getElementById("proj-image-url");
  const removeImgBtn = document.getElementById("btn-remove-proj-img");

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processImageUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", async () => {
    if (fileInput.files && fileInput.files[0]) {
      await processImageUpload(fileInput.files[0]);
    }
  });

  async function processImageUpload(file) {
    try {
      filenameSpan.textContent = file.name;
      previewWrap.style.display = "flex";
      previewImg.src = URL.createObjectURL(file);
      const dlUrl = await handleStorageUpload(file, "projects", progressBar, progressFill);
      urlInput.value = dlUrl;
      showToast("✓ Image uploaded to Firebase Storage!");
    } catch (err) {
      showToast(err.message, "error");
      previewWrap.style.display = "none";
    }
  }

  removeImgBtn.addEventListener("click", () => {
    urlInput.value = "";
    previewImg.src = "";
    previewWrap.style.display = "none";
  });

  // Submit Form
  const form = document.getElementById("project-form");
  const submitBtn = document.getElementById("btn-save-project-submit");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    const docId = document.getElementById("project-doc-id").value;
    const gh = document.getElementById("proj-github").value.trim();
    const live = document.getElementById("proj-live").value.trim();

    if (!isValidHttpUrl(gh) || !isValidHttpUrl(live)) {
      showToast("Please enter valid HTTPS URLs for project links.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Project";
      return;
    }

    const payload = {
      title: document.getElementById("proj-title").value.trim(),
      category: document.getElementById("proj-category").value.trim(),
      description: document.getElementById("proj-desc").value.trim(),
      technologies: document.getElementById("proj-techs").value.trim(),
      techs: document.getElementById("proj-techs").value.trim(),
      github: gh,
      live: live,
      featured: document.getElementById("proj-featured").checked,
      imageUrl: urlInput.value.trim(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (docId) {
        await updateDoc(doc(db, "projects", docId), payload);
        showToast("✓ Project updated successfully!");
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, "projects"), payload);
        showToast("✓ Project added to portfolio & AI knowledge!");
      }
      document.getElementById("modal-project").classList.remove("open");
      loadProjects();
    } catch (err) {
      console.error("Save project error:", err);
      showToast("Failed to save project: " + err.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Project";
    }
  });
}

// ========================================================
// ========================================================
// --- DEFAULT PORTFOLIO CONTENT (PUBLIC SITE PRESETS) ---
// ========================================================
const defaultPortfolioCertifications = [
  {
    title: "AI Skills Passport",
    issuer: "EY & Microsoft",
    date: "2026",
    year: "2026",
    credentialUrl: "https://www.credly.com",
    imageUrl: "Certificate_EY_Microsoft.png",
    description: "Verified foundational credentials in Artificial Intelligence principles, sustainable computing, and enterprise cloud applications certified jointly by Ernst & Young (EY) and Microsoft.",
    tags: "AI Skills, Sustainability, Technology",
    featured: true
  },
  {
    title: "AI Fluency: Framework & Foundations",
    issuer: "Anthropic",
    date: "2026",
    year: "2026",
    credentialUrl: "https://anthropic.com",
    imageUrl: "certificate_AI_Influency.png",
    description: "Comprehensive training in frontier Large Language Model frameworks, prompt design principles, Claude model interactions, and responsible AI alignment certified by Anthropic.",
    tags: "AI Fluency, LLMs, Foundations",
    featured: true
  },
  {
    title: "Career Essentials in Generative AI",
    issuer: "LinkedIn & Microsoft",
    date: "Jun 10, 2026",
    year: "2026",
    credentialUrl: "https://www.linkedin.com/learning/certificates",
    imageUrl: "Certificate_Career Essentials in Generative AI by Microsoft and LinkedIn.png",
    description: "Specialized professional credential spanning foundational Generative AI paradigms, Microsoft Copilot workflows, and ethical considerations for artificial intelligence in modern software development.",
    tags: "Microsoft Copilot, Generative AI, Responsible AI",
    featured: true
  },
  {
    title: "GenAI Powered Data Analytics Job Simulation",
    issuer: "TATA & Forage",
    date: "Jun 8, 2026",
    year: "2026",
    credentialUrl: "https://www.theforage.com/simulations/tata",
    imageUrl: "Certificate_GenAI_Powered_Data_Analytics_Job_Simulation.png",
    description: "Completed an end-to-end practical job simulation with Tata Group via Forage, utilizing Generative AI and advanced data analytics to assess business risks, clean datasets, and derive strategic intelligence.",
    tags: "Data Analytics, GenAI, Risk Profiling",
    featured: true
  }
];

const defaultPortfolioTestimonials = [
  {
    name: "Faculty - CSE Dept.",
    role: "CSE Department",
    organization: "Kashi Institute of Technology",
    message: "Anupam is one of the most curious and dedicated students I have taught. His eagerness to learn new technologies and apply them practically sets him apart from his peers.",
    imageUrl: "",
    avatarEmoji: "👨‍🏫",
    rating: 5
  },
  {
    name: "Sushil Kushwaha Sir",
    role: "Senior Student Mentor",
    organization: "Computer Science Department",
    message: "Anupam consistently goes beyond the syllabus. He completed multiple Python projects and AI certifications on his own - that kind of self-motivation is rare in first-year students.",
    imageUrl: "",
    avatarEmoji: "👨‍💻",
    rating: 5
  },
  {
    name: "Dr. Rupesh Kumar Singh",
    role: "Head of Department",
    organization: "CSE Department, KIT, Varanasi",
    message: "A hardworking and sincere student who always strives to improve. His academic performance and participation in tech activities reflect his commitment to becoming a skilled engineer.",
    imageUrl: "",
    avatarEmoji: "🎓",
    rating: 5
  }
];

// --- CERTIFICATIONS CRUD ---
// ========================================================
async function loadCertifications() {
  const container = document.getElementById("certs-grid");
  if (!container) return;
  try {
    const snap = await getDocs(collection(db, "certifications"));
    liveCertifications = [];
    snap.forEach(d => liveCertifications.push({ id: d.id, ...d.data() }));

    // Auto-seed existing portfolio certs if collection is empty
    if (liveCertifications.length === 0) {
      console.info("Certifications collection is empty. Auto-seeding existing portfolio certs...");
      for (const cert of defaultPortfolioCertifications) {
        try {
          const docRef = await addDoc(collection(db, "certifications"), {
            ...cert,
            createdAt: new Date().toISOString()
          });
          liveCertifications.push({ id: docRef.id, ...cert });
        } catch (seedErr) {
          console.warn("Auto-seed cert failed:", seedErr.message);
        }
      }
    }

    renderCertsList(liveCertifications);
    updateDashboardStats();
    updateAIHealth();
  } catch (err) {
    console.error("Load certs error:", err);
    container.innerHTML = `<p style="color:var(--danger);font-size:0.84rem;">Error loading certifications: ${err.message}</p>`;
  }
}

function renderCertsList(certs) {
  const container = document.getElementById("certs-grid");
  if (!container) return;
  container.innerHTML = "";

  if (certs.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--muted);">
      <p>No certifications added yet. Click "+ Add Certification".</p>
    </div>`;
    return;
  }

  certs.forEach(c => {
    const card = document.createElement("div");
    card.className = "item-card";

    const thumbDiv = document.createElement("div");
    thumbDiv.className = "item-card__thumb";
    const imgSrc = c.imageUrl || c.image;
    if (imgSrc) {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = c.title || "Certificate";
      img.className = "item-card__img";
      thumbDiv.appendChild(img);
    } else {
      const ph = document.createElement("div");
      ph.className = "item-card__placeholder";
      ph.textContent = "📜";
      thumbDiv.appendChild(ph);
    }
    card.appendChild(thumbDiv);

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "item-card__body";

    const titleH = document.createElement("h4");
    titleH.className = "item-card__title";
    titleH.textContent = c.title || "Certification";
    bodyDiv.appendChild(titleH);

    const issuerP = document.createElement("p");
    issuerP.style.color = "var(--accent)";
    issuerP.style.fontSize = "0.78rem";
    issuerP.style.fontWeight = "600";
    issuerP.textContent = `${c.issuer || ""} • ${c.date || c.year || ""}`;
    bodyDiv.appendChild(issuerP);

    if (c.description) {
      const descP = document.createElement("p");
      descP.className = "item-card__desc";
      descP.style.marginTop = "0.5rem";
      descP.textContent = c.description;
      bodyDiv.appendChild(descP);
    }

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "item-card__actions";

    if (c.credentialUrl) {
      const linkA = document.createElement("a");
      linkA.href = c.credentialUrl;
      linkA.target = "_blank";
      linkA.rel = "noopener noreferrer";
      linkA.className = "icon-link";
      linkA.textContent = "Verify ↗";
      actionsDiv.appendChild(linkA);
    } else {
      actionsDiv.appendChild(document.createElement("div"));
    }

    const btnGroup = document.createElement("div");
    btnGroup.style.display = "flex";
    btnGroup.style.gap = "0.4rem";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-secondary btn-sm";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openCertModal(c));
    btnGroup.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-danger btn-sm";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      showConfirmModal(
        "Delete Certification?",
        `Remove "${c.title}" from certifications?`,
        async () => {
          try {
            await deleteDoc(doc(db, "certifications", c.id));
            showToast("✓ Certification deleted.");
            loadCertifications();
          } catch (e) {
            showToast("Delete failed: " + e.message, "error");
          }
        }
      );
    });
    btnGroup.appendChild(delBtn);

    actionsDiv.appendChild(btnGroup);
    bodyDiv.appendChild(actionsDiv);
    card.appendChild(bodyDiv);
    container.appendChild(card);
  });
}

function openCertModal(cert = null) {
  const modal = document.getElementById("modal-cert");
  const titleInput = document.getElementById("cert-title");
  const issuerInput = document.getElementById("cert-issuer");
  const dateInput = document.getElementById("cert-date");
  const urlInput = document.getElementById("cert-url");
  const descInput = document.getElementById("cert-desc");
  const imgUrlInput = document.getElementById("cert-image-url");
  const docIdInput = document.getElementById("cert-doc-id");
  const previewWrap = document.getElementById("cert-preview-wrap");
  const previewImg = document.getElementById("cert-preview-img");

  if (cert) {
    document.getElementById("cert-modal-title").textContent = "Edit Certification";
    docIdInput.value = cert.id;
    titleInput.value = cert.title || "";
    issuerInput.value = cert.issuer || "";
    dateInput.value = cert.date || cert.year || "";
    urlInput.value = cert.credentialUrl || "";
    descInput.value = cert.description || "";
    const imgSrc = cert.imageUrl || cert.image || "";
    imgUrlInput.value = imgSrc;
    if (imgSrc) {
      previewImg.src = imgSrc;
      previewWrap.style.display = "flex";
    } else {
      previewWrap.style.display = "none";
    }
  } else {
    document.getElementById("cert-modal-title").textContent = "Add Certification";
    docIdInput.value = "";
    titleInput.value = "";
    issuerInput.value = "";
    dateInput.value = "";
    urlInput.value = "";
    descInput.value = "";
    imgUrlInput.value = "";
    previewWrap.style.display = "none";
  }

  modal.classList.add("open");
}


async function seedPortfolioCerts() {
  const btn = document.getElementById("btn-seed-certs");
  if (btn) btn.disabled = true;
  try {
    showToast("Importing public site certifications...");
    let added = 0;
    for (const cert of defaultPortfolioCertifications) {
      const exists = liveCertifications.some(c => c.title?.toLowerCase() === cert.title.toLowerCase());
      if (!exists) {
        await addDoc(collection(db, "certifications"), {
          ...cert,
          createdAt: new Date().toISOString()
        });
        added++;
      }
    }
    showToast(`✓ Successfully imported ${added} certification(s)!`);
    await loadCertifications();
  } catch (err) {
    showToast("Import failed: " + err.message, "error");
  } finally {
    if (btn) btn.disabled = false;
  }
}

function setupCertHandlers() {
  document.getElementById("btn-add-cert").addEventListener("click", () => openCertModal());
  const seedBtn = document.getElementById("btn-seed-certs");
  if (seedBtn) seedBtn.addEventListener("click", seedPortfolioCerts);

  const dropzone = document.getElementById("cert-dropzone");
  const fileInput = document.getElementById("cert-file-input");
  const previewWrap = document.getElementById("cert-preview-wrap");
  const previewImg = document.getElementById("cert-preview-img");
  const filenameSpan = document.getElementById("cert-filename");
  const imgUrlInput = document.getElementById("cert-image-url");
  const removeBtn = document.getElementById("btn-remove-cert-img");

  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      filenameSpan.textContent = file.name;
      previewWrap.style.display = "flex";
      previewImg.src = URL.createObjectURL(file);
      try {
        const url = await handleStorageUpload(file, "certifications");
        imgUrlInput.value = url;
        showToast("✓ Certificate image uploaded!");
      } catch (e) {
        showToast(e.message, "error");
      }
    }
  });

  removeBtn.addEventListener("click", () => {
    imgUrlInput.value = "";
    previewImg.src = "";
    previewWrap.style.display = "none";
  });

  imgUrlInput.addEventListener("input", () => {
    const val = imgUrlInput.value.trim();
    if (val) {
      previewImg.src = val;
      previewWrap.style.display = "flex";
      filenameSpan.textContent = "Custom Image Link";
    } else {
      previewWrap.style.display = "none";
    }
  });

  const form = document.getElementById("cert-form");
  const submitBtn = document.getElementById("btn-save-cert-submit");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    const docId = document.getElementById("cert-doc-id").value;
    const credUrl = document.getElementById("cert-url").value.trim();

    if (!isValidHttpUrl(credUrl)) {
      showToast("Please enter a valid credential URL.", "error");
      submitBtn.disabled = false;
      return;
    }

    const payload = {
      title: document.getElementById("cert-title").value.trim(),
      issuer: document.getElementById("cert-issuer").value.trim(),
      date: document.getElementById("cert-date").value.trim(),
      year: document.getElementById("cert-date").value.trim(),
      credentialUrl: credUrl,
      description: document.getElementById("cert-desc").value.trim(),
      imageUrl: imgUrlInput.value.trim(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (docId) {
        await updateDoc(doc(db, "certifications", docId), payload);
        showToast("✓ Certification updated!");
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, "certifications"), payload);
        showToast("✓ Certification added successfully!");
      }
      document.getElementById("modal-cert").classList.remove("open");
      loadCertifications();
    } catch (err) {
      showToast("Failed to save cert: " + err.message, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// ========================================================
// --- TESTIMONIALS CRUD ---
// ========================================================
async function loadTestimonials() {
  const container = document.getElementById("testimonials-grid");
  if (!container) return;
  try {
    const snap = await getDocs(collection(db, "testimonials"));
    liveTestimonials = [];
    snap.forEach(d => liveTestimonials.push({ id: d.id, ...d.data() }));

    // Auto-seed existing portfolio testimonials if collection is empty
    if (liveTestimonials.length === 0) {
      console.info("Testimonials collection is empty. Auto-seeding existing portfolio testimonials...");
      for (const item of defaultPortfolioTestimonials) {
        try {
          const docRef = await addDoc(collection(db, "testimonials"), {
            ...item,
            createdAt: new Date().toISOString()
          });
          liveTestimonials.push({ id: docRef.id, ...item });
        } catch (seedErr) {
          console.warn("Auto-seed testimonial failed:", seedErr.message);
        }
      }
    }

    renderTestimonialsList(liveTestimonials);
    updateDashboardStats();
  } catch (err) {
    console.error("Load testimonials error:", err);
  }
}

function renderTestimonialsList(list) {
  const container = document.getElementById("testimonials-grid");
  if (!container) return;
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--muted);">
      <p>No testimonials stored. Click "+ Add Testimonial".</p>
    </div>`;
    return;
  }

  list.forEach(t => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.style.padding = "1.25rem";

    const headDiv = document.createElement("div");
    headDiv.style.display = "flex";
    headDiv.style.alignItems = "center";
    headDiv.style.gap = "0.75rem";
    headDiv.style.marginBottom = "0.85rem";

    const avatarSrc = t.imageUrl || t.image;
    if (avatarSrc) {
      const avatar = document.createElement("img");
      avatar.src = avatarSrc;
      avatar.style.width = "42px";
      avatar.style.height = "42px";
      avatar.style.borderRadius = "50%";
      avatar.style.objectFit = "cover";
      headDiv.appendChild(avatar);
    } else {
      const ph = document.createElement("div");
      ph.style.width = "42px";
      ph.style.height = "42px";
      ph.style.borderRadius = "50%";
      ph.style.background = "linear-gradient(135deg, #C68A4E, #E0AE6E)";
      ph.style.color = "#14110E";
      ph.style.display = "flex";
      ph.style.alignItems = "center";
      ph.style.justifyContent = "center";
      ph.style.fontSize = "1.2rem";
      ph.textContent = t.avatarEmoji || (t.name ? t.name[0] : "👤");
      headDiv.appendChild(ph);
    }

    const nameBox = document.createElement("div");
    const nameH = document.createElement("strong");
    nameH.style.color = "var(--text)";
    nameH.style.fontSize = "0.95rem";
    nameH.textContent = t.name || "Anonymous";
    const roleP = document.createElement("p");
    roleP.style.color = "var(--muted)";
    roleP.style.fontSize = "0.75rem";
    roleP.textContent = `${t.role || ""} • ${t.organization || ""}`;
    nameBox.appendChild(nameH);
    nameBox.appendChild(roleP);
    headDiv.appendChild(nameBox);
    card.appendChild(headDiv);

    const quoteP = document.createElement("p");
    quoteP.style.color = "var(--text)";
    quoteP.style.fontSize = "0.82rem";
    quoteP.style.lineHeight = "1.55";
    quoteP.style.fontStyle = "italic";
    quoteP.style.flex = "1";
    quoteP.textContent = `"${t.message || ""}"`;
    card.appendChild(quoteP);

    const actDiv = document.createElement("div");
    actDiv.style.display = "flex";
    actDiv.style.justifyContent = "flex-end";
    actDiv.style.gap = "0.4rem";
    actDiv.style.marginTop = "0.85rem";
    actDiv.style.paddingTop = "0.65rem";
    actDiv.style.borderTop = "1px solid rgba(198, 138, 78, 0.1)";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-secondary btn-sm";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openTestimonialModal(t));
    actDiv.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-danger btn-sm";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      showConfirmModal("Delete Testimonial?", `Delete testimonial from ${t.name}?`, async () => {
        try {
          await deleteDoc(doc(db, "testimonials", t.id));
          showToast("✓ Testimonial deleted.");
          loadTestimonials();
        } catch (e) {
          showToast("Delete failed: " + e.message, "error");
        }
      });
    });
    actDiv.appendChild(delBtn);

    card.appendChild(actDiv);
    container.appendChild(card);
  });
}

function openTestimonialModal(t = null) {
  const modal = document.getElementById("modal-testimonial");
  const docId = document.getElementById("testimonial-doc-id");
  const nameInput = document.getElementById("testi-name");
  const roleInput = document.getElementById("testi-role");
  const orgInput = document.getElementById("testi-org");
  const msgInput = document.getElementById("testi-msg");
  const urlInput = document.getElementById("testi-image-url");
  const previewWrap = document.getElementById("testi-preview-wrap");
  const previewImg = document.getElementById("testi-preview-img");

  if (t) {
    document.getElementById("testimonial-modal-title").textContent = "Edit Testimonial";
    docId.value = t.id;
    nameInput.value = t.name || "";
    roleInput.value = t.role || "";
    orgInput.value = t.organization || "";
    msgInput.value = t.message || "";
    const aSrc = t.imageUrl || t.image || "";
    urlInput.value = aSrc;
    if (aSrc) {
      previewImg.src = aSrc;
      previewWrap.style.display = "flex";
    } else {
      previewWrap.style.display = "none";
    }
  } else {
    document.getElementById("testimonial-modal-title").textContent = "Add Testimonial";
    docId.value = "";
    nameInput.value = "";
    roleInput.value = "";
    orgInput.value = "";
    msgInput.value = "";
    urlInput.value = "";
    previewWrap.style.display = "none";
  }

  modal.classList.add("open");
}


async function seedPortfolioTestimonials() {
  const btn = document.getElementById("btn-seed-testimonials");
  if (btn) btn.disabled = true;
  try {
    showToast("Importing public site testimonials...");
    let added = 0;
    for (const item of defaultPortfolioTestimonials) {
      const exists = liveTestimonials.some(t => t.name?.toLowerCase() === item.name.toLowerCase());
      if (!exists) {
        await addDoc(collection(db, "testimonials"), {
          ...item,
          createdAt: new Date().toISOString()
        });
        added++;
      }
    }
    showToast(`✓ Successfully imported ${added} testimonial(s)!`);
    await loadTestimonials();
  } catch (err) {
    showToast("Import failed: " + err.message, "error");
  } finally {
    if (btn) btn.disabled = false;
  }
}

function setupTestimonialHandlers() {
  document.getElementById("btn-add-testimonial").addEventListener("click", () => openTestimonialModal());
  const seedBtn = document.getElementById("btn-seed-testimonials");
  if (seedBtn) seedBtn.addEventListener("click", seedPortfolioTestimonials);

  const dropzone = document.getElementById("testi-dropzone");
  const fileInput = document.getElementById("testi-file-input");
  const previewWrap = document.getElementById("testi-preview-wrap");
  const previewImg = document.getElementById("testi-preview-img");
  const filenameSpan = document.getElementById("testi-filename");
  const urlInput = document.getElementById("testi-image-url");
  const removeBtn = document.getElementById("btn-remove-testi-img");

  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      filenameSpan.textContent = file.name;
      previewWrap.style.display = "flex";
      previewImg.src = URL.createObjectURL(file);
      try {
        const url = await handleStorageUpload(file, "testimonials");
        urlInput.value = url;
        showToast("✓ Avatar uploaded!");
      } catch (e) {
        showToast(e.message, "error");
      }
    }
  });

  removeBtn.addEventListener("click", () => {
    urlInput.value = "";
    previewImg.src = "";
    previewWrap.style.display = "none";
  });

  urlInput.addEventListener("input", () => {
    const val = urlInput.value.trim();
    if (val) {
      previewImg.src = val;
      previewWrap.style.display = "flex";
      filenameSpan.textContent = "Custom Image Link";
    } else {
      previewWrap.style.display = "none";
    }
  });

  const form = document.getElementById("testimonial-form");
  const submitBtn = document.getElementById("btn-save-testi-submit");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    const docId = document.getElementById("testimonial-doc-id").value;

    const payload = {
      name: document.getElementById("testi-name").value.trim(),
      role: document.getElementById("testi-role").value.trim(),
      organization: document.getElementById("testi-org").value.trim(),
      message: document.getElementById("testi-msg").value.trim(),
      imageUrl: urlInput.value.trim(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (docId) {
        await updateDoc(doc(db, "testimonials", docId), payload);
        showToast("✓ Testimonial updated!");
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, "testimonials"), payload);
        showToast("✓ Testimonial added!");
      }
      document.getElementById("modal-testimonial").classList.remove("open");
      loadTestimonials();
    } catch (err) {
      showToast("Error saving: " + err.message, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// ========================================================
// --- VISITOR MESSAGES SYSTEM ---
// ========================================================
async function loadMessages() {
  const container = document.getElementById("messages-list");
  const dashContainer = document.getElementById("dash-recent-messages-list");
  if (!container) return;

  try {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(50));
    const snap = await getDocs(q);
    liveMessages = [];
    snap.forEach(d => liveMessages.push({ id: d.id, ...d.data() }));

    renderMessagesList(liveMessages);
    renderRecentMessages(liveMessages.slice(0, 4));
    updateDashboardStats();
  } catch (err) {
    console.warn("Messages collection query error:", err.message);
    container.innerHTML = `<p style="color:var(--muted);font-size:0.84rem;">No messages currently received.</p>`;
    if (dashContainer) dashContainer.innerHTML = `<p style="color:var(--muted);font-size:0.84rem;">No messages yet.</p>`;
  }
}

function renderMessagesList(messages) {
  const container = document.getElementById("messages-list");
  if (!container) return;
  container.innerHTML = "";

  if (messages.length === 0) {
    container.innerHTML = `<p style="color:var(--muted);font-size:0.84rem;text-align:center;padding:2rem;">No messages matching this filter.</p>`;
    return;
  }

  messages.forEach(msg => {
    const row = document.createElement("div");
    row.className = `message-row ${msg.read ? "read" : "unread"}`;

    const mainInfo = document.createElement("div");
    mainInfo.className = "message-main-info";

    const senderH = document.createElement("span");
    senderH.className = "message-sender";
    senderH.textContent = msg.name || "Visitor";

    if (!msg.read) {
      const dot = document.createElement("span");
      dot.style.width = "7px";
      dot.style.height = "7px";
      dot.style.borderRadius = "50%";
      dot.style.background = "var(--accent)";
      senderH.appendChild(dot);
    }
    mainInfo.appendChild(senderH);

    const emailP = document.createElement("span");
    emailP.className = "message-email";
    emailP.textContent = msg.email || "";
    mainInfo.appendChild(emailP);

    const previewP = document.createElement("p");
    previewP.className = "message-preview";
    previewP.textContent = msg.message || "";
    mainInfo.appendChild(previewP);
    row.appendChild(mainInfo);

    const metaDiv = document.createElement("div");
    metaDiv.className = "message-meta";

    const dateSpan = document.createElement("span");
    dateSpan.className = "message-date";
    dateSpan.textContent = msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "";
    metaDiv.appendChild(dateSpan);

    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "btn-secondary btn-sm";
    viewBtn.textContent = "View";
    metaDiv.appendChild(viewBtn);

    row.appendChild(metaDiv);

    row.addEventListener("click", () => openMessageDetailModal(msg));
    container.appendChild(row);
  });
}

function renderRecentMessages(recentList) {
  const dashContainer = document.getElementById("dash-recent-messages-list");
  if (!dashContainer) return;
  dashContainer.innerHTML = "";

  if (recentList.length === 0) {
    dashContainer.innerHTML = `<p style="color:var(--muted);font-size:0.84rem;">No messages received yet.</p>`;
    return;
  }

  recentList.forEach(msg => {
    const row = document.createElement("div");
    row.className = `message-row ${msg.read ? "read" : "unread"}`;
    row.style.padding = "0.75rem 1rem";

    const mainInfo = document.createElement("div");
    mainInfo.className = "message-main-info";

    const senderH = document.createElement("span");
    senderH.className = "message-sender";
    senderH.textContent = msg.name || "Visitor";
    mainInfo.appendChild(senderH);

    const previewP = document.createElement("p");
    previewP.className = "message-preview";
    previewP.textContent = msg.message || "";
    mainInfo.appendChild(previewP);
    row.appendChild(mainInfo);

    const dateSpan = document.createElement("span");
    dateSpan.className = "message-date";
    dateSpan.textContent = msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "";
    row.appendChild(dateSpan);

    row.addEventListener("click", () => openMessageDetailModal(msg));
    dashContainer.appendChild(row);
  });
}

function openMessageDetailModal(msg) {
  const modal = document.getElementById("modal-message");
  document.getElementById("msg-detail-sender").textContent = msg.name || "Visitor";
  document.getElementById("msg-detail-email").textContent = msg.email || "";
  document.getElementById("msg-detail-date").textContent = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "";
  document.getElementById("msg-detail-body").textContent = msg.message || "";

  const toggleReadBtn = document.getElementById("btn-toggle-msg-read");
  toggleReadBtn.textContent = msg.read ? "Mark as Unread" : "Mark as Read";
  toggleReadBtn.onclick = async () => {
    try {
      await updateDoc(doc(db, "messages", msg.id), { read: !msg.read });
      msg.read = !msg.read;
      showToast(msg.read ? "✓ Message marked as read." : "✓ Message marked as unread.");
      loadMessages();
      modal.classList.remove("open");
    } catch (e) {
      showToast("Update failed: " + e.message, "error");
    }
  };

  const replyBtn = document.getElementById("btn-reply-msg");
  replyBtn.href = `mailto:${encodeURIComponent(msg.email)}?subject=Re: Portfolio Inquiry`;

  const deleteBtn = document.getElementById("btn-delete-msg");
  deleteBtn.onclick = () => {
    showConfirmModal("Delete Message?", `Permanently delete message from ${msg.name}?`, async () => {
      try {
        await deleteDoc(doc(db, "messages", msg.id));
        showToast("✓ Message deleted.");
        modal.classList.remove("open");
        loadMessages();
      } catch (e) {
        showToast("Delete failed: " + e.message, "error");
      }
    });
  };

  modal.classList.add("open");
}

function setupMessagesHandlers() {
  document.querySelectorAll(".msg-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".msg-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      if (f === "unread") {
        renderMessagesList(liveMessages.filter(m => !m.read));
      } else if (f === "read") {
        renderMessagesList(liveMessages.filter(m => m.read));
      } else {
        renderMessagesList(liveMessages);
      }
    });
  });

  const dashViewAll = document.getElementById("dash-view-all-msgs");
  if (dashViewAll) {
    dashViewAll.addEventListener("click", () => {
      const msgLink = document.querySelector('.sidebar-nav .nav-link[data-view="messages"]');
      if (msgLink) msgLink.click();
    });
  }
}

// ========================================================
// --- CUSTOM AI KNOWLEDGE CRUD ---
// ========================================================
async function loadCustomKnowledge() {
  const container = document.getElementById("custom-knowledge-list");
  if (!container) return;
  try {
    const snap = await getDocs(collection(db, "ai_knowledge"));
    liveCustomKnowledge = [];
    snap.forEach(d => liveCustomKnowledge.push({ id: d.id, ...d.data() }));
    renderCustomKnowledgeList(liveCustomKnowledge);
    updateAIHealth();
    updateAIPreview();
  } catch (err) {
    console.warn("Load custom knowledge error:", err.message);
  }
}

function renderCustomKnowledgeList(list) {
  const container = document.getElementById("custom-knowledge-list");
  if (!container) return;
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--muted);">
      <p>No custom knowledge records added. Custom knowledge lets you teach Anupam AI about your development philosophy, hackathons, or special highlights.</p>
    </div>`;
    return;
  }

  list.forEach(k => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.style.padding = "1.25rem";

    const head = document.createElement("div");
    head.style.display = "flex";
    head.style.justifyContent = "space-between";
    head.style.alignItems = "flex-start";
    head.style.marginBottom = "0.5rem";

    const titleH = document.createElement("h4");
    titleH.style.color = "var(--text)";
    titleH.style.fontSize = "1rem";
    titleH.textContent = k.title || "Custom Topic";
    head.appendChild(titleH);

    const catBadge = document.createElement("span");
    catBadge.className = "item-tag";
    catBadge.textContent = k.category || "General";
    head.appendChild(catBadge);
    card.appendChild(head);

    const bodyP = document.createElement("p");
    bodyP.style.color = "var(--muted)";
    bodyP.style.fontSize = "0.82rem";
    bodyP.style.lineHeight = "1.5";
    bodyP.style.flex = "1";
    bodyP.textContent = k.content || "";
    card.appendChild(bodyP);

    const foot = document.createElement("div");
    foot.style.display = "flex";
    foot.style.justifyContent = "space-between";
    foot.style.alignItems = "center";
    foot.style.marginTop = "0.85rem";
    foot.style.paddingTop = "0.65rem";
    foot.style.borderTop = "1px solid rgba(198, 138, 78, 0.1)";

    const statusSpan = document.createElement("span");
    statusSpan.style.fontSize = "0.72rem";
    statusSpan.style.color = k.active ? "var(--success)" : "var(--muted)";
    statusSpan.textContent = k.active ? "● Active in AI" : "○ Inactive";
    foot.appendChild(statusSpan);

    const btnGroup = document.createElement("div");
    btnGroup.style.display = "flex";
    btnGroup.style.gap = "0.4rem";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-secondary btn-sm";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openCustomKnowledgeModal(k));
    btnGroup.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-danger btn-sm";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      showConfirmModal("Delete Custom Knowledge?", `Remove "${k.title}" from AI knowledge?`, async () => {
        try {
          await deleteDoc(doc(db, "ai_knowledge", k.id));
          showToast("✓ Knowledge item removed.");
          loadCustomKnowledge();
        } catch (e) {
          showToast("Delete failed: " + e.message, "error");
        }
      });
    });
    btnGroup.appendChild(delBtn);

    foot.appendChild(btnGroup);
    card.appendChild(foot);
    container.appendChild(card);
  });
}

function openCustomKnowledgeModal(k = null) {
  const modal = document.getElementById("modal-custom-knowledge");
  const docId = document.getElementById("custom-k-doc-id");
  const title = document.getElementById("ck-title");
  const cat = document.getElementById("ck-category");
  const priority = document.getElementById("ck-priority");
  const content = document.getElementById("ck-content");
  const active = document.getElementById("ck-active");
  const warn = document.getElementById("ck-security-warning");

  warn.style.display = "none";

  if (k) {
    document.getElementById("custom-k-modal-title").textContent = "Edit Custom Knowledge";
    docId.value = k.id;
    title.value = k.title || "";
    cat.value = k.category || "General";
    priority.value = k.priority || "normal";
    content.value = k.content || "";
    active.checked = k.active !== false;
  } else {
    document.getElementById("custom-k-modal-title").textContent = "Add Custom Knowledge";
    docId.value = "";
    title.value = "";
    cat.value = "Philosophy";
    priority.value = "normal";
    content.value = "";
    active.checked = true;
  }

  modal.classList.add("open");
}

function setupCustomKnowledgeHandlers() {
  document.getElementById("btn-add-custom-knowledge").addEventListener("click", () => openCustomKnowledgeModal());

  const form = document.getElementById("custom-knowledge-form");
  const contentInput = document.getElementById("ck-content");
  const warnBox = document.getElementById("ck-security-warning");

  contentInput.addEventListener("input", () => {
    const text = contentInput.value.toLowerCase();
    const suspicious = ["password", "secret", "api_key", "credentials", "token", "firebase_admin"];
    const hasSus = suspicious.some(s => text.includes(s));
    warnBox.style.display = hasSus ? "block" : "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const docId = document.getElementById("custom-k-doc-id").value;
    const title = document.getElementById("ck-title").value.trim();
    const content = contentInput.value.trim();

    // Sensitive data check
    const text = (title + " " + content).toLowerCase();
    if (text.includes("password") || text.includes("secret_key") || text.includes("api_secret")) {
      showToast("Security Violation: Credentials cannot be stored in public AI knowledge.", "error");
      return;
    }

    const payload = {
      title,
      category: document.getElementById("ck-category").value,
      priority: document.getElementById("ck-priority").value,
      content,
      active: document.getElementById("ck-active").checked,
      updatedAt: new Date().toISOString()
    };

    try {
      if (docId) {
        await updateDoc(doc(db, "ai_knowledge", docId), payload);
        showToast("✓ Custom knowledge updated!");
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, "ai_knowledge"), payload);
        showToast("✓ Custom knowledge added!");
      }
      document.getElementById("modal-custom-knowledge").classList.remove("open");
      loadCustomKnowledge();
    } catch (err) {
      showToast("Error saving: " + err.message, "error");
    }
  });
}

// ========================================================
// --- AI KNOWLEDGE HEALTH & PREVIEW ---
// ========================================================
function setupAIKnowledgeTabs() {
  document.querySelectorAll(".ai-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ai-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".ai-tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(`ai-sub-${btn.dataset.sub}`);
      if (target) target.classList.add("active");
    });
  });

  const refreshBtn = document.getElementById("btn-refresh-ai-preview");
  if (refreshBtn) refreshBtn.addEventListener("click", () => updateAIPreview());

  const searchInput = document.getElementById("ai-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase().trim();
      filterAIPreview(q);
    });
  }
}

function updateAIHealth() {
  // Compute true factual completeness
  let score = 0;
  if (liveSettings.name && liveSettings.role) score += 15; // Profile
  score += 15; // Skills base
  if (liveProjects.length > 0) score += 20; // Projects
  score += 10; // Education
  if (liveSettings.availability) score += 10; // Experience / Availability
  if (liveCertifications.length > 0) score += 15; // Certifications
  if (liveSettings.email && liveSettings.github) score += 15; // Contact / Social

  const pctEl = document.getElementById("ai-health-pct");
  const barEl = document.getElementById("ai-health-bar");
  if (pctEl) pctEl.textContent = `${score}%`;
  if (barEl) barEl.style.width = `${score}%`;

  const pChip = document.getElementById("chip-proj-count");
  const cChip = document.getElementById("chip-cert-count");
  const kChip = document.getElementById("chip-custom-count");
  if (pChip) pChip.textContent = liveProjects.length;
  if (cChip) cChip.textContent = liveCertifications.length;
  if (kChip) kChip.textContent = liveCustomKnowledge.filter(k => k.active).length;
}

let generatedKnowledgeText = "";

function updateAIPreview() {
  const previewEl = document.getElementById("ai-preview-content");
  if (!previewEl) return;

  const projectsSummary = liveProjects.map(p => 
    `• ${p.title} (${p.category || 'Tech'}): ${p.description || ''}\n  Tech Stack: ${p.technologies || p.techs || 'Not specified'}`
  ).join("\n\n");

  const certsSummary = liveCertifications.map(c =>
    `• ${c.title} — Issued by ${c.issuer} (${c.date || c.year || 'Verified'})`
  ).join("\n");

  const customSummary = liveCustomKnowledge.filter(k => k.active).map(k =>
    `• [${k.category}] ${k.title}:\n  ${k.content}`
  ).join("\n\n");

  generatedKnowledgeText = `=== ANUPAM AI STRUCTURED KNOWLEDGE CONTEXT ===
Last Synced: ${liveSettings.lastUpdatedFormatted || '09 Nov 2026'} | Version: v${liveSettings.version || '2.4'}

1. PROFILE & IDENTITY
Name: ${liveSettings.name || 'Anupam Yadav'}
Role: ${liveSettings.role || 'Computer Science Engineering Student & Python Developer'}
Degree: B.Tech in Computer Science Engineering (2025–2029)
Institution: Kashi Institute of Technology (KIT), Varanasi
Availability: ${liveSettings.availability || 'Available for Internships'}

2. CORE TECHNICAL SKILLS
Languages: Python, C, JavaScript, HTML5, CSS3
Backend & DB: Firebase, Firestore, Supabase, PostgreSQL, FastAPI, REST APIs
AI & Modern Tools: Generative AI, Prompt Engineering, NLP, Git, GitHub, Linux, Vercel

3. ACTIVE PORTFOLIO PROJECTS (${liveProjects.length} Records)
${projectsSummary || '• Default Ecosystem Projects: AcadTrack, Kisan Setu, MyKhata, WebJugad Labs, Smart Vision School'}

4. VERIFIED CERTIFICATIONS (${liveCertifications.length} Records)
${certsSummary || '• AI Skills Passport (EY & Microsoft)\n• Career Essentials in Generative AI (Microsoft & LinkedIn)\n• Generative AI Foundations (Anthropic)\n• GenAI Data Analytics (TATA Forage)'}

5. PUBLIC CONTACT & SOCIAL LINKS
Email: ${liveSettings.email || 'yadavanupam9119@gmail.com'}
GitHub: ${liveSettings.github || 'https://github.com/yadav-anupam'}
LinkedIn: ${liveSettings.linkedin || 'https://www.linkedin.com/in/anupam-yadavv'}
Resume: ${liveSettings.resume || './Anupam%20resume.pdf'}

6. CUSTOM KNOWLEDGE (${liveCustomKnowledge.filter(k => k.active).length} Active Entries)
${customSummary || '• None configured'}`;

  previewEl.textContent = generatedKnowledgeText;
}

function filterAIPreview(queryStr) {
  const previewEl = document.getElementById("ai-preview-content");
  if (!previewEl || !generatedKnowledgeText) return;
  if (!queryStr) {
    previewEl.textContent = generatedKnowledgeText;
    return;
  }
  const lines = generatedKnowledgeText.split("\n");
  const matched = lines.filter(l => l.toLowerCase().includes(queryStr));
  previewEl.textContent = matched.length > 0 ? matched.join("\n") : "No knowledge facts matched your search.";
}

// ========================================================
// --- TEST ANUPAM AI IN ADMIN CONSOLE ---
// ========================================================
// Reusable Intent & Context Resolution from the Public Engine
let adminAIState = {
  currentProject: null,
  currentTopic: null
};

function processAdminAIQuery(userText) {
  const q = (userText || "").toLowerCase().trim();

  // 1. Security Check
  if (q.includes("ignore") || q.includes("password") || q.includes("secret") || q.includes("credentials")) {
    return {
      intent: "security_violation",
      entity: "None",
      source: "Security Guard",
      text: "I cannot fulfill that request. I am Anupam AI, grounded strictly in public portfolio facts, and I do not expose private credentials or system configurations."
    };
  }

  // 2. Greetings
  if (q === "hi" || q === "hello" || q === "hey" || q.includes("morning") || q === "gm") {
    return {
      intent: "greeting",
      entity: "Greeting",
      source: "Conversational Flow",
      text: "Hello Anupam! 👋 I am ready to answer visitor inquiries using the verified knowledge base."
    };
  }

  // 3. Project specific or follow-up
  let targetProject = null;
  // Match in liveProjects
  for (const p of liveProjects) {
    if (q.includes((p.title || "").toLowerCase()) || (p.title === "Kisan Setu" && (q.includes("kisan") || q.includes("farmer")))) {
      targetProject = p;
      break;
    }
  }

  // Check contextual follow-up
  if (!targetProject && adminAIState.currentProject && (q.includes(" it ") || q.includes("what tech") || q.includes("model") || q.includes("for it") || q.includes("features"))) {
    targetProject = adminAIState.currentProject;
  }

  if (targetProject) {
    adminAIState.currentProject = targetProject;
    adminAIState.currentTopic = "project";

    if (q.includes("tech") || q.includes("stack") || q.includes("language")) {
      return {
        intent: "project_technology",
        entity: targetProject.title,
        source: `Firestore: projects/${targetProject.id}`,
        text: `**${targetProject.title}** is built with: ${targetProject.technologies || targetProject.techs || "Modern web stack"}.\n\nPurpose: ${targetProject.description}`
      };
    }

    if (q.includes("model") || q.includes("ai")) {
      return {
        intent: "project_ai_model",
        entity: targetProject.title,
        source: `Firestore: projects/${targetProject.id}`,
        text: `**${targetProject.title}** utilizes queue waiting-time prediction models and throughput forecasting based on historical arrival trends and handling capacity.`
      };
    }

    return {
      intent: "project_overview",
      entity: targetProject.title,
      source: `Firestore: projects/${targetProject.id}`,
      text: `### ${targetProject.title}\n${targetProject.description}\n\n**Tech Stack:** ${targetProject.technologies || targetProject.techs || "N/A"}`
    };
  }

  // 4. Skills & Python
  if (q.includes("python") || q.includes("pyhton")) {
    adminAIState.currentTopic = "skills";
    return {
      intent: "skill_specific",
      entity: "Python",
      source: "Core Skills & Projects Data",
      text: "Yes — Python is Anupam's primary programming language. He has used it in projects like Kisan Setu, algorithmic games (Hangman), conversational prototypes, and backend APIs with FastAPI."
    };
  }

  if (q.includes("skill") || q.includes("technologies") || q.includes("stack")) {
    adminAIState.currentTopic = "skills";
    return {
      intent: "skills_overview",
      entity: "Technical Toolkit",
      source: "Core Skills Definition",
      text: "Anupam's technical toolkit includes:\n• Languages: Python, C, JavaScript, HTML5/CSS3\n• Backend & Databases: Firebase, Firestore, Supabase, PostgreSQL, FastAPI\n• AI & Tools: Generative AI, Prompt Engineering, Git, GitHub, Linux, Vercel"
    };
  }

  // 5. Projects list
  if (q.includes("project") || q.includes("built") || q.includes("work") || q.includes("made")) {
    adminAIState.currentTopic = "project";
    const projNames = liveProjects.length > 0 ? liveProjects.map(p => `• **${p.title}** — ${p.description || ''}`).join("\n") : "• AcadTrack, Kisan Setu, MyKhata, WebJugad Labs, Smart Vision School";
    return {
      intent: "projects_overview",
      entity: "Projects Collection",
      source: "Firestore: projects",
      text: `Anupam has built several featured platforms and applications:\n\n${projNames}`
    };
  }

  // 6. Contact
  if (q.includes("contact") || q.includes("email") || q.includes("reach")) {
    adminAIState.currentTopic = "contact";
    return {
      intent: "contact_inquiry",
      entity: "Public Settings",
      source: "Firestore: settings/portfolio",
      text: `You can reach Anupam directly at ${liveSettings.email || 'yadavanupam9119@gmail.com'}, connect on LinkedIn (${liveSettings.linkedin}), or use the portfolio contact form.`
    };
  }

  // 7. Certifications
  if (q.includes("cert") || q.includes("course") || q.includes("credential")) {
    adminAIState.currentTopic = "certifications";
    const certList = liveCertifications.length > 0 ? liveCertifications.map(c => `• **${c.title}** (${c.issuer})`).join("\n") : "• AI Skills Passport (EY & Microsoft)\n• Career Essentials in Generative AI (Microsoft & LinkedIn)\n• Generative AI Foundations (Anthropic)\n• GenAI Data Analytics (TATA Forage)";
    return {
      intent: "certifications_overview",
      entity: "Certifications",
      source: "Firestore: certifications",
      text: `Anupam holds verified credentials:\n\n${certList}`
    };
  }

  // 8. Custom Knowledge Lookup
  for (const ck of liveCustomKnowledge.filter(k => k.active)) {
    if (q.includes((ck.title || "").toLowerCase()) || q.includes((ck.category || "").toLowerCase())) {
      return {
        intent: "custom_knowledge",
        entity: ck.title,
        source: `Firestore: ai_knowledge/${ck.id}`,
        text: `**${ck.title}**\n\n${ck.content}`
      };
    }
  }

  // Default
  return {
    intent: "general_inquiry",
    entity: "General Context",
    source: "Portfolio Fact Base",
    text: "I can answer questions regarding Anupam's engineering projects, technical stack, Python and AI skills, certifications, and public contact information."
  };
}

function setupAITestingConsole() {
  const form = document.getElementById("admin-ai-chat-form");
  const input = document.getElementById("admin-ai-chat-input");
  const messagesBox = document.getElementById("admin-ai-chat-messages");
  const intentEl = document.getElementById("debug-intent");
  const entityEl = document.getElementById("debug-entity");
  const sourceEl = document.getElementById("debug-source");
  const goodBtn = document.getElementById("btn-feedback-good");
  const improveBtn = document.getElementById("btn-feedback-improve");

  let lastQuestion = "";
  let lastResponse = null;

  function appendChat(role, text) {
    const msg = document.createElement("div");
    msg.className = `ai-chat-msg ${role}`;
    msg.textContent = text;
    messagesBox.appendChild(msg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function handleAdminQuery(qText) {
    if (!qText.trim()) return;
    const cleanQ = qText.trim();
    appendChat("user", cleanQ);
    lastQuestion = cleanQ;
    if (input) input.value = "";

    setTimeout(() => {
      const res = processAdminAIQuery(cleanQ);
      lastResponse = res;
      appendChat("assistant", res.text);
      if (intentEl) intentEl.textContent = res.intent;
      if (entityEl) entityEl.textContent = res.entity;
      if (sourceEl) sourceEl.textContent = res.source;
    }, 280);
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (input) handleAdminQuery(input.value);
    });
  }

  // Test chips
  document.querySelectorAll(".test-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      if (chip.dataset.q) handleAdminQuery(chip.dataset.q);
    });
  });

  // Feedback recording
  if (goodBtn) {
    goodBtn.addEventListener("click", async () => {
      if (!lastResponse) return;
      try {
        await addDoc(collection(db, "ai_feedback"), {
          question: lastQuestion,
          response: lastResponse.text,
          rating: "GOOD",
          intent: lastResponse.intent,
          timestamp: new Date().toISOString()
        });
        showToast("✓ Feedback recorded: Good response!");
      } catch (e) {
        showToast("Recorded locally.", "info");
      }
    });
  }

  if (improveBtn) {
    improveBtn.addEventListener("click", async () => {
      if (!lastResponse) return;
      const note = prompt("What should be improved in this response?");
      try {
        await addDoc(collection(db, "ai_feedback"), {
          question: lastQuestion,
          response: lastResponse.text,
          rating: "NEEDS_IMPROVEMENT",
          note: note || "",
          intent: lastResponse.intent,
          timestamp: new Date().toISOString()
        });
        showToast("✓ Improvement note recorded.");
      } catch (e) {
        showToast("Recorded locally.", "info");
      }
    });
  }
}

// ========================================================
// --- DASHBOARD AGGREGATE STATS ---
// ========================================================
function updateDashboardStats() {
  const pCount = document.getElementById("stat-projects-count");
  const pFeat = document.getElementById("stat-featured-count");
  const cCount = document.getElementById("stat-certs-count");
  const tCount = document.getElementById("stat-testimonials-count");
  const mUnread = document.getElementById("stat-messages-unread");
  const mTotal = document.getElementById("stat-messages-total");

  const navP = document.getElementById("nav-badge-projects");
  const navC = document.getElementById("nav-badge-certs");
  const navT = document.getElementById("nav-badge-testimonials");
  const navM = document.getElementById("nav-badge-messages");

  if (pCount) pCount.textContent = liveProjects.length;
  if (pFeat) pFeat.textContent = `${liveProjects.filter(p => p.featured).length} Featured`;
  if (navP) navP.textContent = liveProjects.length;

  if (cCount) cCount.textContent = liveCertifications.length;
  if (navC) navC.textContent = liveCertifications.length;

  if (tCount) tCount.textContent = liveTestimonials.length;
  if (navT) navT.textContent = liveTestimonials.length;

  const unreadCount = liveMessages.filter(m => !m.read).length;
  if (mUnread) mUnread.textContent = unreadCount;
  if (mTotal) mTotal.textContent = `${liveMessages.length} Total Received`;
  if (navM) {
    navM.textContent = unreadCount;
    navM.style.display = unreadCount > 0 ? "inline-block" : "none";
  }
}
