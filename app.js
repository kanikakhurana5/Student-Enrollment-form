// DOM elements
const studentForm = document.getElementById('studentForm');
const studentIdInput = document.getElementById('studentId');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const birthDateInput = document.getElementById('birthDate');
const enrollmentDateInput = document.getElementById('enrollmentDate');
const programSelect = document.getElementById('program');

const saveBtn = document.getElementById('saveBtn');
const updateBtn = document.getElementById('updateBtn');
const resetBtn = document.getElementById('resetBtn');

const statusMessage = document.getElementById('statusMessage');

// Error message elements
const studentIdError = document.getElementById('studentIdError');
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const birthDateError = document.getElementById('birthDateError');
const enrollmentDateError = document.getElementById('enrollmentDateError');
const programError = document.getElementById('programError');

// API endpoints - Update this to your PHP file path
const API_BASE = window.location.origin + '/Mini/server.php/api';

// Initial state setup
function initializeForm() {
    // Clear all inputs
    studentForm.reset();
    
    // Disable all inputs except studentId
    firstNameInput.disabled = true;
    lastNameInput.disabled = true;
    emailInput.disabled = true;
    birthDateInput.disabled = true;
    enrollmentDateInput.disabled = true;
    programSelect.disabled = true;
    
    // Disable Save and Update buttons
    saveBtn.disabled = true;
    updateBtn.disabled = true;
    
    // Enable Reset button
    resetBtn.disabled = false;
    
    // Clear error messages
    clearErrorMessages();
    
    // Clear status message
    hideStatusMessage();
    
    // Focus on student ID
    studentIdInput.focus();
}

// Clear all error messages
function clearErrorMessages() {
    studentIdError.style.display = 'none';
    firstNameError.style.display = 'none';
    lastNameError.style.display = 'none';
    emailError.style.display = 'none';
    birthDateError.style.display = 'none';
    enrollmentDateError.style.display = 'none';
    programError.style.display = 'none';
}

// Show status message
function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    
    switch(type) {
        case 'info':
            statusMessage.classList.add('status-info');
            break;
        case 'success':
            statusMessage.classList.add('status-success');
            break;
        case 'error':
            statusMessage.classList.add('status-error');
            break;
    }
    
    statusMessage.style.display = 'block';
}

// Hide status message
function hideStatusMessage() {
    statusMessage.style.display = 'none';
}

