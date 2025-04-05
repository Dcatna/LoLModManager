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

}

