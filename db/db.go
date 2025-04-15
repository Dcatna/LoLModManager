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
	createSkinsTable(conn)
	createSettingsTable(conn)
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

func createSkinsTable(db *sql.DB) {
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS skins (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		file_path TEXT NOT NULL
	)
	`
	_, err := db.Exec(createTableSQL)
	if err != nil {
		panic(err)
	}

	createTableSQL2 := `
	CREATE TABLE IF NOT EXISTS skin_champions (
		skin_id INTEGER NOT NULL,
		champion_id INTEGER NOT NULL,
		FOREIGN KEY (skin_id) REFERENCES skins(id),
		FOREIGN KEY (champion_id) REFERENCES champions(id),
		PRIMARY KEY (skin_id, champion_id)
	)
	`
	_, err2 := db.Exec(createTableSQL2)
	if err2 != nil {
		panic(err2)
	}
}

func createSettingsTable(db *sql.DB) {
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS settings (
		key TEXT PRIMARY KEY,
		value TEXT
	)
	`
	_, err := db.Exec(createTableSQL)
	if err != nil {
		panic(err)
	}

}

func (db *DB) InsertSkin(name string, filePath string) (int64, error) {
	var existingID int64
	err := db.conn.QueryRow("SELECT id FROM skins WHERE name = ?", name).Scan(&existingID)
	if err == nil {
		return existingID, nil
	} else if err != sql.ErrNoRows {
		return 0, err
	}

	res, err := db.conn.Exec("INSERT INTO skins (name, file_path) VALUES (?, ?)", name, filePath)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (db *DB) LinkSkinToChampions(skinID int64, championIDs []Champion) error {
	tx, err := db.conn.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare("INSERT INTO skin_champions (skin_id, champion_id) VALUES (?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, champ := range championIDs {
		_, err := stmt.Exec(skinID, champ.ID)
		if err != nil {
			tx.Rollback()
			return err
		}
	}
	return tx.Commit()
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

func (db *DB) SeedChampions() error {
	var count int
	err := db.conn.QueryRow("SELECT COUNT(*) FROM champions").Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	resp, err := http.Get("https://ddragon.leagueoflegends.com/cdn/14.8.1/data/en_US/champion.json")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	var raw struct {
		Data map[string]struct {
			ID    string   `json:"id"`
			Name  string   `json:"name"`
			Tags  []string `json:"tags"`
			Image struct {
				Full string `json:"full"`
			} `json:"image"`
		} `json:"data"`
	}

	json.Unmarshal(body, &raw)

	tx, _ := db.conn.Begin()
	stmt, _ := tx.Prepare("INSERT INTO champions(id, name, image, tags) VALUES (?, ?, ?, ?)")
	defer stmt.Close()

	for _, champ := range raw.Data {
		tagsJSON, _ := json.Marshal(champ.Tags)
		_, _ = stmt.Exec(champ.ID, champ.Name, champ.Image.Full, string(tagsJSON))
	}

	tx.Commit()
	return nil
}
