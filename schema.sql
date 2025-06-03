CREATE TABLE IF NOT EXISTS champions (
	id TEXT PRIMARY KEY,
	name TEXT,
	image TEXT,
	tags TEXT
);

CREATE TABLE IF NOT EXISTS skins (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	file_path TEXT NOT NULL,
	is_active INTEGER DEFAULT 0 -- 0 = inactive, 1 = active
);

CREATE TABLE IF NOT EXISTS skin_champions (
	skin_id INTEGER NOT NULL,
	champion_id TEXT NOT NULL,
	FOREIGN KEY (skin_id) REFERENCES skins(id),
	FOREIGN KEY (champion_id) REFERENCES champions(id),
	PRIMARY KEY (skin_id, champion_id)
);


CREATE TABLE IF NOT EXISTS settings (
	key TEXT PRIMARY KEY,
	value TEXT
);
