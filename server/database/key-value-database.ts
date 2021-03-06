export class KeyValueDatabase {

    private _database;

    constructor() {
        var PouchDB = require('pouchdb');
        PouchDB.plugin(require('pouchdb-adapter-memory'));
        this._database = new PouchDB("path-example", {adapter: 'memory'});
    }

    public async allDocs(entity:string) {
        let data = await this._database.allDocs({
            include_docs: true,
            startkey: entity,
            endkey: entity + '\uffff'
        });
        let result:any[] = [];
        for (let row of data["rows"]) {
            result.push(row["doc"]);
        }
        return result;
    }

    public create(entity:string, data:any) : Promise<any> {
        data._id = entity + '_' + this.generateUUID();
        return this._database.put(data);
    }

    public read(key:any) : Promise<any> {
        return this._database.get(key);
    }

    public update(key:any, data:any) : Promise<any> {
        let service = this;
        return service.read(key).then((doc) => {
            let updatedDoc: any = data;
            updatedDoc._rev = doc._rev;
            updatedDoc._id = doc._id;
            return service._database.put(updatedDoc);
        }).catch((err) => {
            data._id = key;
            return service._database.put(data);
        });
    }

    public delete(key:any) : Promise<any> {
        let service = this;
        return service.read(key).then((doc) => {
            return service._database.remove(doc);
        })
    }

    private generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

}