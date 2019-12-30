const fs = require("fs-extra")
const path = require("path")
const genid = require("shortid").generate

const make_updator = require("./make_updator")
const make_filter = require("./make_filter")

const make_sorter = require("./make_sorter")
const make_projection = require("./make_projection")

module.exports = class Collection
{
    constructor(db, name)
    {
        this.db = db
        this.name = name
        this.path = path.join(this.db.root, this.name)

        this.meta = {}
        this.data = {}
        this.indexes = {
            _id: {},
        }
        this.cmds = [this.load.bind(this)]

        this.doing = false
    }

    static cmp(first, second)
    {
        if (first._id < second._id)
        {
            return -1
        }

        if (first._id > second._id)
        {
            return 1
        }

        return 0
    }

    async find(cond, option)
    {
        return new Promise((resolve, reject) =>
        {
            this.cmds.push(async () =>
            {
                let ret = this._filter(cond, option)

                let projection = make_projection(option.projection)

                ret = ret.map(projection)

                resolve(ret)
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
                let ret = this._filter(cond, option)

                let projection = make_projection(option.projection)

                ret = ret.map(projection)

                if (ret.length > 0)
                {
                    ret = ret[0]
                }
                else
                {
                    ret = null
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
                let updator = make_updator(operation)

                let result = this._filter(cond, option)

                if (result.length > 0)
                {
                    updator(result[0])
                }
                else if (option.upsert == true)
                {
                    let row = updator()

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
            let updator = make_updator(operation)

            let result = this._filter(cond, option)

            if (result.length > 0)
            {
                for (let one of result)
                {
                    updator(one)
                }
            }
            else if (option.upsert == true)
            {
                let row = updator()

                row._id = row._id || genid()

                this.data[row._id] = row
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
                let result = this._filter(cond, filter)

                for (let one of result)
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
                let result = this._filter(cond, filter)

                for (let one of result)
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

    async load()
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

    _filter(cond, option)
    {
        let filter = make_filter(cond)
        let sorter = make_sorter(option.sort)

        let ret = []

        for (let _id in this.data)
        {
            let one = this.data[_id]

            if (filter(one) == true)
            {
                ret.push(one)
            }
        }

        ret.sort(sorter)

        if (option.limit)
        {
            ret = ret.slice(0, option.limit)
        }

        return ret
    }
}