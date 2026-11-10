<?php
/**
 * api.php - Database Sync Engine for brickOS Songwriter & Lyric Coach
 * Connects directly to brickos.db on CT 120.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dbPath = __DIR__ . '/brickos.db';

if (!file_exists($dbPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Database file not found: ' . $dbPath]);
    exit;
}

try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

// GET ALL TRACKS
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get_tracks') {
    try {
        $stmt = $db->query("SELECT id, ep_id, title, genre, bpm, musical_key, vocal_archetype, lyrics, updated_at FROM tracks ORDER BY id ASC");
        $tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch version history for each track
        foreach ($tracks as &$t) {
            $vStmt = $db->prepare("SELECT version_id, lyrics, commit_reason, created_at FROM track_versions WHERE track_id = ? ORDER BY id ASC");
            $vStmt->execute([$t['id']]);
            $t['versions'] = $vStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode(['success' => true, 'tracks' => $tracks]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// SAVE / UPDATE TRACK
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'save_track') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || !isset($data['track_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing track_id or invalid JSON']);
        exit;
    }

    $trackId = $data['track_id'];
    $title = $data['title'] ?? null;
    $genre = $data['genre'] ?? null;
    $bpm = !empty($data['bpm']) ? intval($data['bpm']) : null;
    $epId = $data['ep_id'] ?? null;
    $vocalArchetype = $data['vocal_archetype'] ?? null;
    $lyrics = $data['lyrics'] ?? '';
    $versionSlot = $data['version_slot'] ?? 0; // 0, 1, or 2

    try {
        // 1. Update tracks table
        $updateFields = [];
        $params = [];

        if ($title !== null) { $updateFields[] = "title = ?"; $params[] = $title; }
        if ($genre !== null) { $updateFields[] = "genre = ?"; $params[] = $genre; }
        if ($bpm !== null) { $updateFields[] = "bpm = ?"; $params[] = $bpm; }
        if ($epId !== null) { $updateFields[] = "ep_id = ?"; $params[] = $epId; }
        if ($vocalArchetype !== null) { $updateFields[] = "vocal_archetype = ?"; $params[] = $vocalArchetype; }
        if ($lyrics !== null) { $updateFields[] = "lyrics = ?"; $params[] = $lyrics; }

        $updateFields[] = "updated_at = datetime('now')";

        $sql = "UPDATE tracks SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $params[] = $trackId;

        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        // 2. Also log snapshot in track_versions if saving a specific version (V2 or V3)
        if ($versionSlot > 0 && !empty($lyrics)) {
            $verLabel = 'V' . ($versionSlot + 1);
            $checkStmt = $db->prepare("SELECT id FROM track_versions WHERE track_id = ? AND version_id = ?");
            $checkStmt->execute([$trackId, $verLabel]);
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                $updVer = $db->prepare("UPDATE track_versions SET lyrics = ?, created_at = datetime('now') WHERE id = ?");
                $updVer->execute([$lyrics, $existing['id']]);
            } else {
                $insVer = $db->prepare("INSERT INTO track_versions (track_id, version_id, commit_reason, lyrics, created_at) VALUES (?, ?, ?, ?, datetime('now'))");
                $insVer->execute([$trackId, $verLabel, 'Lyric Coach Auto-Sync', $lyrics]);
            }
        }

        echo json_encode([
            'success' => true,
            'track_id' => $trackId,
            'message' => 'Synced to brickOS database successfully',
            'saved_at' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Invalid action or endpoint']);
