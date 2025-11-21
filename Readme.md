# Student Record Management System

A comprehensive web-based student record management system built with HTML, CSS, JavaScript, and PHP with MySQL backend.

![Student Record Form](Screenshot-2025-11-21-at-9.09.40-PM.png)
*Main application interface showing the student record form*

## Features

- ✅ **Student Record Management**: Create, read, update student records
- ✅ **Real-time Validation**: Client-side and server-side validation
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Auto-focus Management**: Smart focus handling for better UX
- ✅ **Duplicate Prevention**: Prevents duplicate student IDs and emails
- ✅ **Date Validation**: Ensures enrollment date is after birth date
- ✅ **RESTful API**: Clean API endpoints for all operations

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP
- **Database**: MySQL
- **Server**: XAMPP (Apache + MySQL)

## Project Structure
Mini/
├── index.html # Main application interface
├── styles.css # Styling and responsive design
├── app.js # Frontend logic and API calls
├── server.php # PHP backend API endpoints
├── config.php # Database configuration
├── README.md # Project documentation
├── database_entries.txt # Sample database entries
├── Screenshot-2025-11-21-at-9.09.40-PM.png # Application screenshot
└── Screenshot-2025-11-21-at-9.10.09-PM.png # Database screenshot
```markdown
## Database Structure

![Database Records](Screenshot-2025-11-21-at-9.10.09-PM.png)
*MySQL database showing sample student records*

### Database Schema

```sql
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    studentId VARCHAR(20) UNIQUE NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    birthDate DATE NOT NULL,
    enrollmentDate DATE NOT NULL,
    program VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
API Endpoints
Method	Endpoint	Description
GET	/api/check/:studentId	Check if student ID exists
GET	/api/record/:studentId	Get student record details
POST	/api/create	Create new student record
PUT	/api/update/:studentId	Update existing record
Installation & Setup
Prerequisites
XAMPP (Apache + MySQL)
PHP 7.4+
MySQL 5.7+
Steps
1. Clone the repository
git clone <your-repo-url>
cd Mini
2. Setup Database
Start XAMPP and ensure Apache & MySQL are running
Open: http://localhost/phpmyadmin
Create database named student_management
Import the SQL schema or run:
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    studentId VARCHAR(20) UNIQUE NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    birthDate DATE NOT NULL,
    enrollmentDate DATE NOT NULL,
    program VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
3. Configure Database
Update config.php with correct MySQL username/password
(default XAMPP = username: root, password: (empty))
4. Run the Application
Place the Mini folder inside the XAMPP htdocs directory
Open browser and go to:
http://localhost/Mini/
Usage
1. Check Student Record
Enter a Student ID
System auto-checks if record exists
If found → form loads in Update mode
If not found → form is ready for Save mode
2. Create New Record
Enter a unique Student ID
Fill required fields
Click Save
3. Update Existing Record
Enter existing Student ID
Modify fields
Click Update
4. Reset Form
Click Reset to clear the form
Validation Rules
Student ID: Required, unique, alphanumeric
First Name: Required
Last Name: Required
Email: Required, valid, unique
Birth Date: Required
Enrollment Date: Required, must be after birth date
Program: Required
Sample Data
Student ID	Name	Email	Program
STU001	John Doe	john.doe@example.com	Computer Science
STU002	Jane Smith	jane.smith@example.com	Business Administration
STU003	Michael Johnson	michael.johnson@example.com	Engineering
STU004	Sarah Wilson	sarah.wilson@example.com	Psychology
STU005	David Brown	david.brown@example.com	Biology
Testing
Test Cases
New student creation with unique ID
Updating existing student
Attempt duplicate Student ID
Attempt duplicate email
Invalid email format
Enrollment date earlier than birth date
Empty required fields
File Descriptions
index.html – Main UI
styles.css – Layout & design
app.js – Frontend logic + API calls
server.php – Backend REST API
config.php – Database configuration
database_entries.txt – Sample SQL data
Browser Support
Chrome 90+
Firefox 88+
Safari 14+
Edge 90+
Contributing
Fork the repo
Create a branch (git checkout -b feature/FeatureName)
Commit (git commit -m "Add feature")
Push (git push origin feature/FeatureName)
Open Pull Request
Support
Create an issue in the GitHub repo
Check documentation for troubleshooting
Acknowledgments
Built as a student project
Modern responsive design principles
REST API design best practices