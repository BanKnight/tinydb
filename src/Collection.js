const fs = require("fs-extra")
const path = require("path")
const genid = require("shortid").generate

const Cursor = require("./Cursor")
const make_updator = require("./utils/make_updator")

const empty = {}

module.exports = class Collection
{
    constructor(db, name)
    {
        this.db = db
        this.name = name
        this.path = path.join(this.db.path, `${this.name}.json`)

        this.meta = {}
        this.data = {}      //[_id] = row
        this.cmds = [this._load.bind(this)]

        this.doing = false
    }

    async find(cond, option)
    {
        return new Promise((resolve, reject) =>
        {
            this.cmds.push(async () =>
            {
                let cursor = this._query(cond, option)

                resolve(cursor)
            })

            this.do()
        })
    }

    async findOne(cond, option)
    {
        option = option || {}
        option.limit = 1

        return new Promise((resolve, reject) =>
        {
            this.cmds.push(async () =>
            {
                let cursor = this._query(cond, option)

                let ret = null

                if (cursor.hasNext())
                {
                    ret = cursor.next()
                }

                resolve(ret)
            })

            this.do()
        })
    }

    async createIndex(field, option)
    {

    }

    async updateOne(cond, operation, option)
    {
        option = option || empty

        return new Promise((resolve, reject) =>
        {
            this.cmds.push(async () =>
            {
                let cursor = this._query(cond, option)

                cursor.projection = make_updator(operation)     //修改project

                if (cursor.hasNext())
                {
                    cursor.next()
                }
                else if (option.upsert == true)
                {
                    let row = cursor.projection()

                    row._id = row._id || cond._id

                    if (row._id == null || typeof (row._id) == "object")
                    {
                        row._id = genid()
                    }

                    this.data[row._id] = row
                }

                this._save()

                resolve()

                return true
            })

            this.do()
        })
    }

    async updateMany(cond, operation, option)
    {
        this.cmds.push(async (resolve) =>
        {
            let cursor = this._query(cond, option)

            cursor.projection = make_updator(operation)     //修改project

            while (cursor.hasNext())
            {
                cursor.next()
            }

            resolve()

            return true
        })

        this.do()
    }

    async deleteOne(cond)
    {
        return new Promise((resolve, reject) =>
        {
            this.cmds.push(async () =>
            {
                let cursor = this._query(cond)

                for (let one of cursor.data)
                {
                    delete this.data[one._id]
                    break
                }
                resolve()

                return true

            })

            this.do()
        })
    }

    async deleteMany(cond)
    {
        return new Promise((resolve, reject) =>
        {
            this.cmds.push(async () =>
            {
                let cursor = this._query(cond)

                for (let one of cursor.data)
                {
                    delete this.data[one._id]
                }

                resolve()

                return true
            })

            this.do()
        })
    }

    async do()
    {
        if (this.doing == true)
        {
            return
        }
        this.doing = true

        let need_save = false

        while (this.cmds.length > 0)
        {
            let cmd = this.cmds.shift()

            if (await cmd() == true)
            {
                need_save = true
            }
        }

        if (need_save)
        {
            this._save()
        }

        this.doing = false
    }

    _query(cond, option)
    {
        option = option || empty

        const cursor = new Cursor(cond, option)

        cursor.travel(this.data)

        return cursor
    }

    async _load()
    {
        try
        {
            const collection = await fs.readJSON(this.path)

            this.meta = collection.meta
            this.data = collection.data
        }
        catch (e)
        {

        }
    }

    _save()
    {
        let content = { meta: this.meta, data: this.data }

        fs.writeJSONSync(this.path, content)
    }
}