-- name: InsertSkin :one
INSERT OR IGNORE INTO skins (name, file_path) 
VALUES (:name, :filePath)
RETURNING id;

-- name: LinkSkinToChampions :exec
INSERT OR IGNORE INTO skin_champions(skin_id, champion_id) 
VALUES (?, ?);

-- name: SelectChampions :many
SELECT id, name, image, tags 
FROM champions;

-- name: InsertOrUpdateChampion :exec
INSERT INTO champions(id, name, image, tags) 
VALUES (:id, :name, :image, :tags)
ON CONFLICT(id)
DO UPDATE SET 
    name = :name,
    image = :image,
    tags = :tags;

-- name: SelectChampionsCount :one 
SELECT COUNT(*) FROM champions;

-- name: UpdateSkinActive :exec
UPDATE skins SET is_active = :active WHERE name = :name;

-- name: SelectActiveSkinNames :many
SELECT name FROM skins WHERE is_active = 1;

-- name: SetSetting :exec
INSERT INTO settings (key, value) 
VALUES (?, ?) 
ON CONFLICT(key) DO UPDATE SET value = excluded.value;

-- name: GetSetting :one
SELECT value FROM settings WHERE key = :key;

-- name: DeleteSetting :exec
DELETE FROM settings WHERE key = :key;

-- name: FetchSkinsForChampionById :many
SELECT skins.id, skins.name, skins.file_path, skins.is_active
FROM skins
INNER JOIN skin_champions ON skins.id = skin_champions.skin_id
WHERE skin_champions.champion_id = :id;

-- name: SelectChampionsBySkinId :many
SELECT c.id, c.name, c.image, c.tags
FROM champions c
INNER JOIN skin_champions sc ON c.id = sc.champion_id
WHERE sc.skin_id = :skinId;

-- name: SelectSkinFilePathById :one 
SELECT file_path FROM skins WHERE id = ?;

-- name: DeleteSkinChampionsBySkinId :exec
DELETE FROM skin_champions WHERE skin_id = ?;

-- name: DeleteSkinById :exec
DELETE FROM skins WHERE id = ?;