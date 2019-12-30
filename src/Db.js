const Collection = require("./Collection")

module.exports = class Db
{
    constructor(root, name)
    {
        this.root = root
        this.name = name
        this.collections = {}
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