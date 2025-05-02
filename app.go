package main

import (
	"LoLModManager/db"
	"LoLModManager/util"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	_ "github.com/mattn/go-sqlite3"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
	db  *db.DB
}

// NewApp creates a new App application struct
func NewApp() *App {
	db := db.InitDB()
	return &App{db: db}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	runtime.LogInfo(ctx, "Starting Mod Manager")

	db.InitDB()
	err := a.db.SeedChampions()

	if err != nil {
		runtime.LogError(ctx, "Failed to seed: "+err.Error())
	}

}

func (a *App) RunCSLOLInjector() error {
	injectorPath := "./cslol-patcher/cslol-inj.exe"
	profilePath := "./profiles/Default Profile/"

	cmd := exec.Command(injectorPath, profilePath)
	err := cmd.Start()
	fmt.Println(err)
	if err != nil {
		return fmt.Errorf("failed to run cslol-injector: %v", err)
	}

	return nil
}

func (a *App) RunPatcher(activeSkins []string) {
	fmt.Println("skins:", activeSkins)
	if err := WriteProfileFile(activeSkins); err != nil {
		fmt.Println("failed to write profile file:", err)
		return
	}
	skins := strings.Join(activeSkins, "/")

	gameDir, err := a.db.GetSetting("league_path")
	if err != nil {
		fmt.Println("failed to get league path:", err)
		return
	}

	installDir := "./installed"
	profileDir := "./installed/Default Profile"
	modToolsPath := "tools/mod-tools.exe"
	configPath := "profiles/Default Profile.config"

	cmdCtx := context.Background()
	cmderMk := util.NewCmder(modToolsPath, cmdCtx).
		SetDir(".").
		AddVArg("mkoverlay").
		AddVArg(installDir).
		AddVArg(profileDir).
		AddVArg(fmt.Sprintf("--game:%s", gameDir)).
		AddVArg(fmt.Sprintf("--mods:%s", skins))

	cmderMk.WithOutFn(func(b []byte) (int, error) {
		line := string(b)
		fmt.Print("mkoverlay output: ", line)
		return len(b), nil
	})

	cmderMk.WithErrFn(func(b []byte) (int, error) {
		line := string(b)
		fmt.Print("mkoverlay output: ", line)
		return len(b), nil
	})

	if err := cmderMk.Run(nil); err != nil {
		fmt.Println("mkoverlay failed:", err)
		return
	}
	fmt.Println("mkoverlay completed")

	ctxRun := context.Background()
	cmderRun := util.NewCmder(modToolsPath, ctxRun).
		SetDir(".").
		AddVArg("runoverlay").
		AddVArg(profileDir).
		AddVArg(configPath).
		AddVArg(fmt.Sprintf("--game:%s", gameDir))

	cmderRun.WithOutFn(func(b []byte) (int, error) {
		line := string(b)
		fmt.Print("runoverlay: ", line)

		return len(b), nil
	})

	cmderRun.WithErrFn(func(b []byte) (int, error) {
		line := string(b)
		fmt.Print("runoverlay err: ", line)
		return len(b), nil
	})

	fmt.Println("launching runoverlay and waiting for it to finish...")
	err = cmderRun.Run(nil)
	if err != nil {
		fmt.Println("runoverlay failed:", err)
		return
	}
	fmt.Println("injection completed successfully")
}

func WriteProfileFile(skinNames []string) error {
	profileDir := "profiles"
	err := os.MkdirAll(profileDir, os.ModePerm)
	if err != nil {
		return err
	}

	profilePath := filepath.Join(profileDir, "Default Profile.profile")

	content := strings.Join(skinNames, "\n")

	err = os.WriteFile(profilePath, []byte(content), 0644)
	if err != nil {
		return err
	}

	return nil
}

func BuildOverlay(modToolsPath, installedDir, profileDir, gameDir string, selectedMods string) error {

	cmd := exec.Command(
		modToolsPath,
		"mkoverlay",
		installedDir,
		profileDir,
		fmt.Sprintf("--game:%s", gameDir),
		fmt.Sprintf("--mods:%s", selectedMods),
	)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	fmt.Println("Running:", cmd.String())

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("mod-tools mkoverlay failed: %w", err)
	}

	return nil
}

func RunOverlay(modTooslPath string, gameDir string, profileDir string) error {
	config := "profiles/Default Profile.config"
	fmt.Println(config, "CONGID")
	cmd := exec.Command(
		modTooslPath,
		"runoverlay",
		profileDir,
		config,
		fmt.Sprintf("--game:%s", gameDir),
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	fmt.Println("Running:", cmd.String())

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("mod-tools mkoverlay failed: %w", err)
	}

	return nil
}

