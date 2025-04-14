package db

import (
	"context"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
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

func DownloadFile(url string, saveName string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
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

	savePath := filepath.Join(".", "skins", saveName)
	if err := os.MkdirAll(filepath.Dir(savePath), 0755); err != nil {
		return err
	}

	file, err := os.Create(savePath)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return err
	}

	return nil
}

func DownloadSkin(downloadURL, saveName string, characters []Champion) error {
	savePath := filepath.Join(".", "skins", saveName)
	fmt.Println(characters)
	if err := os.MkdirAll(filepath.Dir(savePath), 0755); err != nil {
		return err
	}

	return DownloadFile(downloadURL, savePath)
}
