// Global Variables
let selectedTimeSlot = null;
let selectedDoctor = null;
let uploadedFiles = [];

// Navigation Functions
function navigateTo(page) {
    window.location.href = page;
}

// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Initialize page-specific functionality
    initializePage();
});

function initializePage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'doctor-timing.html':
            initializeDoctorTiming();
            break;
        case 'prescription-upload.html':
            initializePrescriptionUpload();
            break;
        case 'chat-system.html':
            initializeChatSystem();
            break;
        default:
            // Dashboard page
            initializeDashboard();
    }
}

// Dashboard Functions
function initializeDashboard() {
    // Add any dashboard-specific initialization here
    console.log('Dashboard initialized');
    
    /*
    MYSQL INTEGRATION POINT:
    - Load user dashboard data
    - Query: SELECT * FROM user_dashboard WHERE user_id = ?
    - Display recent activities, upcoming appointments, etc.
    */
}

// Doctor Timing Functions
function initializeDoctorTiming() {
    // Set default date to today
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.value = 'today';
    }
    
    loadDoctorSchedules();
}

function loadDoctorSchedules() {
    /*
    MYSQL INTEGRATION POINT:
    - Query doctor schedules from database
    - Query: SELECT d.*, ds.* FROM doctors d 
             JOIN doctor_schedules ds ON d.doctor_id = ds.doctor_id 
             WHERE ds.date >= CURDATE() AND ds.available = 1
    - Update UI with real data
    */
    console.log('Loading doctor schedules...');
}

function selectTimeSlot(slot) {
    // Remove previous selection
    document.querySelectorAll('.time-slot.selected').forEach(s => {
        s.classList.remove('selected');
    });
    
    // Add selection to clicked slot
    slot.classList.add('selected');
    selectedTimeSlot = slot.textContent;
}

function filterDoctors() {
    const departmentFilter = document.getElementById('departmentFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const doctorCards = document.querySelectorAll('.doctor-card');
    
    /*
    MYSQL INTEGRATION POINT:
    - Filter doctors based on selected criteria
    - Query: SELECT * FROM doctors d 
             JOIN doctor_schedules ds ON d.doctor_id = ds.doctor_id
             WHERE (? = '' OR d.department = ?) 
             AND ds.date = ? AND ds.available = 1
    */
    
    doctorCards.forEach(card => {
        const department = card.getAttribute('data-department');
        let show = true;
        
        if (departmentFilter && department !== departmentFilter) {
            show = false;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
    
    console.log(`Filtering by department: ${departmentFilter}, date: ${dateFilter}`);
}

function bookAppointment(doctorName) {
    selectedDoctor = doctorName;
    
    if (!selectedTimeSlot) {
        alert('Please select a time slot first');
        return;
    }
    
    document.getElementById('selectedDoctor').textContent = doctorName;
    document.getElementById('selectedTime').textContent = selectedTimeSlot;
    document.getElementById('bookingModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

// Handle booking form submission
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                patientName: document.getElementById('patientName').value,
                patientPhone: document.getElementById('patientPhone').value,
                patientEmail: document.getElementById('patientEmail').value,
                appointmentReason: document.getElementById('appointmentReason').value,
                doctor: selectedDoctor,
                timeSlot: selectedTimeSlot
            };
            
            /*
            MYSQL INTEGRATION POINT:
            - Save appointment to database
            - Query: INSERT INTO appointments (patient_name, patient_phone, patient_email, 
                     doctor_name, time_slot, appointment_date, reason, status)
                     VALUES (?, ?, ?, ?, ?, CURDATE(), ?, 'confirmed')
            - Update time slot availability
            - Query: UPDATE time_slots SET booked = 1 
                     WHERE doctor_name = ? AND time_slot = ? AND date = CURDATE()
            */
            
            console.log('Booking appointment:', formData);
            
            // Simulate booking success
            alert('Appointment booked successfully!');
            closeModal();
            
            // Reset form and selections
            bookingForm.reset();
            selectedTimeSlot = null;
            selectedDoctor = null;
            document.querySelectorAll('.time-slot.selected').forEach(s => {
                s.classList.remove('selected');
            });
        });
    }
});

