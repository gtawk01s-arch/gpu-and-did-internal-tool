import React, { useState } from 'react';
import {
  Server,
  Database,
  FileCode,
  Download,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  CheckCircle2,
  FolderArchive,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const XamppGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'instructions' | 'sql' | 'db_php' | 'api_php' | 'standalone_html'>('instructions');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const MYSQL_SCHEMA_SQL = `-- =======================================================
-- XAMPP / MySQL / MariaDB Schema for GPU & SIP System
-- Import this in phpMyAdmin: http://localhost/phpmyadmin
-- =======================================================

CREATE DATABASE IF NOT EXISTS \`gpu_sip_broker\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`gpu_sip_broker\`;

-- 1. Clients Table (Dedicated portal credentials)
CREATE TABLE IF NOT EXISTS \`clients\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`company_name\` VARCHAR(150) NOT NULL,
  \`contact_person\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(120) NOT NULL,
  \`portal_username\` VARCHAR(120) NOT NULL,
  \`portal_password\` VARCHAR(120) NOT NULL,
  \`phone\` VARCHAR(40),
  \`address\` TEXT,
  \`resource_need\` ENUM('GPU Only', 'DID Only', 'Both GPU & DID') NOT NULL DEFAULT 'Both GPU & DID',
  \`gpu_needed_model\` VARCHAR(100),
  \`gpu_needed_qty\` INT DEFAULT 0,
  \`did_needed_type\` VARCHAR(100),
  \`did_needed_qty\` INT DEFAULT 0,
  \`monthly_spend\` DECIMAL(12,2) DEFAULT 0.00,
  \`monthly_cost\` DECIMAL(12,2) DEFAULT 0.00,
  \`status\` VARCHAR(30) DEFAULT 'Active',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. GPU Inventory Table
CREATE TABLE IF NOT EXISTS \`gpu_nodes\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`gpu_id\` VARCHAR(50) UNIQUE NOT NULL,
  \`provider\` VARCHAR(80) NOT NULL,
  \`region\` VARCHAR(60) NOT NULL,
  \`gpu_model\` VARCHAR(100) NOT NULL,
  \`quantity\` INT NOT NULL DEFAULT 1,
  \`allocated_quantity\` INT NOT NULL DEFAULT 0,
  \`monthly_cost\` DECIMAL(10,2) NOT NULL,
  \`selling_price\` DECIMAL(10,2) NOT NULL,
  \`assigned_client_id\` INT NULL,
  \`status\` ENUM('Available', 'In Use', 'Reserved', 'Maintenance') DEFAULT 'Available',
  \`contract_start\` DATE,
  \`contract_end\` DATE,
  FOREIGN KEY (\`assigned_client_id\`) REFERENCES \`clients\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. DID Telecom Inventory Table
CREATE TABLE IF NOT EXISTS \`did_numbers\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`did_number\` VARCHAR(40) UNIQUE NOT NULL,
  \`provider\` VARCHAR(80) NOT NULL,
  \`country\` VARCHAR(60) NOT NULL,
  \`assigned_client_id\` INT NULL,
  \`monthly_cost\` DECIMAL(8,2) NOT NULL,
  \`selling_price\` DECIMAL(8,2) NOT NULL,
  \`status\` ENUM('Available', 'Assigned', 'Suspended') DEFAULT 'Available',
  \`usage_minutes\` INT DEFAULT 0,
  FOREIGN KEY (\`assigned_client_id\`) REFERENCES \`clients\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Resource Allocation & Client Requests Table
CREATE TABLE IF NOT EXISTS \`resource_requests\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`request_code\` VARCHAR(50) UNIQUE NOT NULL,
  \`client_id\` INT NOT NULL,
  \`resource_type\` ENUM('GPU Cluster', 'SIP Trunk', 'DID Number Block') NOT NULL,
  \`specs\` VARCHAR(255) NOT NULL,
  \`quantity\` INT NOT NULL DEFAULT 1,
  \`monthly_cost\` DECIMAL(10,2) NOT NULL,
  \`selling_price\` DECIMAL(10,2) NOT NULL,
  \`status\` ENUM('Pending', 'Approved', 'Rejected', 'Hold') DEFAULT 'Pending',
  \`notes\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`client_id\`) REFERENCES \`clients\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Sample Seed Data
INSERT INTO \`clients\` (\`company_name\`, \`contact_person\`, \`email\`, \`phone\`, \`resource_need\`, \`gpu_needed_model\`, \`gpu_needed_qty\`, \`monthly_spend\`, \`monthly_cost\`) VALUES
('HyperScale AI Inc.', 'Sarah Jenkins (CTO)', 'sjenkins@hyperscale.ai', '+1 415-555-0199', 'Both GPU & DID', 'NVIDIA H100 SXM5 80GB', 60, 204500.00, 137800.00),
('AnthroTech Labs', 'Dr. Nikolai Weber', 'n.weber@anthrotech.de', '+49 30 555-8821', 'GPU Only', 'NVIDIA H100 SXM5 80GB', 32, 114200.00, 74600.00),
('VoxFlow Voice Solutions', 'Marcus Brody', 'mbrody@voxflow.io', '+1 800-459-2099', 'DID Only', NULL, 0, 54800.00, 32400.00);

INSERT INTO \`gpu_nodes\` (\`gpu_id\`, \`provider\`, \`region\`, \`gpu_model\`, \`quantity\`, \`allocated_quantity\`, \`monthly_cost\`, \`selling_price\`, \`assigned_client_id\`, \`status\`) VALUES
('GPU-H100-US-E1', 'RunPod', 'us-east', 'NVIDIA H100 SXM5 80GB', 64, 60, 2150.00, 3200.00, 1, 'In Use'),
('GPU-A100-US-W2', 'Lambda Labs', 'us-west', 'NVIDIA A100 SXM4 80GB', 48, 44, 1100.00, 1750.00, 2, 'In Use'),
('GPU-L40S-US-C1', 'Vast.ai', 'us-central', 'NVIDIA L40S 48GB Ada', 64, 0, 620.00, 980.00, NULL, 'Available');

INSERT INTO \`did_numbers\` (\`did_number\`, \`provider\`, \`country\`, \`assigned_client_id\`, \`monthly_cost\`, \`selling_price\`, \`status\`) VALUES
('+1 (415) 890-4100', 'Telnyx', 'USA', 1, 1.20, 3.50, 'Assigned'),
('+1 (415) 890-4101', 'Telnyx', 'USA', 1, 1.20, 3.50, 'Assigned'),
('+1 (800) 459-2099', 'Bandwidth', 'USA', 3, 2.80, 7.50, 'Assigned'),
('+1 (415) 890-4102', 'Telnyx', 'USA', NULL, 1.20, 3.50, 'Available');
`;

  const DB_PHP_CODE = `<?php
// db.php - Database connection for XAMPP
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

$host     = 'localhost';
$dbname   = 'gpu_sip_broker';
$username = 'root';      // Default XAMPP username
$password = '';          // Default XAMPP password is blank

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}
?>`;

  const API_PHP_CODE = `<?php
// api.php - Backend REST API for XAMPP
require_once 'db.php';
header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. CLIENT PORTAL LOGIN
if ($method === 'POST' && $action === 'client_login') {
    $data = json_decode(file_get_contents("php://input"), true);
    $user = trim($data['username'] ?? '');
    $pass = trim($data['password'] ?? '');

    $stmt = $pdo->prepare("SELECT * FROM clients WHERE (portal_username = ? OR email = ?) AND portal_password = ?");
    $stmt->execute([$user, $user, $pass]);
    $client = $stmt->fetch();

    if ($client) {
        unset($client['portal_password']); // Secure
        echo json_encode(["status" => "success", "client" => $client]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid client portal credentials"]);
    }
    exit;
}

// 2. GET ALL CLIENTS
if ($method === 'GET' && $action === 'clients') {
    $stmt = $pdo->query("SELECT * FROM clients ORDER BY id DESC");
    echo json_encode($stmt->fetchAll());
    exit;
}

// 2. ADD NEW CLIENT (With GPU / DID Needs)
if ($method === 'POST' && $action === 'add_client') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $stmt = $pdo->prepare("INSERT INTO clients 
        (company_name, contact_person, email, phone, address, resource_need, gpu_needed_model, gpu_needed_qty, did_needed_type, did_needed_qty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
    $stmt->execute([
        $data['company_name'],
        $data['contact_person'],
        $data['email'],
        $data['phone'] ?? '',
        $data['address'] ?? '',
        $data['resource_need'] ?? 'Both GPU & DID',
        $data['gpu_needed_model'] ?? null,
        $data['gpu_needed_qty'] ?? 0,
        $data['did_needed_type'] ?? null,
        $data['did_needed_qty'] ?? 0
    ]);
    
    echo json_encode(["status" => "success", "client_id" => $pdo->lastInsertId()]);
    exit;
}

// 3. GET GPU INVENTORY
if ($method === 'GET' && $action === 'gpus') {
    $stmt = $pdo->query("SELECT g.*, c.company_name AS assigned_client_name 
                         FROM gpu_nodes g 
                         LEFT JOIN clients c ON g.assigned_client_id = c.id");
    echo json_encode($stmt->fetchAll());
    exit;
}

// 4. ALLOCATE GPU TO CLIENT
if ($method === 'POST' && $action === 'allocate_gpu') {
    $data = json_decode(file_get_contents("php://input"), true);
    $gpu_id = $data['gpu_id'];
    $client_id = $data['client_id'];
    $qty = (int)$data['quantity'];
    
    // Update GPU allocation
    $stmt = $pdo->prepare("UPDATE gpu_nodes SET assigned_client_id = ?, allocated_quantity = allocated_quantity + ?, status = 'In Use' WHERE id = ?");
    $stmt->execute([$client_id, $qty, $gpu_id]);
    
    echo json_encode(["status" => "success", "message" => "GPU successfully allocated"]);
    exit;
}

// 5. CLIENT PORTAL: RAISE NEW RESOURCE REQUEST
if ($method === 'POST' && $action === 'raise_request') {
    $data = json_decode(file_get_contents("php://input"), true);
    $requestCode = 'REQ-' . date('Y') . '-' . rand(1000, 9999);
    
    $stmt = $pdo->prepare("INSERT INTO resource_requests 
        (request_code, client_id, resource_type, specs, quantity, monthly_cost, selling_price, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)");
        
    $stmt->execute([
        $requestCode,
        $data['client_id'],
        $data['resource_type'],
        $data['specs'],
        $data['quantity'] ?? 1,
        $data['monthly_cost'] ?? 0.00,
        $data['selling_price'] ?? 0.00,
        $data['notes'] ?? ''
    ]);
    
    echo json_encode(["status" => "success", "request_code" => $requestCode]);
    exit;
}

// 6. GET ALL REQUESTS (Admin Approvals Desk)
if ($method === 'GET' && $action === 'requests') {
    $stmt = $pdo->query("SELECT r.*, c.company_name FROM resource_requests r JOIN clients c ON r.client_id = c.id ORDER BY r.id DESC");
    echo json_encode($stmt->fetchAll());
    exit;
}

echo json_encode(["message" => "GPU & SIP Wholesale API Running on XAMPP"]);
?>`;

  const STANDALONE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GPU & SIP Wholesale System (XAMPP)</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 font-sans p-6">
    <div class="max-w-6xl mx-auto space-y-6">
        <!-- Header -->
        <header class="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
                <h1 class="text-2xl font-bold text-white">GPU & SIP Wholesale Broker Platform</h1>
                <p class="text-xs text-slate-400">Running on Local XAMPP (Apache + MySQL/PHP)</p>
            </div>
            <span class="px-3 py-1 bg-emerald-900/60 text-emerald-300 border border-emerald-700 rounded text-xs">
                Localhost Database Connected
            </span>
        </header>

        <!-- KPI Grid -->
        <div class="grid grid-cols-4 gap-4 text-center">
            <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div class="text-xs text-slate-400">Total Monthly Revenue</div>
                <div class="text-2xl font-bold text-emerald-400">₹37,35,000</div>
            </div>
            <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div class="text-xs text-slate-400">Wholesale Provider Cost</div>
                <div class="text-2xl font-bold text-rose-400">₹24,48,000</div>
            </div>
            <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div class="text-xs text-slate-400">Gross Resale Profit</div>
                <div class="text-2xl font-bold text-cyan-400">₹12,87,000</div>
            </div>
            <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div class="text-xs text-slate-400">Arbitrage Margin</div>
                <div class="text-2xl font-bold text-indigo-400">34.5%</div>
            </div>
        </div>

        <!-- Clients & Allocations Card -->
        <div class="bg-slate-800 rounded-lg border border-slate-700 p-5">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-bold text-white">Clients & Resource Needs</h2>
                <button onclick="alert('Open client modal to select GPU or DID needs')" class="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-semibold">
                    + Add Client & Needs
                </button>
            </div>
            <div id="clients-table" class="text-xs text-slate-300">
                <p>Fetch client list from: <code>api.php?action=clients</code></p>
            </div>
        </div>
    </div>
</body>
</html>`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-500" />
            How to Run this System on XAMPP (Apache + MySQL + PHP)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Step-by-step deployment guide and copy-paste files to host the platform on your local computer using XAMPP.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'instructions', label: '1. Step-by-Step XAMPP Setup' },
          { id: 'sql', label: '2. MySQL Database Schema (schema.sql)' },
          { id: 'db_php', label: '3. Database Config (db.php)' },
          { id: 'api_php', label: '4. PHP Backend API (api.php)' },
          { id: 'standalone_html', label: '5. Standalone Frontend (index.html)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Instructions */}
      {activeTab === 'instructions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
              <div className="w-6 h-6 rounded bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">1</div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Download &amp; Launch XAMPP</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Download XAMPP from <strong>apachefriends.org</strong>. Open the XAMPP Control Panel and click <strong>Start</strong> next to <strong>Apache</strong> and <strong>MySQL</strong>.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
              <div className="w-6 h-6 rounded bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Create MySQL Database</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Open browser at <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">http://localhost/phpmyadmin</code>. Click the <strong>SQL</strong> tab, copy the code from Tab 2, and press <strong>Go</strong> to build all tables.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
              <div className="w-6 h-6 rounded bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">3</div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Put Files in htdocs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Create a folder: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">C:\xampp\htdocs\gpu-sip</code>. Place <code className="text-cyan-600">db.php</code>, <code className="text-cyan-600">api.php</code>, and <code className="text-cyan-600">index.html</code> inside. Open <code className="font-semibold text-emerald-600">http://localhost/gpu-sip</code> in your browser!
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">Where Are the Files?</h4>
            <div className="space-y-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
              <div>📁 <strong>C:\xampp\htdocs\gpu-sip\</strong></div>
              <div className="pl-4">├── 📄 <strong>db.php</strong> (Connects to MySQL localhost)</div>
              <div className="pl-4">├── 📄 <strong>api.php</strong> (Handles client creation, GPU & DID requests, allocation)</div>
              <div className="pl-4">├── 📄 <strong>schema.sql</strong> (Tables and initial seed data)</div>
              <div className="pl-4">└── 📄 <strong>index.html</strong> (HTML UI for broker dashboard and client portal)</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SQL Schema */}
      {activeTab === 'sql' && (
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">schema_mysql.sql (Import in phpMyAdmin)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('schema_mysql.sql', MYSQL_SCHEMA_SQL)}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .sql</span>
              </button>
              <button
                onClick={() => handleCopy('sql', MYSQL_SCHEMA_SQL)}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1"
              >
                {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sql' ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
          </div>
          <pre className="p-4 text-emerald-300/90 overflow-x-auto leading-relaxed max-h-[500px]">
            {MYSQL_SCHEMA_SQL}
          </pre>
        </div>
      )}

      {/* Tab 3: db.php */}
      {activeTab === 'db_php' && (
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">db.php (Save in C:\xampp\htdocs\gpu-sip\db.php)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('db.php', DB_PHP_CODE)}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .php</span>
              </button>
              <button
                onClick={() => handleCopy('db_php', DB_PHP_CODE)}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1"
              >
                {copiedKey === 'db_php' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'db_php' ? 'Copied' : 'Copy PHP'}</span>
              </button>
            </div>
          </div>
          <pre className="p-4 text-cyan-300/90 overflow-x-auto leading-relaxed max-h-[500px]">
            {DB_PHP_CODE}
          </pre>
        </div>
      )}

      {/* Tab 4: api.php */}
      {activeTab === 'api_php' && (
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">api.php (Save in C:\xampp\htdocs\gpu-sip\api.php)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('api.php', API_PHP_CODE)}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .php</span>
              </button>
              <button
                onClick={() => handleCopy('api_php', API_PHP_CODE)}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1"
              >
                {copiedKey === 'api_php' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'api_php' ? 'Copied' : 'Copy PHP API'}</span>
              </button>
            </div>
          </div>
          <pre className="p-4 text-purple-300/90 overflow-x-auto leading-relaxed max-h-[500px]">
            {API_PHP_CODE}
          </pre>
        </div>
      )}

      {/* Tab 5: index.html */}
      {activeTab === 'standalone_html' && (
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">index.html (Save in C:\xampp\htdocs\gpu-sip\index.html)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('index.html', STANDALONE_HTML)}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .html</span>
              </button>
              <button
                onClick={() => handleCopy('html', STANDALONE_HTML)}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1"
              >
                {copiedKey === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'html' ? 'Copied' : 'Copy HTML'}</span>
              </button>
            </div>
          </div>
          <pre className="p-4 text-amber-300/90 overflow-x-auto leading-relaxed max-h-[500px]">
            {STANDALONE_HTML}
          </pre>
        </div>
      )}
    </div>
  );
};
