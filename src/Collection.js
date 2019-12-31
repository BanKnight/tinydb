const fs = require("fs-extra")
const path = require("path")
const genid = require("shortid").generate

const make_updator = require("./make_updator")
const make_filter = require("./make_filter")
const make_projection = require("./utils/make_projection")
const make_sorter = require("./utils/make_sorter")

const empty = {}

module.exports = class Collection
{
    constructor(db, name)
    {
        this.db = db
        this.name = name
        this.path = path.join(this.db.root, this.name)

        this.meta = {}
        this.data = []
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
                    let row = cursor.projection

                    row._id = row._id || genid()

                    this.data[row._id] = row
                }

                resolve()
            })

            this.do()
        })
    }

    async updateMany(cond, operation, option)
    {
        this.cmds.push(async () =>
        {
            let cursor = this._query(cond, option)

            cursor.projection = make_updator(operation)     //修改project

            while (cursor.hasNext())
            {
                cursor.next()
            }

            resolve()
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

        while (this.cmds.length > 0)
        {
            let cmd = this.cmds.shift()

            await cmd()
        }

        this.doing = false
    }

    _query(cond, option)
    {
        const cursor = new Cursor(cond, option)

        cursor.travel(this.data)

        return cursor
    }

    async _load()
    {
        try
        {
            const content = await fs.readJSON(this.path)

            this.content = content
        }
        catch (e)
        {

        }
    }

    _save()
    {

    }
}