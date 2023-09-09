export const CST = {
    GAME: {
        WIDTH: 900,
        HEIGHT: 700,
        ZOOM: {
            CITY: 1.2,
            TOWER_DEFENSE: 0.8
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
        EXPLORATION_GAME: "CITY",
        EXPLORATION_GAME_UI: "CITY_UI",
        TOWER_DEFENSE: "TOWER_DEFENSE",
        TOWER_DEFENSE_UI: "TOWER_DEFENSE_UI",
    },
    STYLE: {
        TEXT: {
            FONT_FAMILY: "Kickers-Regular"
        },
        COLOR: {
            ORANGE: "#f1966b",
            BLUE: "#2c4b7e",
            LIGHT_BLUE: "#6782e6",
            WHITE: "#f7e6e6",
            BLACK: "#000000"
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