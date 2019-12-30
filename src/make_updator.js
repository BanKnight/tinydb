
const extend = require("extend2")

module.exports = function (operation)
{
    let updators = []

    for (let key in operation)
    {
        let cmd = cmds[key]
        let val = operation[key]

        if (cmd)
        {
            updators.push(cmd(val))
        }
        else
        {
            updators.push(make_default(key, val))
        }
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

function make_default(key, val)
{
    return (data) =>
    {
        if (typeof (val) == "object")
        {
            val = extend(true, {}, val)
        }

        data[key] = val
    }
}

let cmds = {}

cmds["$set"] = (operation) =>
{
    let updators = []

    for (let key in operation)
    {
        let val = operation[key]

        updators.push(make_default(key, val))
    }

    let all = compose(updators)

    return (data) =>
    {
        data = data || {}

        all(data)

        return data
    }
}