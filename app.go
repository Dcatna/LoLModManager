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

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {

	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) GetSkins() []db.Skin {
	res, err := http.Get("https://runeforge.dev/mods?onlyGilded=false&search=&sortBy=recently_published")
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
	var skins []db.Skin

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
		skins = append(skins, db.Skin{
			ID:       id,
			Title:    title,
			Image:    img,
			Author:   author,
			Types:    types,
			ItemLink: itemLink,
		})
	})

	for _, skin := range skins {
		fmt.Println("Title:", skin.Title)
		fmt.Println("Image:", skin.Image)
		fmt.Println("Author:", skin.Author)
		fmt.Println("Types:", skin.Types)
		fmt.Println()
	}
	return skins
}
