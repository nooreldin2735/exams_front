import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Entity {
    id: string | number;
    name: string;
}

interface NavigationState {
    year: Entity | null;
    term: Entity | null;
    subject: Entity | null;
    lecture: Entity | null;
    currentPathTitle: string;
}

interface NavigationContextType extends NavigationState {
    setYear: (year: Entity | null) => void;
    setTerm: (term: Entity | null) => void;
    setSubject: (subject: Entity | null) => void;
    setLecture: (lecture: Entity | null) => void;
    setCurrentPathTitle: (title: string) => void;
    clearNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<NavigationState>({
        year: null,
        term: null,
        subject: null,
        lecture: null,
        currentPathTitle: '',
    });

    const setYear = (year: Entity | null) => setState(prev => ({ ...prev, year, term: null, subject: null, lecture: null }));
    const setTerm = (term: Entity | null) => setState(prev => ({ ...prev, term, subject: null, lecture: null }));
    const setSubject = (subject: Entity | null) => setState(prev => ({ ...prev, subject, lecture: null }));
    const setLecture = (lecture: Entity | null) => setState(prev => ({ ...prev, lecture }));
    const setCurrentPathTitle = (currentPathTitle: string) => setState(prev => ({ ...prev, currentPathTitle }));
    const clearNavigation = () => setState({
        year: null,
        term: null,
        subject: null,
        lecture: null,
        currentPathTitle: '',
    });

    return (
        <NavigationContext.Provider
            value={{
                ...state,
                setYear,
                setTerm,
                setSubject,
                setLecture,
                setCurrentPathTitle,
                clearNavigation,
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}
