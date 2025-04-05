package db

import (
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	conn *sql.DB
}

func InitDB() *DB {
	conn, err := sql.Open("sqlite3", "./lolskinmanager.db")
	if err != nil {
		panic(err)
	}
	createChampionsTable(conn)
	return &DB{conn: conn}
}

func createChampionsTable(db *sql.DB) {
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS champions (
		id TEXT PRIMARY KEY,
		name TEXT,
		image TEXT,
		tags TEXT
	);
	`
	_, err := db.Exec(createTableSQL)
	if err != nil {
		panic(err)
	}
}

func (db *DB) GetChampions() ([]Champion, error) {
	rows, err := db.conn.Query("SELECT id, name, image, tags FROM champions")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var champions []Champion
	for rows.Next() {
		var champ Champion
		rows.Scan(&champ.ID, &champ.Name, &champ.Image, &champ.Tags)
		champions = append(champions, champ)
	}
	return champions, nil
}

// Seeds champions from Riot API
func (db *DB) SeedChampions() error {
	var count int
	err := db.conn.QueryRow("SELECT COUNT(*) FROM champions").Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil // Already seeded
	}

	resp, err := http.Get("https://ddragon.leagueoflegends.com/cdn/14.8.1/data/en_US/champion.json")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	var raw struct {
		Data map[string]struct {
			ID   string   `json:"id"`
			Name string   `json:"name"`
			Tags []string `json:"tags"`
		} `json:"data"`
	}
	json.Unmarshal(body, &raw)

	tx, _ := db.conn.Begin()
	stmt, _ := tx.Prepare("INSERT INTO champions(id, name, image, tags) VALUES (?, ?, ?, ?)")
	defer stmt.Close()

	for _, champ := range raw.Data {
		tagsJSON, _ := json.Marshal(champ.Tags)
		_, _ = stmt.Exec(champ.ID, champ.Name, champ.ID+".png", string(tagsJSON))
	}

	tx.Commit()
	return nil
}
