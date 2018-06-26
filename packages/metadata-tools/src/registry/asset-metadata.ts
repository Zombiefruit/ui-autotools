import { IAssetMetadata } from './types';

export class AssetMetadata<AssetType> implements IAssetMetadata<AssetType> {
  constructor(public type: AssetType, public name: string, public description?: string) {}
}
