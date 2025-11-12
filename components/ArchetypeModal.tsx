import React, { useState, useEffect } from 'react';
import { Archetype } from '../types';

interface ArchetypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string, description: string }) => void;
    archetypeToEdit: Archetype | null;
}

const ArchetypeModal: React.FC<ArchetypeModalProps> = ({ isOpen, onClose, onSave, archetypeToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (archetypeToEdit) {
            setName(archetypeToEdit.name);
            setDescription(archetypeToEdit.description);
        } else {
            setName('');
            setDescription('');
        }
        setError('');
    }, [archetypeToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 3 || description.trim().length < 10) {
            setError('El nombre debe tener al menos 3 caracteres y la descripción al menos 10.');
            return;
        }
        onSave({ name, description });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800/70 dark:bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in-fast" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-gray-200 dark:border-purple-500/50" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-center text-purple-600 dark:text-purple-300">{archetypeToEdit ? 'Editar Arquetipo' : 'Crear Nuevo Arquetipo'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Arquetipo</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: El/La Visionario/a"
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe la energía y el propósito de este arquetipo..."
                            className="w-full h-24 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none text-gray-900 dark:text-white"
                        />
                    </div>
                     {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 rounded-lg font-semibold transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-6 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-white transition-colors">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArchetypeModal;