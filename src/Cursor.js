const make_filter = require("./utils/make_filter")
const make_projection = require("./utils/make_projection")
const make_sorter = require("./utils/make_sorter")

module.exports = class Cursor
{
    constructor(cond, option)
    {
        this.cond = cond
        this.option = option

        this.filter = make_filter(cond)
        this.sorter = make_sorter(option.sort)
        this.projection = make_projection(option.projection)

        this.rpos = 0
        this.data = []
    }

    travel(data)
    {
        for (let _id in data)
        {
            let one = data[_id]

            if (this.filter(one) == true)
            {
                this.data.push(one)
            }
        }

        this.data.sort(this.sorter)

        if (this.option.limit && this.data.length > this.option.limit)
        {
            this.data = this.data.slice(0, this.option.limit)
        }
    }

    get count()
    {
        return this.data.length
    }

    hasNext()
    {
        return this.rpos < this.data.length
    }

    next()
    {
        let item = this.data[this.rpos++]

        return this.projection(item)
    }
    toArray()
    {
        let ret = []

        while (this.hasNext())
        {
            let one = this.next()

            ret.push(one)
        }

        return ret
    }
}