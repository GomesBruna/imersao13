import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// create a document with mongoose to be able create an watch to send SSE(server sent events) to front
export type WalletAssetDocument = HydratedDocument<WalletAsset>;

@Schema({
  collection: 'WalletAsset', //collection with name create on prisma
})
export class WalletAsset {} // Don't need the Prop or Schema decorator once we are getting a collection prisma created

export const WalletAssetSchema = SchemaFactory.createForClass(WalletAsset); // class SchemaFactory contains static methods used for model creation

