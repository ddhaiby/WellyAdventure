export const WELLY_CST = {
    INDEX_INVALID: -1,
    GAME: {
        WIDTH: 960,
        HEIGHT: 704,
        ZOOM: {
            CITY: 1.2,
            TOWER_DEFENSE: 0.86
        },
        MAP: {
            TILESET: {
                TILE_SIZE: 32
            }
        }
    },
    PHYSIC: {
        DEBUG: false,
    },
    SCENES: {
        PRELOAD_ASSETS: "PRELOAD_ASSETS",
        TOWER_DEFENSE: "TOWER_DEFENSE",
        TOWER_DEFENSE_UI: "TOWER_DEFENSE_UI",
        TOWER_DEFENSE_MAIN_MENU: "TOWER_DEFENSE_MAIN_MENU",
    },
    STYLE: {
        TEXT: {
            KICKERS_FONT_FAMILY: "Kickers-Regular",
            NANUM_PEN_FONT_FAMILY: "Nanum Pen Script",
            MERRIWEATHER_SANS_FONT_FAMILY: "Merriweather Sans"
        },
        COLOR: {
            RARITY: {
                COMMON: "#222222",
                UNCOMMON: "#1eff00",
                RARE: "#0070dd",
                EPIC: "#a335ee",
                LEGENDARY: "#ff8000",
                MYTHIC: "#FF0000",
            },
            ORANGE: "#FF9161",
            BLUE: "#2c4b7e",
            LIGHT_BLUE: "#6380ED",
            BEIGE: "#FAE5E5",
            WHITE: "#ffffff",
            YELLOW: "#FFC715",
            BLACK: "#000000",
            GREY: "#C6B8B8",
            RED: "#EA3F3F"
        }
    },
    EVENTS: {
        UI: {
            REQUEST_DIALOGUE: "REQUEST_DIALOGUE",
            TOOLTIP: {
                SHOW: "SHOW_TOOLTIP",
                HIDE: "HIDE_TOOLTIP"
            }
        }
    },
    NONE: "NONE"
}