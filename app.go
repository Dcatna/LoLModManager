package main

import (
	"context"

	"LoLModManager/db"
	"fmt"

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
