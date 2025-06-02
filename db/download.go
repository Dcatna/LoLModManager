package db

import (
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

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

func (db *DB) ImportSkin(characters []Champion, skinName string, fullPath string) error {
	fileName := filepath.Base(fullPath)

	savePath := filepath.Join("installed", fileName)

	from, err := os.Open(fullPath)
	if err != nil {
		return fmt.Errorf("failed to open fantome file: %w", err)
	}

	to, err := os.Create(savePath)
	if err != nil {
		from.Close()
		return fmt.Errorf("failed to create destination file: %w", err)
	}

	_, err = io.Copy(to, from)
	from.Close()
	to.Close()

	if err != nil {
		return fmt.Errorf("failed to copy fantome file: %w", err)
	}

	err = EnableSkin(savePath)
	if err != nil {
		return err
	}

	if err := os.Remove(savePath); err != nil {
		return err
	}

	skinInstallPath := filepath.Join("installed", getSkinFolderName(fileName))
	skinID, err := db.InsertSkin(skinName, skinInstallPath)
	if err != nil {
		return err
	}

	return db.LinkSkinToChampions(skinID, characters)
}
