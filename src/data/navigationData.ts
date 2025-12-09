export interface NavigationItem {
    id: string;
    label: string;
    icon?: string;
    children?: NavigationItem[];
}

export const navigationData: NavigationItem[] = [
    {
        id: "years",
        label: "Years",
        icon: "calendar",
        children: [
            {
                id: "year-1",
                label: "First Year",
                children: [
                    {
                        id: "term-1",
                        label: "Term 1",
                        children: [
                            { id: "math-101", label: "Math 101", icon: "book" },
                            { id: "phys-101", label: "Physics 101", icon: "book" },
                        ],
                    },
                    {
                        id: "term-2",
                        label: "Term 2",
                        children: [
                            { id: "cs-101", label: "Intro to CS", icon: "code" },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "library",
        label: "Library",
        icon: "library",
    },
    {
        id: "reports",
        label: "Reports",
        icon: "clipboard",
    },
];
