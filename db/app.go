package db

import (
	"context"
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
