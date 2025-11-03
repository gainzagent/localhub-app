/**
 * Show Content Endpoint
 * Displays embedded HTML resources for ChatGPT Apps
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session/store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const resourceId = searchParams.get('resource_id');
    const stateId = searchParams.get('state_id');

    if (!resourceId) {
      return new NextResponse('Missing resource_id parameter', { status: 400 });
    }

    // Handle map resource
    if (resourceId === 'localhub-map-v1' && stateId) {
      const session = sessionStore.get(stateId);

      if (!session || !session.results) {
        return new NextResponse('Session not found or expired', { status: 404 });
      }

      // Generate map HTML
      const html = generateMapHTML(session);

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new NextResponse('Resource not found', { status: 404 });
  } catch (error) {
    console.error('Show content error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

function generateMapHTML(session: any): string {
  const { results, center, bounds } = session;

  const markersData = results.map((place: any) => ({
    lat: place.location.lat,
    lng: place.location.lng,
    name: place.name,
    address: place.address,
    rating: place.rating,
    user_ratings_total: place.user_ratings_total,
    phone: place.phone,
    place_id: place.place_id,
  }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LocalHub Map</title>
  <script src="https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #map { width: 100%; height: 100%; }
    .info-card {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      max-width: 300px;
    }
    .info-card h3 { margin: 0 0 8px 0; font-size: 16px; color: #1a1a1a; }
    .info-card .rating { color: #f59e0b; margin-bottom: 8px; }
    .info-card .address { color: #666; font-size: 14px; margin-bottom: 8px; }
    .info-card .phone { color: #2563eb; font-size: 14px; margin-bottom: 12px; }
    .info-card button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 8px;
    }
    .info-card button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const markers = ${JSON.stringify(markersData)};
    const center = ${JSON.stringify(center)};
    const bounds = ${JSON.stringify(bounds)};

    let map;
    let infoWindow;
    let mapMarkers = [];

    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      infoWindow = new google.maps.InfoWindow();

      // Add markers
      markers.forEach((markerData, index) => {
        const marker = new google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map: map,
          title: markerData.name,
          label: String(index + 1),
        });

        marker.addListener('click', () => {
          showInfoCard(markerData, marker);
        });

        mapMarkers.push(marker);
      });

      // Fit bounds if available
      if (bounds && bounds.ne && bounds.sw) {
        const mapBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(bounds.sw.lat, bounds.sw.lng),
          new google.maps.LatLng(bounds.ne.lat, bounds.ne.lng)
        );
        map.fitBounds(mapBounds);
      }
    }

    function showInfoCard(data, marker) {
      const rating = data.rating ?
        \`⭐ \${data.rating} (\${data.user_ratings_total || 0} reviews)\` :
        'No ratings';

      const phone = data.phone ?
        \`<div class="phone">📞 <a href="tel:\${data.phone}">\${data.phone}</a></div>\` :
        '';

      const content = \`
        <div class="info-card">
          <h3>\${data.name}</h3>
          <div class="rating">\${rating}</div>
          <div class="address">\${data.address}</div>
          \${phone}
          <button onclick="getDirections(\${data.lat}, \${data.lng})">Get Directions</button>
        </div>
      \`;

      infoWindow.setContent(content);
      infoWindow.open(map, marker);
    }

    function getDirections(lat, lng) {
      const url = \`https://www.google.com/maps/dir/?api=1&destination=\${lat},\${lng}\`;
      window.open(url, '_blank');
    }

    // Initialize map when page loads
    if (typeof google !== 'undefined') {
      initMap();
    } else {
      window.addEventListener('load', initMap);
    }
  </script>
</body>
</html>`;
}
