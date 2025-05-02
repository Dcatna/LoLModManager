package db

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

type ModManifest struct {
	Name     string            `json:"name"`
	Files    []string          `json:"files"`
	Mappings map[string]string `json:"mappings"`
}

func EnableSkin(fantomePath string) error {
	baseName := strings.TrimSuffix(filepath.Base(fantomePath), filepath.Ext(fantomePath))
	skinFolder := filepath.Join("installed", baseName)

	r, err := zip.OpenReader(fantomePath)
	if err != nil {
		return err
	}

	for _, file := range r.File {
		destPath := filepath.Join(skinFolder, file.Name)

		if file.FileInfo().IsDir() {
			err := os.MkdirAll(destPath, os.ModePerm)
			if err != nil {
				_ = r.Close()
				return err
			}
			continue
		} else {
			err := os.MkdirAll(filepath.Dir(destPath), os.ModePerm)
			if err != nil {
				_ = r.Close()
				return err
			}
		}

		src, err := file.Open()
		if err != nil {
			_ = r.Close()
			return err
		}

		dst, err := os.Create(destPath)
		if err != nil {
			_ = src.Close()
			_ = r.Close()
			return err
		}

		_, err = io.Copy(dst, src)

		_ = dst.Close()
		_ = src.Close()

		if err != nil {
			_ = r.Close()
			return err
		}
	}

	err = r.Close()
	if err != nil {
		return err
	}

	fmt.Println("Skin extracted to:", skinFolder)
	return nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}

func unzip(src, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	for _, f := range r.File {
		fPath := filepath.Join(dest, f.Name)
		if f.FileInfo().IsDir() {
			os.MkdirAll(fPath, 0755)
			continue
		}
		os.MkdirAll(filepath.Dir(fPath), 0755)
		outFile, err := os.Create(fPath)
		if err != nil {
			return err
		}
		rc, err := f.Open()
		if err != nil {
			return err
		}
		_, err = io.Copy(outFile, rc)
		rc.Close()
		outFile.Close()
		if err != nil {
			return err
		}
	}
	return nil
}
