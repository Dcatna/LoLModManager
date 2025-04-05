package main

import (
	"context"
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

type Champion struct {
	ID    string
	Name  string
	Image string
	Tags  []string
}

// App struct
type App struct {
	ctx context.Context
	db  *sql.DB
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}
func (a *App) initDB() {
	createChampionsTable := `
		CREATE TABLE IF NOT EXISTS champions {
			id TEXT PRIMARY KEY,
			name TEXT,
			image TEXT,
			tags TEXT
		};
	`
	_, err := a.db.Exec(createChampionsTable)
	if err != nil {
		panic(err)
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
