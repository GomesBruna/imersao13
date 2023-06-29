import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
// create a document with mongoose to be able create an watch and sent SSE(server sent events) to front
export type AssetDailyDocument = HydratedDocument<AssetDaily>; // HydratedDocument represents a one-to-one mapping to documents as stored in MongoDb

@Schema({
  collection: 'AssetDaily', //collection with name create on prisma
})
export class AssetDaily {} // Don't need the Prop or Schema decorator once we are getting a collection prisma created 

export const AssetDailySchema = SchemaFactory.createForClass(AssetDaily); // class SchemaFactory contains static methods used for model creation
