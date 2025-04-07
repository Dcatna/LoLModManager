export namespace db {
	
	export class Champion {
	    ID: string;
	    Name: string;
	    Image: string;
	    Tags: string[];
	
	    static createFrom(source: any = {}) {
	        return new Champion(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Name = source["Name"];
	        this.Image = source["Image"];
	        this.Tags = source["Tags"];
	    }
	}
	export class Gallery {
	    Image: string;
	    Name: string;
	
	    static createFrom(source: any = {}) {
	        return new Gallery(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Image = source["Image"];
	        this.Name = source["Name"];
	    }
	}
	export class License {
	    License: string;
	    Link: string;
	
	    static createFrom(source: any = {}) {
	        return new License(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.License = source["License"];
	        this.Link = source["Link"];
	    }
	}
	export class ModInfo {
	    Updated: string;
	    Published: string;
	    License: License;
	
	    static createFrom(source: any = {}) {
	        return new ModInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Updated = source["Updated"];
	        this.Published = source["Published"];
	        this.License = this.convertValues(source["License"], License);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Overview {
	    Champion: string;
	    SkinModified: string;
	    Author: string;
	    Description: string;
	    ContactInfo: string;
	
	    static createFrom(source: any = {}) {
	        return new Overview(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Champion = source["Champion"];
	        this.SkinModified = source["SkinModified"];
	        this.Author = source["Author"];
	        this.Description = source["Description"];
	        this.ContactInfo = source["ContactInfo"];
	    }
	}
	export class Skin {
	    DownloadLink: string;
	    Gallery: Gallery[];
	    Video: string;
	    Overview: Overview;
	    ModInfo: ModInfo;
	
	    static createFrom(source: any = {}) {
	        return new Skin(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.DownloadLink = source["DownloadLink"];
	        this.Gallery = this.convertValues(source["Gallery"], Gallery);
	        this.Video = source["Video"];
	        this.Overview = this.convertValues(source["Overview"], Overview);
	        this.ModInfo = this.convertValues(source["ModInfo"], ModInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Skins {
	    ID: string;
	    Title: string;
	    Author: string;
	    Image: string;
	    Types: string[];
	    ItemLink: string;
	
	    static createFrom(source: any = {}) {
	        return new Skins(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Title = source["Title"];
	        this.Author = source["Author"];
	        this.Image = source["Image"];
	        this.Types = source["Types"];
	        this.ItemLink = source["ItemLink"];
	    }
	}

}

