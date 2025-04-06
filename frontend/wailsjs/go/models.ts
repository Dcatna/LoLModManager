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
	export class Skin {
	    ID: string;
	    Title: string;
	    Author: string;
	    Image: string;
	    Types: string[];
	    ItemLink: string;
	
	    static createFrom(source: any = {}) {
	        return new Skin(source);
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

