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
            {/* 
              * ÄNDERUNG 1:
              * Der Hauptcontainer wird mit `flex-1` und `min-h-0` versehen. Dies ist ein
              * bewährter Flexbox-Fix, der sicherstellt, dass der Container den verfügbaren
              * Platz korrekt ausfüllt und die Kinder darin richtig scrollen können.
              * VORHER: className="flex flex-col md:flex-row flex-grow overflow-hidden"
            */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
                {/*
                  * ÄNDERUNG 2:
                  * Die Seitenleiste erhält `flex-1`, damit sie auf Mobilgeräten die Hälfte der
                  * Höhe einnimmt. `md:flex-grow-0` verhindert, dass sie auf dem Desktop
                  * breiter wird als durch `md:w-1/3...` vorgegeben. Die alten Höhenklassen
                  * werden entfernt, da Flexbox dies nun steuert.
                  * VORHER: className="h-1/2 md:h-full w-full md:w-1/3..."
                */}
                <aside className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 bg-white shadow-lg p-4 overflow-y-auto flex flex-col flex-1 md:flex-grow-0">
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
                {/*
                  * ÄNDERUNG 3:
                  * Die Karte erhält ebenfalls `flex-1`, um auf Mobilgeräten die andere Hälfte
                  * der Höhe einzunehmen und auf dem Desktop den restlichen horizontalen Platz
                  * auszufüllen. Die alten Klassen für Höhe und Wachstum sind nicht mehr nötig.
                  * VORHER: className="h-1/2 md:h-full flex-grow"
                */}
                <main className="flex-1">
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
