
const fs = require("fs-extra")
const path = require("path")

const Db = require("./Db")
/**
 * file://c://abcdefg
 */
module.exports = class Client
{
    constructor(connect_str, option)
    {
        this.option = option
        this.root = "".substr(7)
        this.dbs = {}
    }

    async connect()
    {

        if (await fs.exists(this.root) == false)
        {
            await fs.mkdirp(this.root)
        }
    }

    db(name)
    {
        let one = this.dbs[name]
        if (one == null)
        {
            one = new Db(this.root, name)

            this.dbs[name] = one
        }

        return one
    }
}