func (a *App) DownloadSkin(downloadURL, saveName string, champions []db.Champion, skinName string) error {
	return a.db.DownloadSkin(downloadURL, saveName, champions, skinName)
}
func (a *App) GetChampions() ([]db.Champion, error) {
	return a.db.GetChampions()
}
func (a *App) FetchSkinsForChampionById(id string) ([]db.DownloadedSkin, error) {
	return a.db.FetchSkinsForChampionById(id)
}
func (a *App) SetSetting(key, value string) error {
	return a.db.SetSetting(key, value)
}
func (a *App) GetSetting(key string) (string, error) {
	return a.db.GetSetting(key)
}

func (a *App) FindLeaugeDownload() (string, error) {
	var folderPath string
	var wantedFolder = "Game"
	err := filepath.WalkDir("C:\\Riot Games\\League of Legends\\", func(path string, d os.DirEntry, err error) error {

		if err != nil {
			return err
		}

		if d.IsDir() && d.Name() == wantedFolder {
			folderPath = path
			fmt.Println("FOUND")
			return filepath.SkipDir
		}

		return nil
	})

	if err != nil {
		return "", err
	}

	if folderPath == "" {
		return "", fmt.Errorf("could not find League of Legends folder")
	}

	err = a.db.SetSetting("league_path", folderPath)

	if err != nil {
		return "", fmt.Errorf("found League folder but failed to save setting: %w", err)
	}
	return folderPath, err
}

func (a *App) BrowseLeagueFolder() (string, error) {
	return a.OpenDirectoryDialog("Select League of Legends Folder", nil)
}

func (a *App) OpenMultipleFilesDialog(display string, filters []string) ([]string, error) {
	return runtime.OpenMultipleFilesDialog(
		a.ctx,
		runtime.OpenDialogOptions{
			Filters: []runtime.FileFilter{
				{
					DisplayName: display,
					Pattern:     strings.Join(filters, ";"),
				},
			},
		})
}

func (a *App) OpenDirectoryDialog(display string, filters []string) (string, error) {
	return runtime.OpenDirectoryDialog(
		a.ctx,
		runtime.OpenDialogOptions{
			Filters: []runtime.FileFilter{
				{
					DisplayName: display,
					Pattern:     strings.Join(filters, ";"),
				},
			},
		})
}

func (a *App) EnableSkin(filePath string) error {
	// destDir := "C:\\Riot Games\\League of Legends\\Game\\Mods\\CharacterSkins\\Custom"
	// baseName := filepath.Base(filePath)
	// destPath := filepath.Join(destDir, baseName)

	// if err := os.MkdirAll(destDir, 0755); err != nil {
	// 	return fmt.Errorf("failed to create destination directory: %w", err)
	// }

	// info, err := os.Stat(filePath)
	// if err != nil {
	// 	fmt.Println("File stat error:", err)
	// 	return err
	// }
	// fmt.Println("File exists?", filePath, info.IsDir())

	// if info.IsDir() {
	// 	fmt.Println("Copying directory:", filePath)
	// 	return copyDir(filePath, destPath)
	// } else {
	// 	fmt.Println("Copying file:", filePath)
	// 	return copyFile(filePath, destPath)
	// }
	return nil
}

func (a *App) DisableSkin(filePath string) error {
	destDir := "C:\\Riot Games\\League of Legends\\Game\\Mods\\CharacterSkins\\Custom"
	baseName := filepath.Base(filePath)
	targetPath := filepath.Join(destDir, baseName)

	return os.RemoveAll(targetPath)
}
func copyDir(src string, dst string) error {
	entries, err := os.ReadDir(src)
	if err != nil {
		return err
	}

	if err := os.MkdirAll(dst, 0755); err != nil {
		return err
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		info, err := entry.Info()
		if err != nil {
			return err
		}

		if info.IsDir() {
			if err := copyDir(srcPath, dstPath); err != nil {
				return err
			}
		} else {
			in, err := os.Open(srcPath)
			if err != nil {
				return err
			}
			defer in.Close()

			out, err := os.Create(dstPath)
			if err != nil {
				return err
			}
			defer out.Close()

			if _, err = io.Copy(out, in); err != nil {
				return err
			}
		}
	}
	return nil
}

