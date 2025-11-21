<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

class Database {
    private $host = "localhost";
    private $db_name = "student_management";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo json_encode(["error" => "Connection error: " . $exception->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}

$database = new Database();
$db = $database->getConnection();

$request_method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Helper function to send JSON response
function sendResponse($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data);
    exit;
}

// Helper function for validation
function validateStudentData($data, $checkId = true) {
    $errors = [];
    
    if ($checkId && (empty($data['studentId']) || !preg_match('/^[A-Z0-9]+$/', $data['studentId']))) {
        $errors[] = "Valid Student ID is required";
    }
    
    if (empty($data['firstName'])) {
        $errors[] = "First name is required";
    }
    
    if (empty($data['lastName'])) {
        $errors[] = "Last name is required";
    }
    
    if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Valid email is required";
    }
    
    if (empty($data['birthDate'])) {
        $errors[] = "Birth date is required";
    }
    
    if (empty($data['enrollmentDate'])) {
        $errors[] = "Enrollment date is required";
    }
    
    if (empty($data['program'])) {
        $errors[] = "Program is required";
    }
    
    // Date validation
    if (!empty($data['birthDate']) && !empty($data['enrollmentDate'])) {
        $birthDate = new DateTime($data['birthDate']);
        $enrollmentDate = new DateTime($data['enrollmentDate']);
        
        if ($enrollmentDate <= $birthDate) {
            $errors[] = "Enrollment date must be after birth date";
        }
    }
    
    return $errors;
}

// Route the request
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', $path);
$endpoint = end($path_parts);

switch($request_method) {
    case 'GET':
        if (strpos($_SERVER['REQUEST_URI'], 'check') !== false) {
            // GET /api/check/:studentId
            $studentId = $path_parts[count($path_parts) - 1];
            handleCheckStudent($db, $studentId);
        } elseif (strpos($_SERVER['REQUEST_URI'], 'record') !== false) {
            // GET /api/record/:studentId
            $studentId = $path_parts[count($path_parts) - 1];
            handleGetRecord($db, $studentId);
        } else {
            sendResponse(['error' => 'Endpoint not found'], 404);
        }
        break;
        
    case 'POST':
        if ($endpoint == 'create') {
            handleCreateStudent($db, $input);
        } else {
            sendResponse(['error' => 'Endpoint not found'], 404);
        }
        break;
        
    case 'PUT':
        if (strpos($_SERVER['REQUEST_URI'], 'update') !== false) {
            $studentId = $path_parts[count($path_parts) - 1];
            handleUpdateStudent($db, $studentId, $input);
        } else {
            sendResponse(['error' => 'Endpoint not found'], 404);
        }
        break;
        
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
        break;
}

function handleCheckStudent($db, $studentId) {
    if (empty($studentId)) {
        sendResponse(['error' => 'Student ID is required'], 400);
    }
    
    try {
        $query = "SELECT * FROM students WHERE studentId = :studentId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':studentId', $studentId);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            sendResponse([
                'exists' => true,
                'record' => [
                    'studentId' => $row['studentId'],
                    'firstName' => $row['firstName'],
                    'lastName' => $row['lastName'],
                    'email' => $row['email'],
                    'birthDate' => $row['birthDate'],
                    'enrollmentDate' => $row['enrollmentDate'],
                    'program' => $row['program']
                ]
            ]);
        } else {
            sendResponse(['exists' => false]);
        }
    } catch (PDOException $exception) {
        sendResponse(['error' => 'Database error: ' . $exception->getMessage()], 500);
    }
}

function handleGetRecord($db, $studentId) {
    if (empty($studentId)) {
        sendResponse(['error' => 'Student ID is required'], 400);
    }
    
    try {
        $query = "SELECT * FROM students WHERE studentId = :studentId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':studentId', $studentId);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            sendResponse([
                'studentId' => $row['studentId'],
                'firstName' => $row['firstName'],
                'lastName' => $row['lastName'],
                'email' => $row['email'],
                'birthDate' => $row['birthDate'],
                'enrollmentDate' => $row['enrollmentDate'],
                'program' => $row['program']
            ]);
        } else {
            sendResponse(['error' => 'Record not found'], 404);
        }
    } catch (PDOException $exception) {
        sendResponse(['error' => 'Database error: ' . $exception->getMessage()], 500);
    }
}

