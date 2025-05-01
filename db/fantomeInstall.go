package db

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
)

type ModManifest struct {
	Name     string            `json:"name"`
	Files    []string          `json:"files"`
	Mappings map[string]string `json:"mappings"`
}

func EnableFantomeSkin(fantomePath, installedDir string) error {
	fmt.Println("Installing skin from:", fantomePath)

	// Step 1: Extract to a temp directory
	tempDir := filepath.Join(os.TempDir(), "fantome_temp")
	os.RemoveAll(tempDir)
	os.MkdirAll(tempDir, 0755)

	if err := unzip(fantomePath, tempDir); err != nil {
		return fmt.Errorf("failed to unzip: %w", err)
	}

	// Step 2: Read META/info.json
	infoPath := filepath.Join(tempDir, "META", "info.json")
	infoBytes, err := os.ReadFile(infoPath)
	if err != nil {
		return fmt.Errorf("META/info.json not found: %w", err)
	}

	var manifest ModManifest
	if err := json.Unmarshal(infoBytes, &manifest); err != nil {
		return fmt.Errorf("invalid info.json: %w", err)
	}

	// Step 3: Create target mod folder in installed/
	modInstallDir := filepath.Join(installedDir, manifest.Name)
	os.RemoveAll(modInstallDir)
	os.MkdirAll(modInstallDir, 0755)

	// Step 4: Copy all extracted files into installed/<modName>/
	err = filepath.Walk(tempDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		relPath, _ := filepath.Rel(tempDir, path)
		destPath := filepath.Join(modInstallDir, relPath)

		if info.IsDir() {
			return os.MkdirAll(destPath, 0755)
		}
		return copyFile(path, destPath)
	})
	if err != nil {
		return fmt.Errorf("failed to copy extracted files: %w", err)
	}

	// Step 5: Run wad-make on the WAD folder
	wadInput := filepath.Join(modInstallDir, "WAD")
	wadOutput := filepath.Join(modInstallDir, manifest.Name+".wad.client")

	wadMake := filepath.Join(".", "tools", "wad-make.exe")

	cmd := exec.Command(wadMake, "-i", wadInput, "-o", wadOutput)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	fmt.Println("Running wad-make...")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("wad-make failed: %w", err)
	}

	fmt.Println("Installed mod into:", modInstallDir)
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
