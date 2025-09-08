import React from 'react';
import type { Hive } from '../types';
import { TRASH_ICON_SVG, FLIGHT_RADIUS_OPTIONS } from '../constants';

interface HiveListProps {
    hives: Hive[];
    selectedHive: Hive | null;
    onSelectHive: (hive: Hive) => void;
    onDeleteHive: (id: string) => void;
    onUpdateHiveRadius: (id: string, radius: number) => void;
}

export const HiveList: React.FC<HiveListProps> = ({ hives, selectedHive, onSelectHive, onDeleteHive, onUpdateHiveRadius }) => {
    
    if (hives.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 italic">Noch keine Bienenstöcke hinzugefügt.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3 mt-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Ihre Bienenstöcke</h2>
            <ul className="space-y-2">
                {hives.map((hive, index) => {
                    const isSelected = selectedHive?.id === hive.id;
                    return (
                        <li
                            key={hive.id}
                            onClick={() => onSelectHive(hive)}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${
                                isSelected 
                                ? 'bg-yellow-200 ring-2 ring-yellow-500 shadow-md' 
                                : 'bg-gray-100 hover:bg-yellow-100'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-gray-800">Bienenstock #{index + 1}</span>
                                    <p className="text-xs text-gray-600">
                                        Lat: {hive.lat.toFixed(4)}, Lng: {hive.lng.toFixed(4)}
                                    </p>
                                    <p className="text-xs text-gray-600 font-medium">
                                        Radius: {hive.radius / 1000} km
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent li's onClick from firing
                                        onDeleteHive(hive.id);
                                    }}
                                    className="p-2 rounded-full text-gray-500 hover:bg-red-200 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex-shrink-0"
                                    aria-label={`Bienenstock #${index + 1} löschen`}
                                >
                                    {TRASH_ICON_SVG}
                                </button>
                            </div>
                            {isSelected && (
                                <div className="mt-3 pt-3 border-t border-yellow-300">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Radius anpassen:</h4>
                                    <div className="flex justify-around items-center">
                                        {FLIGHT_RADIUS_OPTIONS.map(radius => (
                                            <label key={radius} className="flex items-center space-x-2 cursor-pointer text-gray-700 text-sm">
                                                <input
                                                    type="radio"
                                                    name={`radius-${hive.id}`}
                                                    value={radius}
                                                    checked={hive.radius === radius}
                                                    onChange={() => onUpdateHiveRadius(hive.id, radius)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="h-4 w-4 text-yellow-500 border-gray-300 focus:ring-yellow-400"
                                                />
                                                <span>{radius / 1000} km</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};