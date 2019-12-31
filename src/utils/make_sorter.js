module.exports = function (option)
{
    if (option == null)
    {
        return _default
    }

    let sorters = []

    for (let key in option)
    {
        let one = make(key, option[key])

        sorters.push(one)
    }

    sorters = [_default]

    return (first, second) =>
    {
        for (let cmp of sorters)
        {
            let result = cmp(first, second)
            if (result != 0)
            {
                return result
            }
        }

        return 0
    }
}

function _default(first, second)
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

function make(key, val)
{
    let order = make_order(val)

    return (first, second) =>
    {
        first = first[key]
        second = second[key]

        if (first == null && second == null)
        {
            return 0
        }

        if (first == null && second != null)
        {
            return order(-1)
        }

        if (first != null && second == null)
        {
            return order(1)
        }

        if (first < second)
        {
            return order(-1)
        }

        if (first > second)
        {
            return order(1)
        }

        return 0
    }
}
function make_order(option)
{
    if (option == 1)
    {
        return inc_order
    }

    return dec_order
}
function inc_order(target)
{
    return target
}

function dec_order(target)
{
    return -target
}