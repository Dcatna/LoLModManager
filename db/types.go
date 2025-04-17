package db

type Champion struct {
	ID    string
	Name  string
	Image string
	Tags  []string
}

type DownloadedSkin struct {
	ID       string
	Name     string
	FilePath string
}

type Skins struct {
	ID         string
	Title      string
	Author     string
	Image      string
	Types      []string
	ItemLink   string
	TotalPages int
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
