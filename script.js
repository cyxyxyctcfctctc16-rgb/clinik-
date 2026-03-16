/* ==================== DATA MANAGEMENT ==================== */
/**
 * Clinic Appointment Management System
 * Handles appointments, queue numbers, and admin panel functionality
 */

// Admin credentials (in production, handle securely on backend)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Get appointments from localStorage
function getAppointments() {
    const data = localStorage.getItem('clinic_appointments');
    return data ? JSON.parse(data) : [];
}

// Save appointment to localStorage
function saveAppointment(appointment) {
    const appointments = getAppointments();
    appointment.id = Date.now();
    appointment.queueNumber = generateQueueNumber();
    appointment.dateCreated = new Date().toLocaleDateString('uz-UZ');
    appointments.push(appointment);
    localStorage.setItem('clinic_appointments', JSON.stringify(appointments));
    return appointment;
}

// Generate queue number based on daily appointments
function generateQueueNumber() {
    const today = new Date().toDateString();
    const appointments = getAppointments();
    const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate).toDateString();
        return aptDate === today;
    });
    return todayAppointments.length + 1;
}

// Delete appointment
function deleteAppointment(id) {
    let appointments = getAppointments();
    appointments = appointments.filter(apt => apt.id !== id);
    localStorage.setItem('clinic_appointments', JSON.stringify(appointments));
}

/* ==================== APPOINTMENT FORM ==================== */
document.getElementById('appointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form data
    const appointment = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        doctor: document.getElementById('doctor').value,
        appointmentDate: document.getElementById('appointmentDate').value,
        appointmentTime: document.getElementById('appointmentTime').value,
        symptoms: document.getElementById('symptoms').value.trim()
    };

    // Save appointment
    const savedAppointment = saveAppointment(appointment);

    // Show queue display
    showQueueDisplay(savedAppointment);

    // Log appointment
    console.log('Qabul band qilindi:', savedAppointment);
});

// Show queue number display
function showQueueDisplay(appointment) {
    const form = document.getElementById('appointmentForm');
    const queueDisplay = document.getElementById('queueDisplay');

    form.style.display = 'none';
    queueDisplay.style.display = 'block';

    // Update queue display content
    document.getElementById('queueNumber').textContent = appointment.queueNumber;
    document.getElementById('queueDetails').innerHTML = `
        <p><strong>${appointment.firstName} ${appointment.lastName}</strong></p>
        <p>Doktor: <strong>${appointment.doctor}</strong></p>
        <p>Sana: <strong>${formatDate(appointment.appointmentDate)}</strong></p>
        <p>Vaqt: <strong>${appointment.appointmentTime}</strong></p>
        <p style="margin-top: 15px; font-size: 0.9rem; opacity: 0.9;">Iltimos, o'z navbatingizda kelishingizni unutmang!</p>
    `;
}

// Reset appointment form
function resetForm() {
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentForm').style.display = 'block';
    document.getElementById('queueDisplay').style.display = 'none';
}

// Format date to Uzbek format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('uz-UZ', options);
}

/* ==================== CONTACT FORM ==================== */
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    // In production, send to backend
    console.log('Xabar yuborildi:', { name, email, message });

    alert(`Rahmat, ${name}! Sizning xabaringiz qabul qilindi. Tez orada siz bilan bog'lanamiz.`);
    this.reset();
});

/* ==================== ADMIN PANEL ==================== */
// Open admin login modal
document.getElementById('adminLoginBtn').addEventListener('click', function() {
    document.getElementById('adminModal').style.display = 'flex';
});

// Close admin modal
function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
    document.getElementById('adminLoginForm').reset();
    const errorMsg = document.getElementById('loginError');
    if (errorMsg) errorMsg.style.display = 'none';
}

// Admin login
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const errorMsg = document.getElementById('loginError');

    // Verify credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Login successful
        localStorage.setItem('adminLoggedIn', 'true');
        closeAdminModal();
        showAdminPanel();
        loadAdminData();
    } else {
        // Login failed
        errorMsg.textContent = 'Noto\'g\'ri foydalanuvchi nomi yoki parol!';
        errorMsg.style.display = 'block';
    }
});

// Show admin panel
function showAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Hide admin panel
function hideAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('adminLoggedIn');
    hideAdminPanel();
    alert('Admin panelidean chiqtingiz.');
});

/* ==================== ADMIN TAB NAVIGATION ==================== */
const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
const adminTabContents = document.querySelectorAll('.admin-tab-content');

adminTabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        // Remove active class from all buttons and contents
        adminTabBtns.forEach(b => b.classList.remove('active'));
        adminTabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        this.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');

        // Load data for the tab
        if (tabName === 'statistics') {
            loadStatistics();
        }
    });
});

/* ==================== LOAD ADMIN DATA ==================== */
function loadAdminData() {
    loadAppointmentsTable();
    loadStatistics();
}

// Load appointments table
function loadAppointmentsTable() {
    const appointments = getAppointments();
    const tableBody = document.getElementById('appointmentsTable');

    if (appointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 30px; color: #999;">Hozircha qabul qilish qaydlari yo\'q</td></tr>';
        return;
    }

    // Sort by queue number
    appointments.sort((a, b) => b.id - a.id);

    tableBody.innerHTML = appointments.map(apt => `
        <tr>
            <td><strong>#${apt.queueNumber}</strong></td>
            <td>${apt.firstName}</td>
            <td>${apt.lastName}</td>
            <td>${apt.phone}</td>
            <td>${apt.doctor}</td>
            <td>${formatDate(apt.appointmentDate)}</td>
            <td>${apt.appointmentTime}</td>
            <td>${apt.symptoms.substring(0, 30)}...</td>
            <td>
                <button class="delete-btn" onclick="deleteAppointmentAdmin(${apt.id})">O'chirish</button>
            </td>
        </tr>
    `).join('');
}

// Delete appointment from admin panel
function deleteAppointmentAdmin(id) {
    if (confirm('Haqiqatdan ham bu qabul qilishni o\'chirasizmi?')) {
        deleteAppointment(id);
        loadAppointmentsTable();
        loadStatistics();
    }
}

// Load statistics
function loadStatistics() {
    const appointments = getAppointments();

    // Total appointments
    document.getElementById('totalAppointments').textContent = appointments.length;

    // Today's appointments
    const today = new Date().toDateString();
    const todayCount = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate).toDateString();
        return aptDate === today;
    }).length;
    document.getElementById('todayAppointments').textContent = todayCount;

    // This week's appointments
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekCount = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= weekStart && aptDate <= weekEnd;
    }).length;
    document.getElementById('weekAppointments').textContent = weekCount;

    // Most popular doctor
    const doctorCounts = {};
    appointments.forEach(apt => {
        doctorCounts[apt.doctor] = (doctorCounts[apt.doctor] || 0) + 1;
    });

    const mostPopular = Object.keys(doctorCounts).length > 0
        ? Object.entries(doctorCounts).sort((a, b) => b[1] - a[1])[0][0]
        : '-';
    document.getElementById('popularDoctor').textContent = mostPopular;

    // Doctor statistics chart
    loadDoctorStats(doctorCounts);
}

// Load doctor statistics
function loadDoctorStats(doctorCounts) {
    const doctorStatsDiv = document.getElementById('doctorStats');

    if (Object.keys(doctorCounts).length === 0) {
        doctorStatsDiv.innerHTML = '<p style="color: #999;">Hozircha ma\'lumot yo\'q</p>';
        return;
    }

    const maxCount = Math.max(...Object.values(doctorCounts));

    doctorStatsDiv.innerHTML = Object.entries(doctorCounts).map(([doctor, count]) => {
        const percentage = (count / maxCount) * 100;
        return `
            <div class="doctor-stat-item">
                <span>${doctor}</span>
                <div class="doctor-stat-bar" style="max-width: 200px;">
                    <div class="doctor-stat-fill" style="width: ${percentage}%"></div>
                </div>
                <span style="margin-left: 10px; font-weight: 600;">${count}</span>
            </div>
        `;
    }).join('');
}

/* ==================== MOBILE MENU TOGGLE ==================== */
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('active');
});

// Close mobile menu when link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        navLinks.classList.remove('active');
    });
});

/* ==================== SMOOTH SCROLL ==================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

/* ==================== FORM VALIDATION ==================== */
// Set minimum date to today for appointment date
document.getElementById('appointmentDate').addEventListener('load', setMinDate);
setMinDate();

function setMinDate() {
    const dateInput = document.getElementById('appointmentDate');
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    dateInput.min = minDate;
}

/* ==================== INITIALIZATION ==================== */
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in as admin
    if (localStorage.getItem('adminLoggedIn')) {
        showAdminPanel();
        loadAdminData();
    }
});

/* ==================== CLOSE MODALS ON ESCAPE KEY ==================== */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const adminModal = document.getElementById('adminModal');
        if (adminModal.style.display === 'flex') {
            closeAdminModal();
        }
    }
});

/* ==================== CLOSE MODAL ON BACKGROUND CLICK ==================== */
document.getElementById('adminModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAdminModal();
    }
});