function handleCreateStudent($db, $data) {
    $validationErrors = validateStudentData($data);
    
    if (!empty($validationErrors)) {
        sendResponse(['error' => 'Validation failed', 'details' => $validationErrors], 400);
    }
    
    try {
        // Check if student ID already exists
        $checkQuery = "SELECT studentId FROM students WHERE studentId = :studentId";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':studentId', $data['studentId']);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            sendResponse(['error' => 'Student ID already exists'], 400);
        }
        
        // Check if email already exists
        $emailQuery = "SELECT email FROM students WHERE email = :email";
        $emailStmt = $db->prepare($emailQuery);
        $emailStmt->bindParam(':email', $data['email']);
        $emailStmt->execute();
        
        if ($emailStmt->rowCount() > 0) {
            sendResponse(['error' => 'Email already exists'], 400);
        }
        
        // Insert new record
        $query = "INSERT INTO students 
                  (studentId, firstName, lastName, email, birthDate, enrollmentDate, program) 
                  VALUES 
                  (:studentId, :firstName, :lastName, :email, :birthDate, :enrollmentDate, :program)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':studentId', $data['studentId']);
        $stmt->bindParam(':firstName', $data['firstName']);
        $stmt->bindParam(':lastName', $data['lastName']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':birthDate', $data['birthDate']);
        $stmt->bindParam(':enrollmentDate', $data['enrollmentDate']);
        $stmt->bindParam(':program', $data['program']);
        
        if ($stmt->execute()) {
            sendResponse(['success' => true, 'message' => 'Record created successfully']);
        } else {
            sendResponse(['error' => 'Failed to create record'], 500);
        }
    } catch (PDOException $exception) {
        sendResponse(['error' => 'Database error: ' . $exception->getMessage()], 500);
    }
}

function handleUpdateStudent($db, $studentId, $data) {
    if (empty($studentId)) {
        sendResponse(['error' => 'Student ID is required'], 400);
    }
    
    $validationErrors = validateStudentData($data, false); // Don't check studentId in data
    
    if (!empty($validationErrors)) {
        sendResponse(['error' => 'Validation failed', 'details' => $validationErrors], 400);
    }
    
    try {
        // Check if student exists
        $checkQuery = "SELECT studentId FROM students WHERE studentId = :studentId";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':studentId', $studentId);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() == 0) {
            sendResponse(['error' => 'Student record not found'], 404);
        }
        
        // Check if email exists for other students
        $emailQuery = "SELECT studentId FROM students WHERE email = :email AND studentId != :studentId";
        $emailStmt = $db->prepare($emailQuery);
        $emailStmt->bindParam(':email', $data['email']);
        $emailStmt->bindParam(':studentId', $studentId);
        $emailStmt->execute();
        
        if ($emailStmt->rowCount() > 0) {
            sendResponse(['error' => 'Email already exists for another student'], 400);
        }
        
        // Update record
        $query = "UPDATE students 
                  SET firstName = :firstName, lastName = :lastName, email = :email, 
                      birthDate = :birthDate, enrollmentDate = :enrollmentDate, program = :program
                  WHERE studentId = :studentId";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':studentId', $studentId);
        $stmt->bindParam(':firstName', $data['firstName']);
        $stmt->bindParam(':lastName', $data['lastName']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':birthDate', $data['birthDate']);
        $stmt->bindParam(':enrollmentDate', $data['enrollmentDate']);
        $stmt->bindParam(':program', $data['program']);
        
        if ($stmt->execute()) {
            sendResponse(['success' => true, 'message' => 'Record updated successfully']);
        } else {
            sendResponse(['error' => 'Failed to update record'], 500);
        }
    } catch (PDOException $exception) {
        sendResponse(['error' => 'Database error: ' . $exception->getMessage()], 500);
    }
}
?>