// Validate form
function validateForm() {
    let isValid = true;
    clearErrorMessages();
    
    // Validate student ID
    if (!studentIdInput.value.trim()) {
        studentIdError.textContent = 'Student ID is required';
        studentIdError.style.display = 'block';
        isValid = false;
    }
    
    // Validate first name
    if (!firstNameInput.value.trim()) {
        firstNameError.textContent = 'First name is required';
        firstNameError.style.display = 'block';
        isValid = false;
    }
    
    // Validate last name
    if (!lastNameInput.value.trim()) {
        lastNameError.textContent = 'Last name is required';
        lastNameError.style.display = 'block';
        isValid = false;
    }
    
    // Validate email
    if (!emailInput.value.trim()) {
        emailError.textContent = 'Email is required';
        emailError.style.display = 'block';
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        emailError.textContent = 'Please enter a valid email address';
        emailError.style.display = 'block';
        isValid = false;
    }
    
    // Validate birth date
    if (!birthDateInput.value) {
        birthDateError.textContent = 'Birth date is required';
        birthDateError.style.display = 'block';
        isValid = false;
    }
    
    // Validate enrollment date
    if (!enrollmentDateInput.value) {
        enrollmentDateError.textContent = 'Enrollment date is required';
        enrollmentDateError.style.display = 'block';
        isValid = false;
    }
    
    // Validate program
    if (!programSelect.value) {
        programError.textContent = 'Program is required';
        programError.style.display = 'block';
        isValid = false;
    }
    
    // Validate date logic
    if (birthDateInput.value && enrollmentDateInput.value) {
        const birthDate = new Date(birthDateInput.value);
        const enrollmentDate = new Date(enrollmentDateInput.value);
        
        if (enrollmentDate <= birthDate) {
            enrollmentDateError.textContent = 'Enrollment date must be after birth date';
            enrollmentDateError.style.display = 'block';
            isValid = false;
        }
    }
    
    return isValid;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// API call to check if student ID exists
async function checkStudentId(studentId) {
    try {
        const response = await fetch(`${API_BASE}/check/${studentId}`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error checking student ID:', error);
        throw error;
    }
}

// API call to save new record
async function saveRecord(record) {
    try {
        const response = await fetch(`${API_BASE}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(record)
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error saving record:', error);
        throw error;
    }
}

// API call to update existing record
async function updateRecord(studentId, record) {
    try {
        const response = await fetch(`${API_BASE}/update/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(record)
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating record:', error);
        throw error;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeForm);

// Student ID blur or Enter key
studentIdInput.addEventListener('blur', handleStudentIdCheck);
studentIdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleStudentIdCheck();
    }
});

// Save button click
saveBtn.addEventListener('click', handleSave);

// Update button click
updateBtn.addEventListener('click', handleUpdate);

// Reset button click
resetBtn.addEventListener('click', initializeForm);

// Handle student ID check
async function handleStudentIdCheck() {
    const studentId = studentIdInput.value.trim();
    
    if (!studentId) {
        showStatusMessage('Please enter a Student ID', 'error');
        return;
    }
    
    showStatusMessage('Checking student ID...', 'info');
    
    try {
        const result = await checkStudentId(studentId);
        
        if (result.exists) {
            // Record found - populate form for editing
            populateForm(result.record);
            studentIdInput.disabled = true;
            saveBtn.disabled = true;
            updateBtn.disabled = false;
            showStatusMessage('Record found - ready for editing', 'success');
            
            // Focus on next editable field
            firstNameInput.focus();
        } else {
            // Record not found - enable form for new entry
            enableFormForNewEntry();
            showStatusMessage('Record not found - ready to create new record', 'info');
            
            // Focus on next editable field
            firstNameInput.focus();
        }
    } catch (error) {
        console.error('Error checking student ID:', error);
        showStatusMessage('Error checking student ID. Please try again.', 'error');
    }
}

// Populate form with record data
function populateForm(record) {
    firstNameInput.value = record.firstName || '';
    lastNameInput.value = record.lastName || '';
    emailInput.value = record.email || '';
    birthDateInput.value = record.birthDate || '';
    enrollmentDateInput.value = record.enrollmentDate || '';
    programSelect.value = record.program || '';
    
    // Enable all fields except student ID
    firstNameInput.disabled = false;
    lastNameInput.disabled = false;
    emailInput.disabled = false;
    birthDateInput.disabled = false;
    enrollmentDateInput.disabled = false;
    programSelect.disabled = false;
}

// Enable form for new entry
function enableFormForNewEntry() {
    // Clear all fields except student ID
    firstNameInput.value = '';
    lastNameInput.value = '';
    emailInput.value = '';
    birthDateInput.value = '';
    enrollmentDateInput.value = '';
    programSelect.value = '';
    
    // Enable all fields except student ID
    firstNameInput.disabled = false;
    lastNameInput.disabled = false;
    emailInput.disabled = false;
    birthDateInput.disabled = false;
    enrollmentDateInput.disabled = false;
    programSelect.disabled = false;
    
    // Enable Save button, disable Update button
    saveBtn.disabled = false;
    updateBtn.disabled = true;
}

// Handle Save
async function handleSave() {
    if (!validateForm()) {
        showStatusMessage('Please fix validation errors before saving', 'error');
        return;
    }
    
    const record = {
        studentId: studentIdInput.value.trim(),
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        birthDate: birthDateInput.value,
        enrollmentDate: enrollmentDateInput.value,
        program: programSelect.value
    };
    
    showStatusMessage('Saving record...', 'info');
    
    try {
        const result = await saveRecord(record);
        
        if (result.success) {
            showStatusMessage('Record saved successfully!', 'success');
            setTimeout(() => {
                initializeForm();
            }, 1500);
        }
    } catch (error) {
        console.error('Error saving record:', error);
        if (error.message.includes('already exists')) {
            showStatusMessage('Student ID or email already exists', 'error');
        } else {
            showStatusMessage('Error saving record. Please try again.', 'error');
        }
    }
}

// Handle Update
async function handleUpdate() {
    if (!validateForm()) {
        showStatusMessage('Please fix validation errors before updating', 'error');
        return;
    }
    
    const record = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        birthDate: birthDateInput.value,
        enrollmentDate: enrollmentDateInput.value,
        program: programSelect.value
    };
    
    showStatusMessage('Updating record...', 'info');
    
    try {
        const result = await updateRecord(studentIdInput.value.trim(), record);
        
        if (result.success) {
            showStatusMessage('Record updated successfully!', 'success');
            setTimeout(() => {
                initializeForm();
            }, 1500);
        }
    } catch (error) {
        console.error('Error updating record:', error);
        showStatusMessage('Error updating record. Please try again.', 'error');
    }
}