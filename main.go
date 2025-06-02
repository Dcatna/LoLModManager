package main

import (
	"LoLModManager/db"
	"LoLModManager/sqlc"
	"context"
	"database/sql"
	"embed"
	"log"
	"path/filepath"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	_ "github.com/mattn/go-sqlite3"
)

//go:embed schema.sql
var ddl string

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	ctx := context.Background()

	conn, err := sql.Open("sqlite3", filepath.Join(".", "lolskinmanager.db"))
	if err != nil {
		log.Fatal(err)
	}

	// create tables
	if _, err := conn.ExecContext(ctx, ddl); err != nil {
		log.Fatal(err)
	}

	queries := sqlc.New(conn)
	db := db.New(ctx, conn, queries)
	// Create an instance of the app structure
	app := NewApp(db)

	// Create application with options
	err = wails.Run(&options.App{
		Title:             "LoLModManager",
		Width:             1024,
		Height:            768,
		MinWidth:          1024,
		MinHeight:         768,
		MaxWidth:          3840,
		MaxHeight:         2160,
		DisableResize:     false,
		Fullscreen:        false,
		Frameless:         false,
		StartHidden:       false,
		HideWindowOnClose: false,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []any{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
