package db

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type App struct {
	db *DB
}

func NewApp() *App {
	db := InitDB()
	return &App{db: db}
}

func (a *App) GetChampions(ctx context.Context) ([]Champion, error) {
	return a.db.GetChampions()
}

func (a *App) SeedChampions(ctx context.Context) error {
	return a.db.SeedChampions()
}

func (db *DB) SetSkinActive(skinName string, active bool) error {
	val := 0
	if active {
		val = 1
	}
	_, err := db.conn.Exec("UPDATE skins SET is_active = ? WHERE name = ?", val, skinName)
	return err
}

func (db *DB) GetActiveSkins() ([]string, error) {
	rows, err := db.conn.Query("SELECT name FROM skins WHERE is_active = 1")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var skins []string
	for rows.Next() {
		var name string
		rows.Scan(&name)
		skins = append(skins, name)
	}
	return skins, nil
}

func DownloadFile(url string, saveName string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("bad status: %s", resp.Status)
	}

	cd := resp.Header.Get("Content-Disposition")
	if cd != "" {
		_, params, err := mime.ParseMediaType(cd)
		if err == nil {
			if filename, ok := params["filename"]; ok {
				saveName = filename
			}
		}
	}

	savePath := filepath.Join(".", "installed", saveName)
	if err := os.MkdirAll(filepath.Dir(savePath), 0755); err != nil {
		return "", err
	}

	file, err := os.Create(savePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return "", err
	}

	return saveName, nil
}

func (db *DB) SetSetting(key, value string) error {
	_, err := db.conn.Exec(`
        INSERT INTO settings (key, value) 
        VALUES (?, ?) 
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `, key, value)
	return err
}

func (db *DB) GetSetting(key string) (string, error) {
	var value string
	err := db.conn.QueryRow("SELECT value FROM settings WHERE key = ?", key).Scan(&value)
	if err != nil {
		return "", nil
	}
	return value, err
}

func getSkinFolderName(filename string) string {
	return strings.TrimSuffix(filename, filepath.Ext(filename))
}

func (db *DB) DownloadSkin(downloadURL, saveName string, characters []Champion, skinName string) error {
	actualFilename, err := DownloadFile(downloadURL, saveName)
	if err != nil {
		return err
	}
	fmt.Printf("actualFilename: [%s]\n", actualFilename)

	fantomePath := filepath.Join("installed", actualFilename)

	err = EnableSkin(fantomePath)
	if err != nil {
		return err
	}

	err = os.Remove(fantomePath)
	if err != nil {
		return err
	}
	skinInstallPath := filepath.Join("installed", getSkinFolderName(actualFilename))

	skinID, err := db.InsertSkin(skinName, skinInstallPath)
	if err != nil {
		return err
	}

	return db.LinkSkinToChampions(skinID, characters)
}

func (db *DB) FetchSkinsForChampionById(id string) ([]DownloadedSkin, error) {
	query := `
		SELECT skins.id, skins.name, skins.file_path, skins.is_active
		FROM skins
		INNER JOIN skin_champions ON skins.id = skin_champions.skin_id
		WHERE skin_champions.champion_id = ?
	`

	rows, err := db.conn.Query(query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var skins []DownloadedSkin
	for rows.Next() {
		var skin DownloadedSkin
		if err := rows.Scan(&skin.ID, &skin.Name, &skin.FilePath, &skin.IsActive); err != nil {
			return nil, err
		}
		skins = append(skins, skin)
	}

	return skins, nil
}

func (db *DB) GetChampionsForSkin(skinID string) ([]Champion, error) {
	fmt.Println("GetChampionsForSkin:", skinID)

	// Convert skinID from string to int64
	skinIntID, err := strconv.ParseInt(skinID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid skinID: %v", err)
	}

	query := `
		SELECT c.id, c.name, c.image, c.tags
		FROM champions c
		INNER JOIN skin_champions sc ON c.id = sc.champion_id
		WHERE sc.skin_id = ?
	`

	rows, err := db.conn.Query(query, skinIntID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var champs []Champion
	for rows.Next() {
		var champ Champion
		var tagsStr string

		if err := rows.Scan(&champ.ID, &champ.Name, &champ.Image, &tagsStr); err != nil {
			return nil, err
		}
		err = json.Unmarshal([]byte(tagsStr), &champ.Tags)
		if err != nil {
			return nil, err
		}
		champs = append(champs, champ)
	}
	fmt.Println("Linked champions:", champs)
	return champs, nil
}

func (db *DB) DeleteSkin(skinID string) error {
	tx, err := db.conn.Begin()
	if err != nil {
		return err
	}

	var filePath string
	err = tx.QueryRow("SELECT file_path FROM skins WHERE id = ?", skinID).Scan(&filePath)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec("DELETE FROM skin_champions WHERE skin_id = ?", skinID)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec("DELETE FROM skins WHERE id = ?", skinID)
	if err != nil {
		tx.Rollback()
		return err
	}

	err = os.RemoveAll(filepath.Join(".", filePath))
	if err != nil {
		fmt.Printf("Warning: could not remove folder %s: %v\n", filePath, err)
	}

	return tx.Commit()
}