// Prescription Upload Functions
function initializePrescriptionUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const fileList = document.getElementById('fileList');
    
    if (!uploadArea || !fileInput) return;
    
    // Handle drag and drop
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Handle form submission
    const prescriptionForm = document.getElementById('prescriptionForm');
    if (prescriptionForm) {
        prescriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            uploadPrescription();
        });
    }
}

function handleFiles(files) {
    const fileList = document.getElementById('fileList');
    const filePreview = document.getElementById('filePreview');
    
    uploadedFiles = Array.from(files);
    
    // Clear previous files
    fileList.innerHTML = '';
    
    // Display selected files
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span>${file.name} (${formatFileSize(file.size)})</span>
            <button type="button" onclick="removeFile(${index})" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer;">Remove</button>
        `;
        fileList.appendChild(fileItem);
    });
    
    filePreview.classList.remove('hidden');
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    handleFiles(uploadedFiles);
    
    if (uploadedFiles.length === 0) {
        document.getElementById('filePreview').classList.add('hidden');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function uploadPrescription() {
    const formData = {
        prescriptionType: document.getElementById('prescriptionType').value,
        doctorName: document.getElementById('doctorName').value,
        prescriptionDate: document.getElementById('prescriptionDate').value,
        prescriptionNotes: document.getElementById('prescriptionNotes').value,
        files: uploadedFiles
    };
    
    if (uploadedFiles.length === 0) {
        alert('Please select at least one file to upload');
        return;
    }
    
    /*
    MYSQL INTEGRATION POINT:
    - Upload files to server and save metadata to database
    - Query: INSERT INTO prescriptions (patient_id, prescription_type, doctor_name, 
             prescription_date, notes, file_path, file_name, file_size, upload_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    - Store files in secure directory structure
    - Generate unique file names to prevent conflicts
    */
    
    // Show loading state
    const uploadBtn = document.querySelector('.upload-btn');
    const spinner = uploadBtn.querySelector('.loading-spinner');
    uploadBtn.disabled = true;
    spinner.classList.remove('hidden');
    
    // Simulate upload process
    setTimeout(() => {
        console.log('Uploading prescription:', formData);
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        document.getElementById('prescriptionForm').reset();
        document.getElementById('filePreview').classList.add('hidden');
        uploadedFiles = [];
        
        // Reset button state
        uploadBtn.disabled = false;
        spinner.classList.add('hidden');
        
        // Refresh prescription list
        loadPrescriptionHistory();
    }, 2000);
}

function loadPrescriptionHistory() {
    /*
    MYSQL INTEGRATION POINT:
    - Load user's prescription history
    - Query: SELECT * FROM prescriptions 
             WHERE patient_id = ? 
             ORDER BY upload_date DESC
             LIMIT 10 OFFSET ?
    - Update prescription list UI with real data
    */
    console.log('Loading prescription history...');
}

function viewPrescription(prescriptionId) {
    /*
    MYSQL INTEGRATION POINT:
    - Load prescription details
    - Query: SELECT * FROM prescriptions WHERE prescription_id = ? AND patient_id = ?
    - Display prescription in modal
    */
    console.log('Viewing prescription:', prescriptionId);
    document.getElementById('viewModal').style.display = 'block';
}

function downloadPrescription(prescriptionId) {
    /*
    MYSQL INTEGRATION POINT:
    - Secure file download
    - Query: SELECT file_path FROM prescriptions 
             WHERE prescription_id = ? AND patient_id = ?
    - Serve file with proper authentication
    */
    console.log('Downloading prescription:', prescriptionId);
    // Simulate download
    alert('Download started...');
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.remove('hidden');
    
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
}

// Chat System Functions
function initializeChatSystem() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.focus();
    }
    
    // Simulate typing indicator
    setTimeout(() => {
        hideTypingIndicator();
    }, 3000);
    
    loadChatHistory();
}

function loadChatHistory() {
    /*
    MYSQL INTEGRATION POINT:
    - Load chat history for current session
    - Query: SELECT cm.*, u.name as sender_name, u.avatar 
             FROM chat_messages cm
             JOIN users u ON cm.sender_id = u.user_id
             WHERE cm.chat_session_id = ?
             ORDER BY cm.timestamp ASC
    - Populate chat messages with real data
    */
    console.log('Loading chat history...');
}

function selectCategory(category) {
    // Remove active class from all categories
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected category
    event.target.closest('.category-item').classList.add('active');
    
    /*
    MYSQL INTEGRATION POINT:
    - Load chats for selected category
    - Query: SELECT * FROM chat_sessions 
             WHERE patient_id = ? AND category = ?
             ORDER BY last_activity DESC
    */
    console.log('Selected category:', category);
}

function selectChat(chatId) {
    // Remove active class from all chats
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected chat
    event.target.closest('.chat-item').classList.add('active');
    
    /*
    MYSQL INTEGRATION POINT:
    - Load specific chat conversation
    - Query: SELECT * FROM chat_messages 
             WHERE chat_session_id = ?
             ORDER BY timestamp ASC
    - Update main chat area with conversation
    */
    console.log('Selected chat:', chatId);
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    /*
    MYSQL INTEGRATION POINT:
    - Save message to database
    - Query: INSERT INTO chat_messages (chat_session_id, sender_id, sender_type, 
             message, timestamp) VALUES (?, ?, 'patient', ?, NOW())
    - Send real-time notification to doctor
    */
    
    // Add message to chat
    addMessageToChat(message, 'sent');
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate doctor response
    setTimeout(() => {
        hideTypingIndicator();
        addMessageToChat("Thank you for your message. I'll review this and get back to you shortly.", 'received');
    }, 2000);
    
    console.log('Sending message:', message);
}

function addMessageToChat(message, type) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    if (type === 'received') {
        messageDiv.innerHTML = `
            <div class="message-avatar">👩‍⚕️</div>
            <div class="message-content">
                <p>${message}</p>
            </div>
            <div class="message-time">${currentTime}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
            <div class="message-time">${currentTime}</div>
        `;
    }
    
    // Insert before typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    chatMessages.insertBefore(messageDiv, typingIndicator);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'flex';
}

function hideTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'none';
}

function insertQuickResponse(response) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value = response;
    messageInput.focus();
    autoResize(messageInput);
}

function startNewChat() {
    /*
    MYSQL INTEGRATION POINT:
    - Create new chat session
    - Query: INSERT INTO chat_sessions (patient_id, category, status, start_time)
             VALUES (?, 'general', 'active', NOW())
    - Assign available doctor based on category
    */
    console.log('Starting new chat...');
    alert('Starting new chat session...');
}

function bookAppointmentFromChat() {
    /*
    MYSQL INTEGRATION POINT:
    - Open appointment booking with current doctor
    - Pre-fill doctor information from current chat
    */
    console.log('Booking appointment from chat...');
    navigateTo('doctor-timing.html');
}

function shareDocument() {
    /*
    MYSQL INTEGRATION POINT:
    - Open document sharing interface
    - Allow selecting from uploaded prescriptions
    */
    console.log('Sharing document...');
    alert('Document sharing feature - coming soon!');
}

function requestCallback() {
    /*
    MYSQL INTEGRATION POINT:
    - Create callback request
    - Query: INSERT INTO callback_requests (patient_id, doctor_id, 
             requested_time, status) VALUES (?, ?, NOW(), 'pending')
    */
    console.log('Requesting callback...');
    alert('Callback request sent!');
}

function endChat() {
    /*
    MYSQL INTEGRATION POINT:
    - End current chat session
    - Query: UPDATE chat_sessions SET status = 'closed', end_time = NOW()
             WHERE session_id = ?
    */
    if (confirm('Are you sure you want to end this chat?')) {
        console.log('Ending chat...');
        alert('Chat session ended.');
    }
}

// Modal close functionality
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function formatTime(time) {
    return new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        navigateTo,
        selectTimeSlot,
        filterDoctors,
        bookAppointment,
        handleFiles,
        uploadPrescription,
        sendMessage,
        formatFileSize
    };
}