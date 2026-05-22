// This file helps TypeScript recognize GeoJSON types
// It explicitly imports and re-exports the GeoJSON types

declare module 'geojson' {
  export interface GeoJsonObject {
    type: string;
    bbox?: number[];
    crs?: {
      type: string;
      properties: any;
    };
  }

  export interface GeometryObject extends GeoJsonObject {
    coordinates: any;
  }

  export interface Point extends GeometryObject {
    type: 'Point';
    coordinates: Position;
  }

  export interface MultiPoint extends GeometryObject {
    type: 'MultiPoint';
    coordinates: Position[];
  }

  export interface LineString extends GeometryObject {
    type: 'LineString';
    coordinates: Position[];
  }

  export interface MultiLineString extends GeometryObject {
    type: 'MultiLineString';
    coordinates: Position[][];
  }

  export interface Polygon extends GeometryObject {
    type: 'Polygon';
    coordinates: Position[][];
  }

  export interface MultiPolygon extends GeometryObject {
    type: 'MultiPolygon';
    coordinates: Position[][][];
  }

  export interface GeometryCollection extends GeoJsonObject {
    type: 'GeometryCollection';
    geometries: GeometryObject[];
  }

  export type Position = number[];

  export interface Feature<G extends GeometryObject | null = GeometryObject, P = any> extends GeoJsonObject {
    type: 'Feature';
    geometry: G;
    properties: P;
    id?: string | number;
  }

  export interface FeatureCollection<G extends GeometryObject | null = GeometryObject, P = any> extends GeoJsonObject {
    type: 'FeatureCollection';
    features: Array<Feature<G, P>>;
  }
}