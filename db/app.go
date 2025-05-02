package db

import (
	"context"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
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
		SELECT skins.id, skins.name, skins.file_path
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
		if err := rows.Scan(&skin.ID, &skin.Name, &skin.FilePath); err != nil {
			return nil, err
		}
		skins = append(skins, skin)
	}

	return skins, nil
}
