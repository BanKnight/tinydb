const tinnydb = require("../index")

async function main()
{
    const client = await tinnydb.connect("tinnydb://./database")

    const db = client.db("project")

    const collection = db.collection("user")

    collection.updateOne({ _id: 1 }, { $set: { name: "张三" } }, { upsert: 1 })

    const data = await collection.findOne({ _id: 1 })

    console.dir(data)
}

main()