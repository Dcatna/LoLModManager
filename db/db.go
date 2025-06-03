package db

import (
	"LoLModManager/sqlc"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	ctx  context.Context
	conn *sql.DB
	q    *sqlc.Queries
}

func New(ctx context.Context, conn *sql.DB, q *sqlc.Queries) *DB {
	return &DB{
		ctx:  ctx,
		conn: conn,
		q:    q,
	}
}

func skinFromDb(s sqlc.Skin) DownloadedSkin {
	return DownloadedSkin{
		ID:       strconv.Itoa(int(s.ID)),
		Name:     s.Name,
		FilePath: s.FilePath,
		IsActive: int(s.IsActive.Int64),
	}
}

func champFromDb(c sqlc.Champion) Champion {
	return Champion{
		ID:    c.ID,
		Name:  c.Name.String,
		Image: c.Image.String,
		Tags:  strings.Split(c.Tags.String, ","),
	}
}

func (db *DB) SyncChampions() error {
	count, err := db.q.SelectChampionsCount(db.ctx)
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

	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var champResponse struct {
		Data map[string]struct {
			ID    string   `json:"id"`
			Name  string   `json:"name"`
			Tags  []string `json:"tags"`
			Image struct {
				Full string `json:"full"`
			} `json:"image"`
		} `json:"data"`
	}

	json.Unmarshal(b, &champResponse)

	tx, err := db.conn.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, champ := range champResponse.Data {
		const query = `
			INSERT INTO champions(id, name, image, tags) 
			VALUES (?, ?, ?, ?)
			ON CONFLICT(id)
			DO UPDATE SET 
    			name = ?,
    			image = ?,
    			tags = ?;`

		if _, err := tx.ExecContext(db.ctx, query,
			champ.ID,
			champ.Name,
			champ.Image.Full,
			strings.Join(champ.Tags, ","),
			champ.Name,
			champ.Image.Full,
			strings.Join(champ.Tags, ","),
		); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (db *DB) GetChampions() ([]Champion, error) {
	champs, err := db.q.SelectChampions(db.ctx)
	if err != nil {
		return make([]Champion, 0), err
	}

	cpy := make([]Champion, len(champs))
	for i, c := range champs {
		cpy[i] = champFromDb(c)
	}

	return cpy, nil
}

func (db *DB) SetSkinActive(name string, active bool) error {

	activeInt := int64(0)
	if active {
		activeInt = 1
	}

	return db.q.UpdateSkinActive(db.ctx, sqlc.UpdateSkinActiveParams{
		Active: sql.NullInt64{
			Int64: activeInt,
			Valid: true,
		},
		Name: name,
	})
}

func (db *DB) GetActiveSkins() ([]string, error) {
	return db.q.SelectActiveSkinNames(db.ctx)
}

func (db *DB) DeleteSetting(key string) error {
	return db.q.DeleteSetting(db.ctx, key)
}

func (db *DB) SetSetting(key, value string) error {
	return db.q.SetSetting(db.ctx, sqlc.SetSettingParams{
		Key: key,
		Value: sql.NullString{
			String: value,
			Valid:  value != "",
		},
	})
}

func (db *DB) GetSetting(key string) (string, error) {
	s, err := db.q.GetSetting(db.ctx, key)
	if err != nil {
		return "", err
	}
	return s.String, nil
}

func (db *DB) FetchSkinsForChampionById(id string) ([]DownloadedSkin, error) {
	skins, err := db.q.FetchSkinsForChampionById(db.ctx, id)
	if err != nil {
		return make([]DownloadedSkin, 0), err
	}
	cpy := make([]DownloadedSkin, len(skins))
	for i, s := range skins {
		cpy[i] = skinFromDb(s)
	}
	return cpy, nil
}

func (db *DB) InsertSkin(name, path string) (int64, error) {
	return db.q.InsertSkin(db.ctx, sqlc.InsertSkinParams{
		Name:     name,
		FilePath: path,
	})
}

func (db *DB) LinkSkinToChampions(skinId int64, champs []Champion) error {

	errs := []error{}

	for _, champ := range champs {
		err := db.q.LinkSkinToChampions(db.ctx, sqlc.LinkSkinToChampionsParams{
			SkinID:     skinId,
			ChampionID: champ.ID,
		})
		errs = append(errs, err)
	}

	return errors.Join(errs...)
}

func (db *DB) GetChampionsForSkin(skinId int64) ([]Champion, error) {
	champs, err := db.q.SelectChampionsBySkinId(db.ctx, skinId)
	if err != nil {
		return make([]Champion, 0), err
	}

	cpy := make([]Champion, len(champs))
	for i, c := range champs {
		cpy[i] = champFromDb(c)
	}
	return cpy, nil
}

func (db *DB) DeleteSkin(skinId int64) error {
	tx, err := db.conn.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	qtx := db.q.WithTx(tx)

	filePath, err := qtx.SelectSkinFilePathById(db.ctx, skinId)
	if err != nil {
		return err
	}

	err = qtx.DeleteSkinChampionsBySkinId(db.ctx, skinId)
	if err != nil {
		return err
	}

	err = qtx.DeleteSkinById(db.ctx, skinId)
	if err != nil {
		return err
	}

	err = os.RemoveAll(filepath.Join(".", filePath))
	if err != nil {
		log.Printf("Warning: could not remove folder %s: %v\n", filePath, err)
		return err
	}

	return tx.Commit()
}
