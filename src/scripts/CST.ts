export const CST = {
    GAME: {
        WIDTH: 900,
        HEIGHT: 700,
        ZOOM: 1.2,
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
        GAME: "GAME",
        GAME_UI: "GAME_UI",
    },
    STYLE: {
        TEXT: {
            FONT_FAMILY: "Kickers-Regular"
        },
        COLOR: {
            ORANGE: "#f1966b",
            BLUE: "#2c4b7e",
            LIGHT_BLUE: "#6782e6",
            WHITE: "#f7e6e6"
        }
    },
    EVENTS: {
        UI: {
            REQUEST_DIALOGUE: "REQUEST_DIALOGUE"
        }
    }
}