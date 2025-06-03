package pref

import (
	"LoLModManager/db"
	"log"
	"sync"
	"sync/atomic"
)

type SqlitePrefs struct {
	db *db.DB

	keyWatchCh chan string

	closed   *atomic.Bool
	watchers map[string][]chan struct{}
	mutex    sync.RWMutex
}

func (s *SqlitePrefs) Close() error {
	s.closed.Swap(true)
	close(s.keyWatchCh)

	return nil
}

func (s *SqlitePrefs) Closed() bool {
	return s.closed.Load()
}

func NewSqlitePrefs(db *db.DB) PrefrenceDb {
	prefDb := &SqlitePrefs{
		db:       db,
		watchers: map[string][]chan struct{}{},
		mutex:    sync.RWMutex{},
		closed:   &atomic.Bool{},
	}

	go func() {

		defer func() {
			prefDb.mutex.Lock()
			for _, watchers := range prefDb.watchers {
				for _, watcher := range watchers {
					close(watcher)
				}
			}
			prefDb.watchers = map[string][]chan struct{}{}
			prefDb.mutex.Unlock()
		}()

		for {
			key, ok := <-prefDb.keyWatchCh
			// when db closed, the event will receive nil.
			if !ok {
				log.Println("The db is closed, so the watch channel is closed.")
				return
			}
			log.Printf("Get a new event: key%s \n", key)

			prefDb.mutex.RLock()
			go func() {
				defer prefDb.mutex.RUnlock()

				watchers := prefDb.watchers[key]
				for _, watcher := range watchers {
					watcher <- struct{}{}
				}
			}()
		}
	}()

	return prefDb
}

func (mp *SqlitePrefs) Delete(key []byte) error {
	err := mp.db.DeleteSetting(string(key))
	if err != nil {
		mp.keyWatchCh <- string(key)
	}
	return err
}

func (mp *SqlitePrefs) Exist(key []byte) (bool, error) {
	s, err := mp.db.GetSetting(string(key))
	if err != nil {
		return false, err
	}
	return s != "", nil
}

func (mp *SqlitePrefs) Get(key []byte) ([]byte, error) {
	s, err := mp.db.GetSetting(string(key))
	return []byte(s), err
}

func (mp *SqlitePrefs) Put(key, value []byte) error {
	err := mp.db.SetSetting(string(key), "")
	if err != nil {
		mp.keyWatchCh <- string(key)
	}
	return err
}

func (mp *SqlitePrefs) CreateWatcher(key []byte) <-chan struct{} {
	mp.mutex.Lock()
	defer mp.mutex.Unlock()

	watcher := make(chan struct{}, WATCH_BUFFER_SIZE)
	mp.watchers[string(key)] = append(mp.watchers[string(key)], watcher)

	return watcher
}

func (mp *SqlitePrefs) RemoveWatcher(key []byte, watcher <-chan struct{}) {
	mp.mutex.Lock()
	defer mp.mutex.Unlock()

	values := mp.watchers[string(key)]
	if len(values) == 1 {
		delete(mp.watchers, string(key))
		close(values[0])
	} else {
		for i, v := range values {
			if v == watcher {
				mp.watchers[string(key)] = append(values[:i], values[i+1:]...)
				close(v)
			}
		}
	}
}
