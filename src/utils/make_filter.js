module.exports = function (cond)
{
    let filters = []

    for (let key in cond)
    {
        let val = cond[key]
        let one = make_key_filter(key, val)

        filters.push(one)
    }

    return compose(filters)
}

function compose(arr)
{
    return function (...args)
    {
        for (let func of arr)
        {
            if (func(...args) == false)
            {
                return false
            }
        }
        return true
    }
}

/**
 * name : {$gt:1}
 * name : 1
 */
function make_key_filter(key, val)
{
    let filters = []
    if (typeof (val) == "object")       //里面的key 必然都是$开头
    {
        for (let cmd of val)
        {
            let filter = directives[cmd](key, val[cmd])

            filters.push(filter)
        }
    }
    else
    {
        filter = directives["$="](key, val)

        filters.push(filter)
    }

    return compose(filters)
}

const directives = {}

directives["$="] = (key, val) =>
{
    return (data) =>
    {
        return data[key] == val
    }
}

directives["$gt"] = (key, val) =>
{
    return (data) =>
    {
        let existed = data[key]
        if (existed == null)
        {
            return false
        }
        return existed > val
    }
}

directives["$lt"] = (key, val) =>
{
    return (data) =>
    {
        let existed = data[key]
        if (existed == null)
        {
            return false
        }
        return existed < val
    }
}

directives["$gte"] = (key, val) =>
{
    return (data) =>
    {
        let existed = data[key]
        if (existed == null)
        {
            return false
        }
        return existed >= val
    }
}

directives["$lte"] = (key, val) =>
{
    return (data) =>
    {
        let existed = data[key]
        if (existed == null)
        {
            return false
        }
        return existed <= val
    }
}