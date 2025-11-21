const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const db = mysql.createConnection({
    host: 'localhost',
    port: 3307, // Sometimes XAMPP uses 3307
    user: 'root',
    password: '',
    database: 'student_management'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        console.log('Make sure:');
        console.log('1. XAMPP MySQL is running');
        console.log('2. student_management database exists');
        console.log('3. MySQL password is correct (empty for XAMPP)');
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// Routes

// Check if student ID exists
app.get('/api/check/:studentId', (req, res) => {
    const { studentId } = req.params;
    
    const query = 'SELECT * FROM students WHERE studentId = ?';
    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length > 0) {
            res.json({
                exists: true,
                record: {
                    studentId: results[0].studentId,
                    firstName: results[0].firstName,
                    lastName: results[0].lastName,
                    email: results[0].email,
                    birthDate: results[0].birthDate,
                    enrollmentDate: results[0].enrollmentDate,
                    program: results[0].program
                }
            });
        } else {
            res.json({ exists: false });
        }
    });
});

// Get student record
app.get('/api/record/:studentId', (req, res) => {
    const { studentId } = req.params;
    
    const query = 'SELECT * FROM students WHERE studentId = ?';
    db.query(query, [studentId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length > 0) {
            res.json({
                studentId: results[0].studentId,
                firstName: results[0].firstName,
                lastName: results[0].lastName,
                email: results[0].email,
                birthDate: results[0].birthDate,
                enrollmentDate: results[0].enrollmentDate,
                program: results[0].program
            });
        } else {
            res.status(404).json({ error: 'Record not found' });
        }
    });
});

// Create new student record
app.post('/api/create', (req, res) => {
    const { studentId, firstName, lastName, email, birthDate, enrollmentDate, program } = req.body;
    
    // Validation
    if (!studentId || !firstName || !lastName || !email || !birthDate || !enrollmentDate || !program) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (new Date(enrollmentDate) <= new Date(birthDate)) {
        return res.status(400).json({ error: 'Enrollment date must be after birth date' });
    }
    
    const query = `INSERT INTO students (studentId, firstName, lastName, email, birthDate, enrollmentDate, program) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(query, [studentId, firstName, lastName, email, birthDate, enrollmentDate, program], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Student ID or email already exists' });
            }
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        res.json({ success: true, message: 'Record created successfully' });
    });
});

// Update student record
app.put('/api/update/:studentId', (req, res) => {
    const { studentId } = req.params;
    const { firstName, lastName, email, birthDate, enrollmentDate, program } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email || !birthDate || !enrollmentDate || !program) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    const query = `UPDATE students 
                   SET firstName = ?, lastName = ?, email = ?, birthDate = ?, enrollmentDate = ?, program = ?
                   WHERE studentId = ?`;
    
    db.query(query, [firstName, lastName, email, birthDate, enrollmentDate, program, studentId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        res.json({ success: true, message: 'Record updated successfully' });
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Make sure MySQL is running in XAMPP`);
});