func (a *App) GetSkins(search string, page int) db.SkinsPage {
	url := fmt.Sprintf(`https://runeforge.dev/mods?categories[0]=champion_skin&onlyGilded=false&page=%d&search=%s&sortBy=recently_published`, page, search)

	res, err := http.Get(url)
	if err != nil {
		log.Println("Failed to fetch skins:", err)
		return db.SkinsPage{}
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		log.Printf("status code error: %d %s", res.StatusCode, res.Status)
		return db.SkinsPage{}
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Println("Failed to parse HTML:", err)
		return db.SkinsPage{}
	}

	var skins []db.Skins
	totalPages := 1

	doc.Find("button.w-\\[30px\\]").Each(func(i int, s *goquery.Selection) {
		text := s.Text()
		if pageNum, err := strconv.Atoi(strings.TrimSpace(text)); err == nil && pageNum > totalPages {
			totalPages = pageNum
		}
	})

	doc.Find("div.group.flex.w-full.flex-col.rounded-xl.border").Each(func(i int, s *goquery.Selection) {
		img := s.Find("img.aspect-video").AttrOr("src", "")
		title := s.Find("a.text-lg.font-bold").Text()
		author := s.Find("a.underline.gap-2").Text()

		var types []string
		s.Find("div.h-fit.cursor-pointer.rounded-md").Each(func(i int, t *goquery.Selection) {
			types = append(types, t.Text())
		})

		itemLink := s.Find("a.underline-offset-2.inline-flex").AttrOr("href", "")
		id := strings.TrimPrefix(itemLink, "/mods/")

		skins = append(skins, db.Skins{
			ID:       id,
			Title:    title,
			Image:    img,
			Author:   author,
			Types:    types,
			ItemLink: itemLink,
		})
	})

	return db.SkinsPage{
		Skins:      skins,
		TotalPages: totalPages,
	}
}

func (a *App) GetSkinDetails(url string) db.Skin {

	res, err := http.Get("https://runeforge.dev" + url)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		log.Fatalf("status code error: %d %s", res.StatusCode, res.Status)
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Fatal(err)
	}

	var skin db.Skin

	doc.Find("main.flex.flex-1.items-start").Each(func(i int, s *goquery.Selection) {
		downloadLink := "https://runeforge.dev" + s.Find("a.flex.h-fit.transition-all").AttrOr("href", "")
		gallery := a.GetGalleryForSkin(url + "/gallery")
		video := s.Find("iframe.aspect-video.h-full.w-full").AttrOr("src", "")

		// contactInfo := strings.TrimSpace(s.Find("p.my-2").Text())
		// overview.ContactInfo = contactInfo

		author := strings.TrimSpace(s.Find("p.text-lg.font-bold").First().Text())
		skin.Author = author

		// s.Find("div.break-words ul li").Each(func(i int, li *goquery.Selection) {
		// 	label := li.Find("strong").Text()
		// 	value := strings.TrimSpace(strings.Replace(li.Text(), label, "", 1))

		// 	switch {
		// 	case strings.Contains(label, "Champion"):
		// 		overview.Champion = value
		// 	case strings.Contains(label, "Skin modified"):
		// 		overview.SkinModified = value
		// 	default:
		// 		overview.Description += value + " "
		// 	}
		// })

		var license db.License
		s.Find("div.flex.flex-col.gap-1.rounded-lg").Each(func(i int, info *goquery.Selection) {
			// spans := info.Find("span.flex.flex-row.items-center.justify-center.gap-2")
			// updated := spans.Eq(0).Parent().Find("span").Eq(1).Text()
			// published := spans.Eq(1).Parent().Find("span").Eq(1).Text()

			licenseContainer := info.Find("a.flex.h-fit.items-center")
			licenseText := licenseContainer.Find("span.max-w-[250px].truncate").Text()
			licenseLink, _ := licenseContainer.Attr("href")

			// modInfo.Updated = strings.TrimSpace(updated)
			// modInfo.Published = strings.TrimSpace(published)
			license = db.License{
				License: strings.TrimSpace(licenseText),
				Link:    strings.TrimSpace(licenseLink),
			}
		})

		skin.DownloadLink = downloadLink
		skin.Gallery = gallery
		skin.Video = video
		skin.License = license
	})

	return skin
}

func (a *App) GetGalleryForSkin(url string) []db.Gallery {

	res, err := http.Get("https://runeforge.dev" + url)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		log.Fatalf("status code error: %d %s", res.StatusCode, res.Status)
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Fatal(err)
	}

	var images []db.Gallery

	doc.Find("div.relative.col-span-12.flex.flex-col.rounded-xl.border").Each(func(i int, s *goquery.Selection) {
		image := s.Find("img").AttrOr("src", "")
		name := s.Find("div.p-5 p.text-lg.font-bold").Text()
		images = append(images, db.Gallery{
			Image: image,
			Name:  name,
		})
	})

	return images
}
