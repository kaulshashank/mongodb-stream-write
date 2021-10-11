import { MongoClient, InsertOneOptions, AggregationCursor, FindCursor } from "mongodb";
import { Writable } from "stream";

interface TransformationFunction {
    (doc: Document): any;
}

/**
 * Creates a writable stream to a collection on provided MongoClient.
 * @param client A connected instance of MongoClient
 * @param collection Collection name to write documents into
 * @param transformer Optional transformation function to apply on every document to be written to the collection
 * @param insertOptions Optional options to provide to collection.insertOne()
 * @returns Writable stream to the provided collection argument
 */
export function createCollectionWriteStream(
    client: MongoClient,
    collection: string,
    transformer?: TransformationFunction,
    insertOptions?: InsertOneOptions
): Writable {
    const writable = new Writable({
        highWaterMark: 16,
        objectMode: true,
        write: async function (doc: Document, encoding, callback) {
            try {
                const insert = transformer ? transformer(doc) : doc;
                await client.db().collection(collection).insertOne(insert, insertOptions || {});
                callback();
            } catch (err) {
                callback(err as Error);
            }
        }
    });
    return writable;
}

/**
 * Utility to clone data efficiently using a stream
 * @param cursor A mongo client FindCursor or AggregationCursor instance
 * @param target A connected instance of MongoClient
 * @param collection Collection name to write documents into
 * @param transformer Optional transformation function to apply on every document to be written to the collection
 * @param insertOptions Optional options to provide to collection.insertOne()
 * @returns Writable stream to the target collection
 */
export function clone(
    cursor: FindCursor | AggregationCursor,
    target: MongoClient,
    collection: string,
    transformer?: TransformationFunction,
    insertOptions?: InsertOneOptions
): Writable {
    const readable = cursor.stream();
    const writable = createCollectionWriteStream(target, collection, transformer, insertOptions);
    return readable.pipe(writable);
}
