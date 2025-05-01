export interface Champ {
	ID: string,
	Name: string,
	Image: string,
	Tags: string[]
}

export interface ChampCard {
	ID: string,
	Name: string,
	Image: string,
	Tags: string[],
	updateActiveSkins: (skin: string, addOrRemove: string) => void
}

export interface DownloadedSkin {
	ID: string,
	Name: string,
	FilePath: string
}

export interface Skins {
    ID:       string
	Title:    string
	Author:   string
	Image:    string
	Types:    string[]
	ItemLink: string
}

export interface SkinsPage {
	Skins: Skins[];
	TotalPages: number;
}

export interface Skin {
	DownloadLink: string;
	Gallery: Gallery[];
	Video: string;
	Author: string
	License: License
  }
  
  export interface Gallery {
	Image: string;
	Name: string;
  }
  
//   export interface Overview {
// 	Champion: string;
// 	SkinModified: string;
// 	Author: string;
// 	Description: string;
// 	ContactInfo: string;
//   }
  
//   export interface ModInfo {
// 	Updated: string;
// 	Published: string;
// 	License: License;
//   }
  
  export interface License {
	License: string;
	Link: string;
  }
  