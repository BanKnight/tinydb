const extend = require("extend2")

module.exports = function (option)
{
    if (option == null)
    {
        return _default
    }

    let black_mode = false

    for (let key in option)
    {
        let val = option[key]
        if (val == 0)            //option 是黑名单
        {
            black_mode = true
        }
        break
    }

    if (black_mode)
    {
        return (target) =>
        {
            let data = {}
            for (let key in target)
            {
                if (option[key] == null)
                {
                    data[key] = target[key]
                }
            }

            return extend(true, {}, data)
        }
    }

    return (target) =>
    {
        let data = {}
        for (let key in option)
        {
            data[key] = target[key]
        }

        return extend(true, {}, data)       //深拷贝
    }
}

function _default(target)
{
    return extend(true, {}, target)
}