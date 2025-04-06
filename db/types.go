package db

type Champion struct {
	ID    string
	Name  string
	Image string
	Tags  []string
}

type Skin struct {
	ID       string
	Title    string
	Author   string
	Image    string
	Types    []string
	ItemLink string
}
