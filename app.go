package main

import (
	"LoLModManager/db"
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	_ "github.com/mattn/go-sqlite3"
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
func (a *App) GetChampions() ([]db.Champion, error) {
	return a.db.GetChampions()
}

func (a *App) GetSkins() []db.Skins {
	res, err := http.Get("https://runeforge.dev/mods?categories[0]=champion_skin&onlyGilded=false&search=&sortBy=recently_published")
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
	var skins []db.Skins

	doc.Find("div.group.flex.w-full.flex-col.rounded-xl.border").Each(func(i int, s *goquery.Selection) {

		img := s.Find("img.aspect-video").AttrOr("src", "")
		title := s.Find("a.text-lg.font-bold").Text()
		author := s.Find("a.underline.gap-2").Text()

		var types []string
		s.Find("div.h-fit.cursor-pointer.rounded-md").Each(func(i int, t *goquery.Selection) {
			typeText := t.Text()
			types = append(types, typeText)
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

	return skins
}

func (a *App) GetSkinDetails(url string) db.Skin {
	fmt.Println(url)
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

		var overview db.Overview
		contactInfo := strings.TrimSpace(s.Find("p.my-2").Text())
		overview.ContactInfo = contactInfo

		s.Find("div.break-words ul li").Each(func(i int, li *goquery.Selection) {
			label := li.Find("strong").Text()
			value := strings.TrimSpace(strings.Replace(li.Text(), label, "", 1))

			switch {
			case strings.Contains(label, "Champion"):
				overview.Champion = value
			case strings.Contains(label, "Skin modified"):
				overview.SkinModified = value
			case strings.Contains(label, "Author"):
				overview.Author = value
			default:
				overview.Description += value + " "
			}
		})

		var modInfo db.ModInfo
		s.Find("div.flex.flex-col.gap-1.rounded-lg").Each(func(i int, info *goquery.Selection) {
			spans := info.Find("span.flex.flex-row.items-center.justify-center.gap-2")
			updated := spans.Eq(0).Parent().Find("span").Eq(1).Text()
			published := spans.Eq(1).Parent().Find("span").Eq(1).Text()

			licenseContainer := info.Find("a.flex.h-fit.items-center")
			licenseText := licenseContainer.Find("span.max-w-[250px].truncate").Text()
			licenseLink, _ := licenseContainer.Attr("href")

			modInfo.Updated = strings.TrimSpace(updated)
			modInfo.Published = strings.TrimSpace(published)
			modInfo.License = db.License{
				License: strings.TrimSpace(licenseText),
				Link:    strings.TrimSpace(licenseLink),
			}
		})

		skin.DownloadLink = downloadLink
		skin.Gallery = gallery
		skin.Video = video
		skin.Overview = overview
		skin.ModInfo = modInfo
	})

	return skin
}

func (a *App) GetGalleryForSkin(url string) []db.Gallery {
	fmt.Println(url)
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
