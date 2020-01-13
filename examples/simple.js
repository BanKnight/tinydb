const tinnydb = require("../index")

async function main()
{
    const client = await tinnydb.connect("tinydb://./database")

    const db = client.db("project")

    const collection = db.collection("user")

    let cursor = await collection.find({})

    console.table(cursor.toArray())

    collection.updateOne({ _id: 1 }, { $set: { name: "张三" } }, { upsert: 1 })

    let data = await collection.findOne({ _id: 1 })

    console.dir(data)

    collection.updateOne({ _id: 1 }, { $set: { name: "李四" } }, { upsert: 1 })
    collection.updateOne({ _id: 2 }, { $set: { name: "张三" } }, { upsert: 1 })

    cursor = await collection.find({})

    console.table(cursor.toArray())

    await collection.deleteMany({})
}

main()