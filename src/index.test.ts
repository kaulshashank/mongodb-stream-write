import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { assert } from "chai";

import { clone } from "./index";

describe("clone()", function () {
    let mongod: MongoMemoryServer;
    let client: MongoClient;
    before("Mock database", async function () {
        mongod = await MongoMemoryServer.create();

        const uri = mongod.getUri();

        client = await MongoClient.connect(uri);

        await Promise.all([
            client.db().createCollection("source"),
            client.db().createCollection("target")
        ]);
    });

    beforeEach("Seed", async function () {
        await Promise.all([
            client.db().collection("source").deleteMany({}),
            client.db().collection("target").deleteMany({})
        ]);
        await client.db().collection("source").insertOne({ message: "Hello World!" });
    })

    it("Clone data using a FindCursor", function (done) {
        const findCursor = client.db().collection("source").find({});
        const stream = clone(findCursor, client, "target");

        stream.on("close", async () => {
            const docs = await client.db().collection("target").find({}).toArray();
            assert(docs.length === 1, "Invalid number of documents copied");
            done();
        });
        stream.on("error", err => done(err));
    });

    it("Clone data using a AggregateCursor", function (done) {
        const aggregateCursor = client.db().collection("source").aggregate([]);
        const stream = clone(aggregateCursor, client, "target");

        stream.on("close", async () => {
            const docs = await client.db().collection("target").find({}).toArray();
            assert(docs.length === 1, "Invalid number of documents copied");
            done();
        });
        stream.on("error", err => done(err));
    });

    after("Terminate mocks", async function () {
        await client.close();
        await mongod.stop();
    });
});
