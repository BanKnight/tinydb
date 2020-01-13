const path = require("path")
const fs = require("fs-extra")

const Collection = require("./Collection")

module.exports = class Db
{
    constructor(root, name)
    {
        this.root = root
        this.name = name
        this.path = path.join(this.root, this.name)
        this.collections = {}

        if (fs.existsSync(this.path) == false)
        {
            fs.mkdirpSync(this.path)
        }
    }

    collection(name)
    {
        let collection = this.collections[name]
        if (collection == null)
        {
            collection = new Collection(this, name)

            this.collections[name] = collection
        }

        return collection
    }
}