import React, { useState, useCallback } from 'react';
import { MapComponent } from './components/Map';
import { HiveList } from './components/HiveList';
import { Header } from './components/Header';
import { Instructions } from './components/Instructions';
import { AddressSearch } from './components/AddressSearch';
import { RadiusSelector } from './components/RadiusSelector';
import type { Hive } from './types';
import { DEFAULT_FLIGHT_RADIUS_METERS } from './constants';

const App: React.FC = () => {
    const [hives, setHives] = useState<Hive[]>([]);
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [currentRadius, setCurrentRadius] = useState<number>(DEFAULT_FLIGHT_RADIUS_METERS);

    const handleAddHive = useCallback((lat: number, lng: number) => {
        const newHive: Hive = {
            id: crypto.randomUUID(),
            lat,
            lng,
            radius: currentRadius,
        };
        setHives(prevHives => [...prevHives, newHive]);
        setSelectedHive(newHive);
    }, [currentRadius]);

    const handleDeleteHive = useCallback((id: string) => {
        setHives(prevHives => prevHives.filter(hive => hive.id !== id));
        if (selectedHive?.id === id) {
            setSelectedHive(null);
        }
    }, [selectedHive]);

    const handleSelectHive = useCallback((hive: Hive | null) => {
        setSelectedHive(hive);
        if (hive) {
            setMapCenter(null); // Hive selection takes precedence over search
        }
    }, []);

    const handleSearchResultClick = useCallback((lat: number, lng: number) => {
        setMapCenter([lat, lng]);
        setSelectedHive(null); // Deselect hive when searching
    }, []);

    const handleUpdateHiveRadius = useCallback((hiveId: string, newRadius: number) => {
        setHives(prevHives => 
            prevHives.map(hive => 
                hive.id === hiveId ? { ...hive, radius: newRadius } : hive
            )
        );
        // Also update the selected hive object if it's the one being changed
        if (selectedHive?.id === hiveId) {
            setSelectedHive(prevSelected => prevSelected ? { ...prevSelected, radius: newRadius } : null);
        }
    }, [selectedHive]);


    return (
        <div className="flex flex-col h-screen font-sans">
            <Header />
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
                <aside className="relative w-full md:w-1/3 lg:w-1/4 xl:w-1/5 md:flex-shrink-0 bg-white shadow-lg p-2 md:p-4 overflow-y-auto flex flex-col h-2/5 md:h-auto mobile-scroll-fade">
                    <AddressSearch onSearchResultClick={handleSearchResultClick} />
                    <Instructions />
                    <RadiusSelector 
                        selectedRadius={currentRadius}
                        onRadiusChange={setCurrentRadius}
                    />
                    <HiveList 
                        hives={hives} 
                        selectedHive={selectedHive}
                        onSelectHive={handleSelectHive}
                        onDeleteHive={handleDeleteHive}
                        onUpdateHiveRadius={handleUpdateHiveRadius}
                    />
                </aside>
                <main className="flex-grow h-3/5 md:h-auto">
                    <MapComponent 
                        hives={hives}
                        onAddHive={handleAddHive}
                        selectedHive={selectedHive}
                        onSelectHive={handleSelectHive}
                        searchResultCenter={mapCenter}
                    />
                </main>
            </div>
        </div>
    );
};

export default App;
