# MongoDB Write Stream

A writable stream to insert query results into MongoDB collections.

## Installation

```
npm i --save mongodb-stream-write
```

## API

### Methods

#### `createCollectionWriteStream(client, collection, [transformer, insertOptions])`
Creates a writable stream to a collection on provided MongoClient.

##### Options
 * client: A connected instance of MongoClient
 * collection: Collection name to write documents into
 * transformer: Optional transformation function to apply on every document to be written to the collection
 * insertOptions: Optional options to provide to collection.insertOne()

##### Returns
Writable stream to the target collection.

#### `clone(cursor, target, collection, [transformer, insertOptions])`
Utility to transfer data efficiently using a stream.

##### Options
 * cursor: A mongo client FindCursor or AggregationCursor instance
 * target: A connected instance of MongoClient
 * collection: Collection name to write documents into
 * transformer: Optional transformation function to apply on every document to be written to the collection
 * insertOptions: Optional options to provide to collection.insertOne()

##### Returns
Writable stream to the target collection.

## Examples

See test file
