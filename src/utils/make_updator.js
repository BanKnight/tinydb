
const extend = require("extend2")

/**
 * $set:{level:1}
 * $inc:{level:1}
 */
module.exports = function (operation)
{
    let updators = []

    for (let key in operation)
    {
        let val = operation[key]
        let directive = directives[key]

        if (directive == null)
        {
            throw new Error(`no such directive:${directive}`)
        }

        updators.push(directive(val))
    }

    let all = compose(updators)

    return (data) =>
    {
        data = data || {}

        all(data)

        return data
    }
}

function compose(arr)
{
    return function (...args)
    {
        for (let func of arr)
        {
            func(...args)
        }
    }
}

let directives = {}

directives["$set"] = (data) =>
{

    return (target) =>
    {
        target = target || {}

        target = extend(true, target, data)

        return target
    }
}

directives["$inc"] = (data) =>
{
    let travel = (to, from) =>
    {
        for (let name in from)
        {
            let val = from[name]
            let tp = typeof (val)

            let old = to[name]

            if (tp != "number")
            {
                old = old != null ? old : 0
                to[name] = old + val
            }
            else if (tp == "object")
            {
                old = old != null ? old : {}

                to[name] = old

                travel(old, val)
            }
        }
    }

    return (target) =>
    {
        target = target || {}

        travel(target, data)

        return target
    }
}