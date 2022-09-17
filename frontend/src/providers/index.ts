import { ApiResponse, Point } from '../interfaces';

export async function getData(): Promise<ApiResponse[]> {
  const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api/' : '/api/';
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

export async function preparePointsToMap(data: ApiResponse[]): Promise<Point[]> {
  const points: Point[] = (await data).map((record) => ({
    vehicleType: record.VehicleType,
    lineNumber: record.LineNumber,
    latitude: record.Latitude,
    longitude: record.Longitude,
    vehicleNumber: record.VehicleNumber,
  }));

  return points;
}
