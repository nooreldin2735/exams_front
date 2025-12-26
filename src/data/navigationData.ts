export interface NavigationItem {
    id: string;
    label: string;
    icon?: string;
    children?: NavigationItem[];
}

export interface NavigationItemChild {
    id: string;
    label: string;
    icon?: string;
    children?: NavigationItemChild[];
}

export const baseNavigationData: NavigationItem[] = [
    {
        id: "home",
        label: "Home",
        icon: "home",
    },
    {
        id: "years-list",
        label: "All Years",
        icon: "list",
    },
    {
        id: "create-year",
        label: "Create Year",
        icon: "plus-circle",
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

// Placeholder for full navigation that Sidebar will manage
export const navigationData = baseNavigationData;

