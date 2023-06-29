import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
// create a document with mongoose to be able create an watch to send SSE(server sent events) to front
export type AssetDocument = HydratedDocument<Asset>;

@Schema({
  collection: 'Asset', // colection with same name created with prisma
})
export class Asset {} // Don't need the Prop or Schema decorator once we are getting a collection prisma created

export const AssetSchema = SchemaFactory.createForClass(Asset); // class SchemaFactory contains static methods used for model creation
