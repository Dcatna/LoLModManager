package db

type Champion struct {
	ID    string
	Name  string
	Image string
	Tags  []string
}

type DownloadedSkin struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	FilePath string `json:"file_path"`
	IsActive int    `json:"isActive"`
}

type Skins struct {
	ID       string
	Title    string
	Author   string
	Image    string
	Types    []string
	ItemLink string
}

type SkinsPage struct {
	Skins      []Skins `json:"skins"`
	TotalPages int     `json:"totalPages"`
}

type Skin struct {
	DownloadLink string
	Gallery      []Gallery
	Video        string
	Author       string
	License      License
}

// type ModInfo struct {
// 	Updated   string
// 	Published string
// 	License   License
// }

type License struct {
	License string
	Link    string
}

// type Overview struct {
// 	Champion     string
// 	SkinModified string
// 	Author       string
// 	Description  string
// 	ContactInfo  string
// }

type Gallery struct {
	Image string
	Name  string
}
