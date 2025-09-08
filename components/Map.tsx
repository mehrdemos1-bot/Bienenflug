import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polygon, useMap, useMapEvents, Pane } from 'react-leaflet';
import L from 'leaflet';
import type { Hive } from '../types';
import { 
    MAP_INITIAL_CENTER, 
    MAP_INITIAL_ZOOM, 
    MAP_TILE_URL_SATELLITE, 
    MAP_ATTRIBUTION_SATELLITE, 
    MAP_TILE_URL_LABELS,
    MAP_ATTRIBUTION_LABELS,
    BEEHIVE_ICON_SVG 
} from '../constants';

// Helper component to handle map click events for adding hives
const MapClickHandler: React.FC<{ onAddHive: (lat: number, lng: number) => void }> = ({ onAddHive }) => {
    useMapEvents({
        click(e) {
            onAddHive(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Helper component to pan the map to a given center
const RecenterView: React.FC<{ center: [number, number] | null }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, Math.max(map.getZoom(), 13), {
                animate: true,
                duration: 1
            });
        }
    }, [center, map]);
    return null;
};

interface MapComponentProps {
    hives: Hive[];
    onAddHive: (lat: number, lng: number) => void;
    selectedHive: Hive | null;
    onSelectHive: (hive: Hive) => void;
    searchResultCenter: [number, number] | null;
}

export const MapComponent: React.FC<MapComponentProps> = ({ hives, onAddHive, selectedHive, onSelectHive, searchResultCenter }) => {
    
    const hiveIcon = useMemo(() => new L.DivIcon({
        html: `<div class="p-1 bg-white rounded-full shadow-lg">${BEEHIVE_ICON_SVG}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    }), []);

    const selectedHiveIcon = useMemo(() => new L.DivIcon({
         html: `<div class="p-1 bg-yellow-300 rounded-full shadow-lg ring-2 ring-yellow-500">${BEEHIVE_ICON_SVG}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    }), []);
    
    const viewCenter = useMemo<[number, number] | null>(() => {
        if (selectedHive) {
            return [selectedHive.lat, selectedHive.lng];
        }
        if (searchResultCenter) {
            return searchResultCenter;
        }
        return null;
    }, [selectedHive, searchResultCenter]);

    // A polygon that covers the entire world, used for the filter layers.
    const worldBounds = useMemo<L.LatLngExpression[]>(() => [
        [90, -180],
        [-90, -180],
        [-90, 180],
        [90, 180]
    ], []);


    return (
        <MapContainer center={MAP_INITIAL_CENTER} zoom={MAP_INITIAL_ZOOM} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer 
                url={MAP_TILE_URL_SATELLITE} 
                attribution={MAP_ATTRIBUTION_SATELLITE}
                zIndex={1}
            />
            
            {/* Labels are kept on a separate pane to ensure they render on top of the filter. */}
            <Pane name="labels" style={{ zIndex: 450 }} />
            <TileLayer 
                url={MAP_TILE_URL_LABELS}
                attribution={MAP_ATTRIBUTION_LABELS}
                pane="labels"
            />
            <MapClickHandler onAddHive={onAddHive} />
            
            <RecenterView center={viewCenter} />

            {/* Filter effect using mix-blend-mode. This correctly handles overlaps. */}
            {hives.length > 0 && (
                <Pane name="filter-pane" className="leaflet-filter-pane" style={{ zIndex: 400 }}>
                    {/* 1. A black base. When blended with "screen", this becomes transparent. */}
                    <Polygon positions={worldBounds} pathOptions={{ fillColor: '#000000', fillOpacity: 1, stroke: false }} />
                    
                    {/* 2. The yellow filter on top. This lightens the map. */}
                    <Polygon positions={worldBounds} pathOptions={{ fillColor: '#FBBF24', fillOpacity: 0.7, stroke: false }} />

                    {/* 3. Black circles are drawn on top of the yellow, creating black areas which become transparent. */}
                    {hives.map(hive => (
                        <Circle
                            key={hive.id}
                            center={[hive.lat, hive.lng]}
                            radius={hive.radius}
                            pathOptions={{
                                fillColor: '#000000',
                                fillOpacity: 1,
                                stroke: false,
                            }}
                        />
                    ))}
                </Pane>
            )}

            {/* The actual markers and visible circle borders, rendered on top of the filter. */}
            {hives.map(hive => {
                const isSelected = selectedHive?.id === hive.id;
                return (
                    <React.Fragment key={hive.id}>
                        <Marker 
                            position={[hive.lat, hive.lng]} 
                            icon={isSelected ? selectedHiveIcon : hiveIcon}
                            eventHandlers={{
                                click: () => {
                                    onSelectHive(hive);
                                },
                            }}
                            zIndexOffset={1000} // Ensure markers are on top
                        />
                        <Circle
                            center={[hive.lat, hive.lng]}
                            radius={hive.radius}
                            pathOptions={{ 
                                color: isSelected ? '#f59e0b' : '#3b82f6', 
                                fillOpacity: 0, // The border circle has no fill
                                weight: isSelected ? 3 : 2
                            }}
                        />
                    </React.Fragment>
                );
            })}
        </MapContainer>
    );
};