<?php
header("Access-Control-Allow-Origin: http://localhost:3306"); // Updated to match XAMPP configuration
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$conn = new mysqli("localhost", "root", "", "bebrandby", 3306); // Updated to match XAMPP configuration
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // 📌 GET : ดึงสินค้าทั้งหมด
    case 'GET':
        $result = $conn->query("SELECT * FROM products");
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
        break;

    // ➕ POST : เพิ่มสินค้า
    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO products (name, price, description, image_url)
                VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "sdss",
            $input['name'],
            $input['price'],
            $input['description'],
            $input['image_url']
        );
        $stmt->execute();
        echo json_encode(["success" => true]);
        break;

    // ✏️ PUT : แก้ไขสินค้า
    case 'PUT':
        $input = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE products 
                SET name=?, price=?, description=?, image_url=? 
                WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "sdssi",
            $input['name'],
            $input['price'],
            $input['description'],
            $input['image_url'],
            $input['id']
        );
        $stmt->execute();
        echo json_encode(["success" => true]);
        break;

    // 🗑 DELETE : ลบสินค้า
    case 'DELETE':
        $input = json_decode(file_get_contents("php://input"), true);
        $stmt = $conn->prepare("DELETE FROM products WHERE id=?");
        $stmt->bind_param("i", $input['id']);
        $stmt->execute();
        echo json_encode(["success" => true]);
        break;
}

$conn->close();
