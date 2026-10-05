
/* =========================================================
   PITCHGRID
   SPATIAL FOOTBALL ANALYTICS ENGINE
========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

var map = null;

var zonesLayer = null;

var channelsLayer = null;

var shotConeLayer = null;

var analysisLayer = null;

var gridActive = false;

var channelsActive = false;

var shotConeActive = false;

var currentMode = 'fan';

var currentAnalysis = 'fullback_overlap';



/* =========================================================
   ANALYSIS REGISTRY
========================================================= */

var analysisRegistry = {

    fullback_overlap: {

        title:
            'Fullback Defensive Exposure',

        description:
            'The right-back is spatially exposed as the defensive structure stretches toward the attacking player. The exposure corridor creates a measurable gap between the fullback and the nearest central defender.',

        area:
            '642 m²',

        exposure:
            '9.8 m',

        nearest:
            '12.4 m'

    },


    compactness: {

        title:
            'Defensive Compactness',

        description:
            'The defensive block is represented as a spatial structure. Distances between defenders can be measured to identify how tightly the team is maintaining its defensive shape.',

        area:
            '518 m²',

        exposure:
            '6.2 m',

        nearest:
            '8.7 m'

    },


    equality: {

        title:
            'Spatial Equality',

        description:
            'Spatial equality examines how players share and contest the same football space. The analysis can identify numerical equality, 1v1 situations and areas where one team gains spatial advantage.',

        area:
            '384 m²',

        exposure:
            '5.1 m',

        nearest:
            '6.8 m'

    },


    voronoi: {

        title:
            'Spatial Control',

        description:
            'Voronoi-style spatial partitioning can estimate the area controlled or influenced by individual players based on their relative proximity to surrounding players.',

        area:
            '731 m²',

        exposure:
            '4.6 m',

        nearest:
            '7.9 m'

    },


    nearest_defender: {

        title:
            'Nearest Defender',

        description:
            'Measures the spatial relationship between an attacking player and the nearest available defender.',

        area:
            '296 m²',

        exposure:
            '4.2 m',

        nearest:
            '6.3 m'

    },


    distance_analysis: {

        title:
            'Distance Analysis',

        description:
            'Measures direct spatial distance between selected football objects using Euclidean spatial geometry.',

        area:
            '410 m²',

        exposure:
            '7.4 m',

        nearest:
            '9.1 m'

    },


    defensive_shape: {

        title:
            'Defensive Shape',

        description:
            'Represents the defensive structure as a spatial polygon to understand the geometry of the defensive block.',

        area:
            '1,248 m²',

        exposure:
            '8.2 m',

        nearest:
            '10.6 m'

    },


    exposure_zone: {

        title:
            'Exposure Zone',

        description:
            'Identifies an area where the defensive structure becomes vulnerable because of spacing, player positioning and available attacking space.',

        area:
            '354 m²',

        exposure:
            '10.1 m',

        nearest:
            '11.8 m'

    }

};



/* =========================================================
   ENTER EXPERIENCE
========================================================= */

function enterExperience(mode) {

    currentMode = mode || 'fan';


    var intro =
        document.getElementById(
            'introPage'
        );


    var dashboard =
        document.getElementById(
            'dashboardPage'
        );


    if (!intro || !dashboard) {

        console.error(
            'PitchGrid pages not found.'
        );

        return;

    }


    intro.classList.add(
        'hidden'
    );


    dashboard.classList.remove(
        'hidden'
    );


    var modeDisplay =
        document.getElementById(
            'modeDisplay'
        );


    if (modeDisplay) {

        if (currentMode === 'coach') {

            modeDisplay.innerHTML = `

                <i class="fa-solid fa-crosshairs"></i>

                <span>
                    FOR COACHES
                </span>

            `;

        } else {

            modeDisplay.innerHTML = `

                <i class="fa-solid fa-futbol"></i>

                <span>
                    FOR FANS
                </span>

            `;

        }

    }


    /*
       Important:
       Leaflet map is initialized AFTER
       dashboard becomes visible.
    */

    setTimeout(
        function () {

            initializePitchGrid();

        },
        200
    );

}



/* =========================================================
   BACK TO INTRO
========================================================= */

function backToIntro() {

    var intro =
        document.getElementById(
            'introPage'
        );


    var dashboard =
        document.getElementById(
            'dashboardPage'
        );


    if (!intro || !dashboard) {

        return;

    }


    dashboard.classList.add(
        'hidden'
    );


    intro.classList.remove(
        'hidden'
    );

}



/* =========================================================
   INITIALIZE MAP
========================================================= */

function initializePitchGrid() {


    if (map) {

        map.invalidateSize();

        return;

    }


    if (typeof L === 'undefined') {

        alert(
            'Leaflet could not be loaded.'
        );

        console.error(
            'Leaflet library is missing.'
        );

        return;

    }


    /* =====================================================
       MAP
    ===================================================== */

    map = L.map(

        'map',

        {

            crs:
                L.CRS.Simple,

            minZoom:
                -1,

            maxZoom:
                2,

            zoomControl:
                false,

            attributionControl:
                false

        }

    );


    /* =====================================================
       FIFA BOUNDS
    ===================================================== */

    var bounds = [

        [0, 0],

        [68, 105]

    ];


    map.fitBounds(
        bounds
    );



    /* =====================================================
       CUSTOM CONTROLS
    ===================================================== */

    var customControls =
        L.control({

            position:
                'topleft'

        });


    customControls.onAdd =
        function () {

            var div =
                L.DomUtil.create(

                    'div',

                    'leaflet-control-custom-group'

                );


            div.innerHTML = `

                <button
                    class="leaflet-control-btn"
                    title="Zoom In"
                    onclick="map.zoomIn()">

                    +

                </button>


                <button
                    class="leaflet-control-btn"
                    title="Zoom Out"
                    onclick="map.zoomOut()">

                    −

                </button>


                <button
                    class="leaflet-control-btn"
                    title="Reset Extent"
                    onclick="map.fitBounds([[0,0],[68,105]])"
                    style="font-size:16px;">

                    ⤢

                </button>

            `;


            return div;

        };


    customControls.addTo(
        map
    );



    /* =====================================================
       POSTGIS BADGE
    ===================================================== */

    var postgisBadge =
        L.control({

            position:
                'topright'

        });


    postgisBadge.onAdd =
        function () {

            var div =
                L.DomUtil.create(

                    'div',

                    'postgis-badge-control'

                );


            div.innerHTML = `

                <span class="postgis-icon"></span>

                PostGIS Engine • SRID 0

            `;


            return div;

        };


    postgisBadge.addTo(
        map
    );



    /* =====================================================
       PITCH STYLES
    ===================================================== */

    var lineStyle = {

        color:
            '#0f172a',

        weight:
            2,

        fill:
            false

    };


    var markStyle = {

        color:
            '#0f172a',

        weight:
            1.5

    };



    /* =====================================================
       PITCH
    ===================================================== */

    L.rectangle(

        [[0, 0], [68, 105]],

        {

            color:
                '#0f172a',

            weight:
                2.5,

            fillColor:
                '#ffffff',

            fillOpacity:
                1

        }

    ).addTo(map);



    /* =====================================================
       CENTER LINE
    ===================================================== */

    L.polyline(

        [[0, 52.5], [68, 52.5]],

        lineStyle

    ).addTo(map);



    /* =====================================================
       CENTER CIRCLE
    ===================================================== */

    L.circle(

        [34, 52.5],

        {

            radius:
                9.15,

            color:
                '#0f172a',

            weight:
                2,

            fill:
                false

        }

    ).addTo(map);


    L.circle(

        [34, 52.5],

        {

            radius:
                0.3,

            fillColor:
                '#0f172a',

            fill:
                true,

            color:
                '#0f172a'

        }

    ).addTo(map);



    /* =====================================================
       LEFT PENALTY
    ===================================================== */

    L.rectangle(

        [[13.85, 0], [54.15, 16.5]],

        lineStyle

    ).addTo(map);


    L.rectangle(

        [[24.85, 0], [43.15, 5.5]],

        lineStyle

    ).addTo(map);


    L.circle(

        [34, 11],

        {

            radius:
                0.3,

            fillColor:
                '#0f172a',

            fill:
                true,

            color:
                '#0f172a'

        }

    ).addTo(map);



    /* =====================================================
       LEFT ARC
    ===================================================== */

    var leftArcCoords = [];


    for (
        var angle = -53;
        angle <= 53;
        angle++
    ) {

        var rad =
            angle *
            Math.PI /
            180;


        leftArcCoords.push([

            34 +
            9.15 *
            Math.sin(rad),

            11 +
            9.15 *
            Math.cos(rad)

        ]);

    }


    L.polyline(

        leftArcCoords,

        lineStyle

    ).addTo(map);



    /* =====================================================
       RIGHT PENALTY
    ===================================================== */

    L.rectangle(

        [[13.85, 88.5], [54.15, 105]],

        lineStyle

    ).addTo(map);


    L.rectangle(

        [[24.85, 99.5], [43.15, 105]],

        lineStyle

    ).addTo(map);


    L.circle(

        [34, 94],

        {

            radius:
                0.3,

            fillColor:
                '#0f172a',

            fill:
                true,

            color:
                '#0f172a'

        }

    ).addTo(map);



    /* =====================================================
       RIGHT ARC
    ===================================================== */

    var rightArcCoords = [];


    for (
        var angle = 127;
        angle <= 233;
        angle++
    ) {

        var rad =
            angle *
            Math.PI /
            180;


        rightArcCoords.push([

            34 +
            9.15 *
            Math.sin(rad),

            94 +
            9.15 *
            Math.cos(rad)

        ]);

    }


    L.polyline(

        rightArcCoords,

        lineStyle

    ).addTo(map);



    /* =====================================================
       GOALS
    ===================================================== */

    L.rectangle(

        [[30.34, -2], [37.66, 0]],

        {

            color:
                '#0f172a',

            weight:
                1.8,

            fillColor:
                '#f1f5f9',

            fillOpacity:
                .8

        }

    ).addTo(map);


    L.rectangle(

        [[30.34, 105], [37.66, 107]],

        {

            color:
                '#0f172a',

            weight:
                1.8,

            fillColor:
                '#f1f5f9',

            fillOpacity:
                .8

        }

    ).addTo(map);



    /* =====================================================
       CORNERS
    ===================================================== */

    L.polyline(

        [[1, 0], [0, 1]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[67, 0], [68, 1]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[0, 104], [1, 105]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[68, 104], [67, 105]],

        markStyle

    ).addTo(map);



    /* =====================================================
       CORNER MARKS
    ===================================================== */

    L.polyline(

        [[-1.5, 9.15], [0, 9.15]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[68, 9.15], [69.5, 9.15]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[-1.5, 95.85], [0, 95.85]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[68, 95.85], [69.5, 95.85]],

        markStyle

    ).addTo(map);



    /* =====================================================
       SCALE HUD
    ===================================================== */

    var scaleHud =
        L.control({

            position:
                'bottomleft'

        });


    scaleHud.onAdd =
        function () {

            var div =
                L.DomUtil.create(

                    'div',

                    'scale-hud'

                );


            div.innerHTML = `

                <div style="
                    display:flex;
                    align-items:center;
                    gap:5px;
                ">

                    <div
                        class="scale-bar-graphic"
                    ></div>

                    <span>
                        <b>10m</b>
                    </span>

                </div>

                <span style="
                    color:#cbd5e1;
                ">
                    |
                </span>

                <span>
                    Attack ➔
                </span>

            `;


            return div;

        };


    scaleHud.addTo(
        map
    );



    /* =====================================================
       COORDINATES
    ===================================================== */

    var coordsHud =
        L.control({

            position:
                'bottomright'

        });


    coordsHud.onAdd =
        function () {

            var div =
                L.DomUtil.create(

                    'div',

                    'coords-hud'

                );


            div.id =
                'live-coords';


            div.innerHTML =
                'X: <b>0.00m</b> | Y: <b>0.00m</b>';


            return div;

        };


    coordsHud.addTo(
        map
    );



    /* =====================================================
       MOUSE X/Y
    ===================================================== */

    map.on(

        'mousemove',

        function (e) {

            var x =
                Math.max(
                    0,
                    Math.min(
                        105,
                        e.latlng.lng
                    )
                ).toFixed(2);


            var y =
                Math.max(
                    0,
                    Math.min(
                        68,
                        e.latlng.lat
                    )
                ).toFixed(2);


            var coords =
                document.getElementById(
                    'live-coords'
                );


            if (coords) {

                coords.innerHTML =
                    `X: <b>${x}m</b> | Y: <b>${y}m</b>`;

            }

        }

    );



    /* =====================================================
       GRID
    ===================================================== */

    zonesLayer =
        L.layerGroup();


    [
        13.85,
        24.85,
        43.15,
        54.15

    ].forEach(

        function (y) {

            L.polyline(

                [[y, 0], [y, 105]],

                {

                    color:
                        '#94a3b8',

                    weight:
                        1,

                    dashArray:
                        '3, 3'

                }

            ).addTo(
                zonesLayer
            );

        }

    );


    [
        16.5,
        33.0,
        52.5,
        72.0,
        88.5

    ].forEach(

        function (x) {

            L.polyline(

                [[0, x], [68, x]],

                {

                    color:
                        '#94a3b8',

                    weight:
                        1,

                    dashArray:
                        '3, 3'

                }

            ).addTo(
                zonesLayer
            );

        }

    );



    /* =====================================================
       CHANNELS
    ===================================================== */

    channelsLayer =
        L.layerGroup();


    [
        13.85,
        24.85,
        43.15,
        54.15

    ].forEach(

        function (y) {

            L.polyline(

                [[y, 0], [y, 105]],

                {

                    color:
                        '#0284c7',

                    weight:
                        1.5,

                    dashArray:
                        '4, 4'

                }

            ).addTo(
                channelsLayer
            );

        }

    );


    L.rectangle(

        [[24.85, 72], [43.15, 88.5]],

        {

            color:
                '#0284c7',

            fillColor:
                '#38bdf8',

            fillOpacity:
                .25,

            weight:
                1.5

        }

    ).addTo(
        channelsLayer
    );


    /* =====================================================
       CHANNEL LABELS
    ===================================================== */

    addZoneLabel(
        [34, 80.25],
        'Zone 14',
        true
    );


    addZoneLabel(
        [60, 52.5],
        'Left Wing'
    );


    addZoneLabel(
        [48.65, 52.5],
        'Left Half-Space'
    );


    addZoneLabel(
        [34, 52.5],
        'Central Channel'
    );


    addZoneLabel(
        [19.35, 52.5],
        'Right Half-Space'
    );


    addZoneLabel(
        [8, 52.5],
        'Right Wing'
    );



    /* =====================================================
       SHOT CONE
    ===================================================== */

    shotConeLayer =
        L.layerGroup();


    setupShotAngle();



    /* =====================================================
       DEMO ANALYSIS
    ===================================================== */

    buildAnalysisLayers();


    /*
       Start with Fullback Exposure
    */

    showAnalysis(
        'fullback_overlap'
    );


    /*
       Make sure Leaflet calculates
       the correct visible size.
    */

    setTimeout(

        function () {

            map.invalidateSize();

        },

        100

    );


    console.log(
        'PitchGrid Spatial Engine Ready.'
    );

}






/* =========================================================
   GRID
========================================================= */

function toggleTacticalGrid() {

    if (!map || !zonesLayer) {

        return;

    }


    gridActive =
        !gridActive;


    var button =
        document.getElementById(
            'gridBtn'
        );


    if (button) {

        button.classList.toggle(
            'active',
            gridActive
        );

    }


    if (gridActive) {

        map.addLayer(
            zonesLayer
        );

    } else {

        map.removeLayer(
            zonesLayer
        );

    }

}



/* =========================================================
   CHANNELS
========================================================= */

function toggle5Channels() {

    if (!map || !channelsLayer) {

        return;

    }


    channelsActive =
        !channelsActive;


    var button =
        document.getElementById(
            'channelsBtn'
        );


    if (button) {

        button.classList.toggle(
            'active',
            channelsActive
        );

    }


    if (channelsActive) {

        map.addLayer(
            channelsLayer
        );

    } else {

        map.removeLayer(
            channelsLayer
        );

    }

}



/* =========================================================
   SHOT ANGLE SETUP
========================================================= */

function setupShotAngle() {

    if (!map || !shotConeLayer) {

        return;

    }


    map.on(

        'click',

        function (e) {

            if (!shotConeActive) {

                return;

            }


            shotConeLayer.clearLayers();


            var x =
                e.latlng.lng;


            var y =
                e.latlng.lat;


            var targetGoalX =
                x >= 52.5
                    ? 105
                    : 0;


            var goalName =
                targetGoalX === 105
                    ? 'Right Goal'
                    : 'Left Goal';


            var goalY1 =
                30.34;


            var goalY2 =
                37.66;


            var goalCenterY =
                34;


            var dist =
                Math.sqrt(

                    Math.pow(
                        targetGoalX - x,
                        2
                    )

                    +

                    Math.pow(
                        goalCenterY - y,
                        2
                    )

                ).toFixed(2);


            var a =
                Math.sqrt(

                    Math.pow(
                        targetGoalX - x,
                        2
                    )

                    +

                    Math.pow(
                        goalY1 - y,
                        2
                    )

                );


            var b =
                Math.sqrt(

                    Math.pow(
                        targetGoalX - x,
                        2
                    )

                    +

                    Math.pow(
                        goalY2 - y,
                        2
                    )

                );


            var c =
                7.32;


            var cosine =
                (

                    Math.pow(a, 2)

                    +

                    Math.pow(b, 2)

                    -

                    Math.pow(c, 2)

                )

                /

                (

                    2 * a * b

                );


            cosine =
                Math.max(
                    -1,
                    Math.min(
                        1,
                        cosine
                    )
                );


            var angle =
                (

                    Math.acos(
                        cosine
                    )

                    *

                    180

                    /

                    Math.PI

                ).toFixed(1);



            /* SHOT CONE */

            L.polygon(

                [

                    [y, x],

                    [goalY1, targetGoalX],

                    [goalY2, targetGoalX]

                ],

                {

                    color:
                        '#0284c7',

                    fillColor:
                        '#38bdf8',

                    fillOpacity:
                        .35,

                    weight:
                        2

                }

            ).addTo(
                shotConeLayer
            );



            /* SHOT POINT */

            var marker =
                L.circleMarker(

                    [y, x],

                    {

                        radius:
                            6,

                        fillColor:
                            '#f43f5e',

                        color:
                            '#ffffff',

                        weight:
                            2,

                        fillOpacity:
                            1

                    }

                ).addTo(
                    shotConeLayer
                );


            marker.bindPopup(`

                <div class="shot-popup-content">

                    <div class="shot-popup-title">

                        🎯 Shot Metrics

                        (${goalName})

                    </div>


                    <div>

                        Coordinates:

                        <b>

                            X:
                            ${x.toFixed(1)}m,

                            Y:
                            ${y.toFixed(1)}m

                        </b>

                    </div>


                    <div>

                        Dist to Goal:

                        <span class="shot-val">

                            ${dist} m

                        </span>

                    </div>


                    <div>

                        Shot Angle:

                        <span class="shot-val">

                            ${angle}°

                        </span>

                    </div>

                </div>

            `).openPopup();

        }

    );

}



/* =========================================================
   TOGGLE SHOT ANGLE
========================================================= */

function toggleShotCone() {

    if (!map || !shotConeLayer) {

        return;

    }


    shotConeActive =
        !shotConeActive;


    var button =
        document.getElementById(
            'coneBtn'
        );


    if (button) {

        button.classList.toggle(
            'active',
            shotConeActive
        );

    }


    if (!shotConeActive) {

        shotConeLayer.clearLayers();

    }

}



/* =========================================================
   ANALYSIS LAYERS
========================================================= */

function buildAnalysisLayers() {

    if (!map) {

        return;

    }


    analysisLayer =
        L.layerGroup();


    /* =====================================================
       EXPOSURE ZONE
    ===================================================== */

    L.rectangle(

        [[18, 82], [51, 96]],

        {

            color:
                '#ef4444',

            fillColor:
                '#f87171',

            fillOpacity:
                .13,

            weight:
                2,

            dashArray:
                '7,5'

        }

    ).addTo(
        analysisLayer
    );

}



/* =========================================================
   SHOW ANALYSIS
========================================================= */

function showAnalysis(
    analysisId
) {

    if (!analysisRegistry[analysisId]) {

        return;

    }


    currentAnalysis =
        analysisId;


    var data =
        analysisRegistry[
            analysisId
        ];


    /* =====================================================
       TITLE
    ===================================================== */

    var title =
        document.getElementById(
            'analysisTitle'
        );


    if (title) {

        title.textContent =
            data.title;

    }


    var pitchTitle =
        document.getElementById(
            'pitchTitle'
        );


    if (pitchTitle) {

        pitchTitle.textContent =
            data.title;

    }


    /* =====================================================
       DESCRIPTION
    ===================================================== */

    var description =
        document.getElementById(
            'analysisDescription'
        );


    if (description) {

        description.textContent =
            data.description;

    }


    /* =====================================================
       CHAT RESPONSE
    ===================================================== */

    addBotMessage(
        data.title,
        data.description
    );


    /* =====================================================
       ANALYSIS LAYER
    ===================================================== */

    if (map && analysisLayer) {

        if (!map.hasLayer(
            analysisLayer
        )) {

            map.addLayer(
                analysisLayer
            );

        }

    }

}



/* =========================================================
   REQUEST ANALYSIS
========================================================= */

function requestAnalysis(
    analysisId
) {

    showAnalysis(
        analysisId
    );

}



/* =========================================================
   BOT MESSAGE
========================================================= */

function addBotMessage(
    title,
    description
) {

    var chat =
        document.getElementById(
            'chatMessages'
        );


    if (!chat) {

        return;

    }


    /*
       Don't create too many identical
       welcome responses.
    */

    var message =
        document.createElement(
            'div'
        );


    message.className =
        'bot-message';


    message.innerHTML = `

        <div class="bot-avatar">

            <i class="fa-solid fa-brain"></i>

        </div>


        <div class="message-content">

            <span class="message-label">

                PITCHGRID ENGINE

            </span>


            <p>

                <strong>
                    ${title}
                </strong>

            </p>


            <p>

                ${description}

            </p>

        </div>

    `;


    chat.appendChild(
        message
    );


    chat.scrollTop =
        chat.scrollHeight;

}



/* =========================================================
   CHAT
========================================================= */

function sendChatMessage() {

    var input =
        document.getElementById(
            'chatInput'
        );


    if (!input) {

        return;

    }


    var query =
        input.value.trim();


    if (!query) {

        return;

    }


    input.value = '';


    var normalized =
        query.toLowerCase();


    var analysisId =
        null;


    if (

        normalized.includes(
            'fullback'
        )

        ||

        normalized.includes(
            'overlap'
        )

        ||

        normalized.includes(
            'exposure'
        )

    ) {

        analysisId =
            'fullback_overlap';

    }


    else if (

        normalized.includes(
            'compact'
        )

    ) {

        analysisId =
            'compactness';

    }


    else if (

        normalized.includes(
            'equality'
        )

        ||

        normalized.includes(
            'duel'
        )

        ||

        normalized.includes(
            '1v1'
        )

    ) {

        analysisId =
            'equality';

    }


    else if (

        normalized.includes(
            'voronoi'
        )

        ||

        normalized.includes(
            'control'
        )

    ) {

        analysisId =
            'voronoi';

    }


    else if (

        normalized.includes(
            'nearest'
        )

    ) {

        analysisId =
            'nearest_defender';

    }


    else if (

        normalized.includes(
            'distance'
        )

    ) {

        analysisId =
            'distance_analysis';

    }


    else if (

        normalized.includes(
            'shape'
        )

    ) {

        analysisId =
            'defensive_shape';

    }


    else if (

        normalized.includes(
            'zone'
        )

    ) {

        analysisId =
            'exposure_zone';

    }


    if (analysisId) {

        requestAnalysis(
            analysisId
        );

    }

    else {

        addBotMessage(

            'Spatial Query',

            'I can analyze Fullback Exposure, Defensive Compactness, Spatial Equality, Spatial Control, Nearest Defender, Distance, Defensive Shape and Exposure Zones.'

        );

    }

}



/* =========================================================
   ENTER KEY
========================================================= */

document.addEventListener(

    'DOMContentLoaded',

    function () {

        var input =
            document.getElementById(
                'chatInput'
            );


        if (input) {

            input.addEventListener(

                'keydown',

                function (event) {

                    if (
                        event.key === 'Enter'
                    ) {

                        event.preventDefault();

                        sendChatMessage();

                    }

                }

            );

        }

    }

);



/* =========================================================
   GLOBAL DEBUG
========================================================= */

console.log(
    'PitchGrid JS loaded.'
);

/* =========================================================
   PITCHGRID NEW ANALYSIS WORKSPACE
   BRIDGE LAYER
   Works with the existing PitchGrid / Leaflet engine
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       STATE
    ===================================================== */

    window.pgPlayers = [];
    window.pgBall = null;

    window.pgCurrentAnalysis = null;

    window.pgPlacementMode = null;

    window.pgPlacementTeam = "HOME";

    window.pgPlayerNumber = 1;

    window.pgAnalysisResult = null;

    window.pgInteractionReady = false;


    /* =====================================================
       ANALYSIS DEFINITIONS
    ===================================================== */

    window.pgAnalyses = {

        defensive_structure: {

            title: "Defensive Structure",

            description:
                "Measures the defensive block through its spatial footprint, width, depth and compactness.",

            requirements:
                "HOME defenders · minimum 3 players",

            icon:
                "fa-draw-polygon"

        },


        defensive_gaps: {

            title: "Defensive Gaps",

            description:
                "Identifies the largest spatial separation between defenders.",

            requirements:
                "HOME defenders · minimum 2 players",

            icon:
                "fa-arrows-left-right"

        },


        defensive_coverage: {

            title: "Defensive Coverage",

            description:
                "Estimates the space protected by the defensive structure and the remaining exposed space.",

            requirements:
                "HOME defenders · minimum 2 players",

            icon:
                "fa-shield"

        },


        nearest_pressure: {

            title:
                "Nearest Defender & Pressure",

            description:
                "Measures the distance between the ball or nearest attacker and the closest defender.",

            requirements:
                "HOME defenders + Ball or AWAY attacker",

            icon:
                "fa-crosshairs"

        },


        space_between_lines: {

            title:
                "Space Between Lines",

            description:
                "Measures the playable corridor between defensive units.",

            requirements:
                "Players from both teams",

            icon:
                "fa-arrows-up-down"

        },


        attacking_space: {

            title:
                "Attacking Space",

            description:
                "Identifies available space around attacking players.",

            requirements:
                "AWAY attackers + HOME defenders",

            icon:
                "fa-vector-square"

        },


        passing_lanes: {

            title:
                "Passing Lanes",

            description:
                "Evaluates potential passing connections and whether defenders obstruct them.",

            requirements:
                "AWAY attackers + HOME defenders",

            icon:
                "fa-route"

        },


               line_break: {

            title:
                "Line Break",

            description:
                "Examines whether an attacking player can penetrate the defensive line.",

            requirements:
                "AWAY attackers + HOME defenders",

            icon:
                "fa-arrow-right"

        },

        /* =====================================================
           UI COMPATIBILITY ALIASES
        ===================================================== */

        distance_analysis: {

            title:
                "Space Between Lines",

            description:
                "Measures the playable corridor between defensive and attacking structures.",

            requirements:
                "HOME + AWAY players",

            icon:
                "fa-arrows-up-down"

        },

        voronoi: {

            title:
                "Spatial Control",

            description:
                "Measures how the pitch is divided between HOME control, AWAY control and contested space.",

            requirements:
                "HOME + AWAY players",

            icon:
                "fa-vector-square"

        },

        fullback_overlap: {

            title:
                "Attacking Access",

            description:
                "Measures the attacking corridor toward goal and identifies defensive obstruction along that route.",

            requirements:
                "AWAY attackers + HOME defenders",

            icon:
                "fa-route"

        }

    };

    /* =====================================================
       INITIALIZE BRIDGE
    ===================================================== */

    function pgInitializeBridge() {

        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                pgInitializeBridge
            );

            return;

        }


        pgWaitForMap();

    }


    /* =====================================================
       WAIT FOR ORIGINAL LEAFLET MAP
       IMPORTANT:
       The original JS creates #map after ENTER PITCHGRID.
    ===================================================== */

    function pgWaitForMap() {

        if (
            typeof window.map !== "undefined" &&
            window.map
        ) {

            pgSetupMapInteraction();

            return;

        }


        setTimeout(
            pgWaitForMap,
            300
        );

    }


    /* =====================================================
       MAP INTERACTION
    ===================================================== */

    function pgSetupMapInteraction() {

        if (
            window.pgInteractionReady
        ) {

            return;

        }


        if (
            !window.map
        ) {

            return;

        }


        window.pgInteractionReady = true;


        window.map.on(
            "click",
            function (event) {

                if (
                    window.pgPlacementMode ===
                    "player"
                ) {

                    pgPlacePlayer(
                        event.latlng.lng,
                        event.latlng.lat
                    );

                    return;

                }


                if (
                    window.pgPlacementMode ===
                    "ball"
                ) {

                    pgPlaceBall(
                        event.latlng.lng,
                        event.latlng.lat
                    );

                    return;

                }

            }
        );


        console.log(
            "PitchGrid Analysis Bridge Ready."
        );

    }


    /* =====================================================
       START PLAYER PLACEMENT
    ===================================================== */

    window.pgStartPlayerPlacement =
        function () {

            window.pgPlacementMode =
                "player";


            /*
               Alternate HOME / AWAY automatically.
               First player = HOME
               Second player = AWAY
            */

            window.pgPlacementTeam =
                window.pgPlayers.length % 2 === 0
                    ? "HOME"
                    : "AWAY";


            pgShowPlacementMessage(
                `Click on the pitch to place ${window.pgPlacementTeam} player`
            );

        };


    /* =====================================================
       PLACE PLAYER
    ===================================================== */

    function pgPlacePlayer(
        x,
        y
    ) {

        const team =
            window.pgPlacementTeam;


        let position =
            "PLAYER";


        let name =
            `${team} Player ${window.pgPlayerNumber}`;


        /*
           Ask only after clicking.
           Keeps the workflow simple.
        */

        const customName =
            window.prompt(
                "Player name / number:",
                name
            );


        if (
            customName &&
            customName.trim()
        ) {

            name =
                customName.trim();

        }


        const customPosition =
            window.prompt(
                "Position:",
                team === "HOME"
                    ? "CB"
                    : "FW"
            );


        if (
            customPosition &&
            customPosition.trim()
        ) {

            position =
                customPosition
                    .trim()
                    .toUpperCase();

        }


        const player = {

            id:
                "pg_player_" +
                Date.now() +
                "_" +
                window.pgPlayerNumber,

            name:
                name,

            team:
                team,

            position:
                position,

            x:
                Number(
                    x.toFixed(2)
                ),

            y:
                Number(
                    y.toFixed(2)
                )

        };


        window.pgPlayers.push(
    player
);

console.log("PITCHGRID PLAYER ADDED:", player);

window.pgPlayerNumber++;

        window.pgPlacementMode =
            null;


        pgRenderPlayers();

        pgUpdateScenarioUI();


        pgShowPlacementMessage(
            `${name} added`
        );

    }


    /* =====================================================
       START BALL PLACEMENT
    ===================================================== */

    window.pgStartBallPlacement =
        function () {

            window.pgPlacementMode =
                "ball";


            pgShowPlacementMessage(
                "Click on the pitch to place the ball"
            );

        };


    /* =====================================================
       PLACE BALL
    ===================================================== */

    function pgPlaceBall(
        x,
        y
    ) {

        window.pgBall = {

            x:
                Number(
                    x.toFixed(2)
                ),

            y:
                Number(
                    y.toFixed(2)
                )

        };


        window.pgPlacementMode =
            null;


        pgRenderBall();

        pgUpdateScenarioUI();


        pgShowPlacementMessage(
            `Ball placed at X ${x.toFixed(1)} · Y ${y.toFixed(1)}`
        );

    }


    /* =====================================================
       PLAYER LAYER
    ===================================================== */

    let pgPlayerLayer = null;

    let pgBallLayer = null;

    let pgResultLayer = null;


    function pgCreateLayers() {

        if (
            !window.map
        ) {

            return;

        }


        if (
            !pgPlayerLayer
        ) {

            pgPlayerLayer =
                L.layerGroup()
                    .addTo(
                        window.map
                    );

        }


        if (
            !pgBallLayer
        ) {

            pgBallLayer =
                L.layerGroup()
                    .addTo(
                        window.map
                    );

        }


        if (
            !pgResultLayer
        ) {

            pgResultLayer =
                L.layerGroup()
                    .addTo(
                        window.map
                    );

        }

    }


    /* =====================================================
       RENDER PLAYERS
    ===================================================== */

    function pgRenderPlayers() {

        if (
            !window.map
        ) {

            return;

        }


        pgCreateLayers();


        pgPlayerLayer.clearLayers();


        window.pgPlayers.forEach(
            function (player) {

                const isHome =
                    player.team ===
                    "HOME";


                const marker =
                    L.circleMarker(

                        [
                            player.y,
                            player.x
                        ],

                        {

                           radius:
    7,

color:
    "#ffffff",

weight:
    2.5,

fillColor:
    isHome
        ? "#17845b"
        : "#475569",

fillOpacity:
    1

                        }

                    );


                marker.bindTooltip(

                    `<strong>${pgEscape(
                        player.name
                    )}</strong><br>
                    ${pgEscape(
                        player.position
                    )}<br>
                    ${player.team}`,

                    {

                        direction:
                            "top",

                        offset:
                            [0, -8]

                    }

                );


                marker.on(
                    "click",
                    function (event) {

                        L.DomEvent.stopPropagation(
                            event
                        );


                        pgPlayerInfo(
                            player
                        );

                    }
                );


                marker.addTo(
                    pgPlayerLayer
                );


                /*
                   Player number / name
                */

                const label =
                    L.marker(

                        [
                            player.y,
                            player.x
                        ],

                        {

                            icon:
                                L.divIcon({

                                    className:
                                        "pg-player-label",

                                    html:
                                        `<span>${pgEscape(
                                            player.name
                                        )}</span>`,

                                    iconSize:
                                        null,

                                    iconAnchor:
                                        [0, 18]

                                }),

                            interactive:
                                false

                        }

                    );


                label.addTo(
                    pgPlayerLayer
                );

            }
        );

    }


    /* =====================================================
       PLAYER INFO
    ===================================================== */

    function pgPlayerInfo(
        player
    ) {

        pgShowPlacementMessage(

            `${player.name} · ${player.position} · ${player.team} · X ${player.x} · Y ${player.y}`

        );

    }


    /* =====================================================
       RENDER BALL
    ===================================================== */

    function pgRenderBall() {

        if (
            !window.map
        ) {

            return;

        }


        pgCreateLayers();


        pgBallLayer.clearLayers();


        if (
            !window.pgBall
        ) {

            return;

        }


const ballMarker =
    L.marker(
        [
            window.pgBall.y,
            window.pgBall.x
        ],
        {
            icon:
                L.divIcon({

                    className:
                        "pg-ball-marker",

                    html:
                        `
                        <span class="pg-ball-core">
                            <i class="fa-solid fa-futbol"></i>
                        </span>
                        `,

                    iconSize:
                        [22, 22],

                    iconAnchor:
                        [11, 11]

                }),

            interactive:
                true
        }
    );

        ballMarker.bindTooltip(

            `BALL<br>
             X: ${window.pgBall.x.toFixed(1)}<br>
             Y: ${window.pgBall.y.toFixed(1)}`,

            {

                direction:
                    "top"

            }

        );


        ballMarker.addTo(
            pgBallLayer
        );

    }


    /* =====================================================
       SELECT ANALYSIS
    ===================================================== */

    window.pgSelectAnalysis =
        function (
            analysisId
        ) {

            if (
                !window.pgAnalyses[
                    analysisId
                ]
            ) {

                console.warn(
                    "Unknown PitchGrid analysis:",
                    analysisId
                );

                return;

            }


            window.pgCurrentAnalysis =
                analysisId;

pgUpdateAnalysisButtons();

pgUpdateSelectedAnalysis();

pgUpdateSceneIntelligence();

            /*
               Also update the original
               pitch title / insight if present.
            */

            const analysis =
                window.pgAnalyses[
                    analysisId
                ];


            const pitchTitle =
                document.getElementById(
                    "pitchTitle"
                );


            if (
                pitchTitle
            ) {

                pitchTitle.textContent =
                    analysis.title;

            }


            const oldTitle =
                document.getElementById(
                    "analysisTitle"
                );


            if (
                oldTitle
            ) {

                oldTitle.textContent =
                    analysis.title;

            }


            const oldDescription =
                document.getElementById(
                    "analysisDescription"
                );


            if (
    oldDescription
) {
    oldDescription.textContent =
        analysis.description;
}


/* ---------------------------------------------------------
   SPATIAL BRIEF
--------------------------------------------------------- */

if (
    typeof window.pgUpdateSpatialBrief ===
    "function"
) {
    window.pgUpdateSpatialBrief(
        analysisId
    );
}

};

    /* =====================================================
       UPDATE SELECTED ANALYSIS
    ===================================================== */

    function pgUpdateSelectedAnalysis() {

        const analysis =
            window.pgAnalyses[
                window.pgCurrentAnalysis
            ];


        if (
            !analysis
        ) {

            return;

        }


        const title =
            document.getElementById(
                "pgSelectedAnalysisTitle"
            );


        const description =
            document.getElementById(
                "pgSelectedAnalysisDescription"
            );


        const requirements =
            document.getElementById(
                "pgAnalysisRequirements"
            );


        if (
            title
        ) {

            title.textContent =
                analysis.title;

        }


        if (
            description
        ) {

            description.textContent =
                analysis.description;

        }


        if (
            requirements
        ) {

            requirements.innerHTML = `

                <span>
                    <i class="fa-solid fa-database"></i>
                    ${pgEscape(
                        analysis.requirements
                    )}
                </span>

            `;

        }

    }


    /* =====================================================
       ACTIVE ANALYSIS BUTTON
    ===================================================== */

    function pgUpdateAnalysisButtons() {

        document
            .querySelectorAll(
                ".analysis-item"
            )
            .forEach(
                function (button) {

                    const id =
                        button.dataset.analysis;


                    button.classList.toggle(

                        "active",

                        id ===
                        window.pgCurrentAnalysis

                    );

                }
            );

    }


    /* =====================================================
       RUN ANALYSIS
    ===================================================== */

    window.pgRunAnalysis =
        function () {

            if (
                !window.pgCurrentAnalysis
            ) {

                window.pgSelectAnalysis(
                    "defensive_structure"
                );

            }


            const analysis =
                window.pgAnalyses[
                    window.pgCurrentAnalysis
                ];


            if (
                !analysis
            ) {

                return;

            }


            let result;


            switch (
                window.pgCurrentAnalysis
            ) {

                case "defensive_structure":

                    result =
                        pgAnalyzeStructure();

                    break;


                case "defensive_gaps":

                    result =
                        pgAnalyzeGaps();

                    break;


                case "defensive_coverage":

                    result =
                        pgAnalyzeCoverage();

                    break;


                case "nearest_pressure":

                    result =
                        pgAnalyzePressure();

                    break;

                    

                    

case "space_between_lines":

case "distance_analysis":

    result =
        pgAnalyzeSpaceBetweenLines();

    break;


case "spatial_control":

case "voronoi":

    result =
        analyzeSpatialControl();

    break;


case "attacking_space":

case "fullback_overlap":

case "attacking_access":

    result =
        pgAnalyzeAttackingSpace();

    break;


case "line_break":

    result =
        pgAnalyzeLineBreak();

    break;

                case "passing_lanes":

                    result =
                        pgAnalyzePassingLanes();

                    break;


                case "line_break":

                    result =
                        pgAnalyzeLineBreak();

                    break;


                default:

                    result =
                        pgDemoResult();

            }


            if (
                !result
            ) {

                return;

            }


            if (
                result.error
            ) {

                pgShowInsight(
                    analysis,
                    result
                );

                return;

            }


            window.pgAnalysisResult =
                result;


            pgDrawResult(
                window.pgCurrentAnalysis,
                result
            );


            pgShowInsight(
                analysis,
                result
            );


            pgUpdateScenarioUI();


            pgShowPlacementMessage(
                "Analysis completed"
            );

        };


    /* =====================================================
       DEFENSIVE STRUCTURE
    ===================================================== */

    function pgAnalyzeStructure() {

        const defenders =
            pgHomePlayers();


        if (
            defenders.length <
            3
        ) {

            return pgInsufficient(
                "Add at least 3 HOME defenders."
            );

        }


        const points =
            defenders.map(
                function (p) {

                    return {

                        x:
                            p.x,

                        y:
                            p.y

                    };

                }
            );


        const hull =
            pgConvexHull(
                points
            );


        const area =
            pgPolygonArea(
                hull
            );


        const bounds =
            pgBounds(
                defenders
            );


        return {

            primary:
                area.toFixed(1) +
                " m²",

            secondary:
                (
                    bounds.maxX -
                    bounds.minX
                ).toFixed(1) +
                " m",

            relationship:
                (
                    bounds.maxY -
                    bounds.minY
                ).toFixed(1) +
                " m",

            primaryLabel:
                "Block Area",

            secondaryLabel:
                "Width",

            relationshipLabel:
                "Depth",

            geometry:
                hull,

            text:
                `The defensive block occupies approximately ${area.toFixed(1)} m² with a width of ${(bounds.maxX - bounds.minX).toFixed(1)} m and depth of ${(bounds.maxY - bounds.minY).toFixed(1)} m.`

        };

    }


    /* =====================================================
       DEFENSIVE GAPS
    ===================================================== */

    function pgAnalyzeGaps() {

        const defenders =
            pgHomePlayers();


        if (
            defenders.length <
            2
        ) {

            return pgInsufficient(
                "Add at least 2 HOME defenders."
            );

        }


        let maxDistance =
            0;


        let first =
            null;


        let second =
            null;


        for (
            let i = 0;
            i < defenders.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < defenders.length;
                j++
            ) {

                const distance =
                    pgDistance(
                        defenders[i],
                        defenders[j]
                    );


                if (
                    distance >
                    maxDistance
                ) {

                    maxDistance =
                        distance;

                    first =
                        defenders[i];

                    second =
                        defenders[j];

                }

            }

        }


        return {

            primary:
                maxDistance.toFixed(1) +
                " m",

            secondary:
                first.name +
                " ↔ " +
                second.name,

            relationship:
                "Critical Gap",

            primaryLabel:
                "Largest Gap",

            secondaryLabel:
                "Players",

            relationshipLabel:
                "Spatial Meaning",

            geometry: [

                {
                    x:
                        first.x,

                    y:
                        first.y

                },

                {
                    x:
                        second.x,

                    y:
                        second.y

                }

            ],

            text:
                `The largest measured defensive separation is ${maxDistance.toFixed(1)} m between ${first.name} and ${second.name}.`

        };

    }


    /* =====================================================
       DEFENSIVE COVERAGE
    ===================================================== */

    function pgAnalyzeCoverage() {

        const defenders =
            pgHomePlayers();


        if (
            defenders.length <
            2
        ) {

            return pgInsufficient(
                "Add at least 2 HOME defenders."
            );

        }


        const radius =
            8;


        const pitchArea =
            105 *
            68;


        /*
           Approximation for the visual prototype.
           This will later become:
           ST_Buffer + ST_Union + ST_Difference
           in PostGIS.
        */

        const covered =
            Math.min(

                pitchArea,

                defenders.length *
                Math.PI *
                radius *
                radius *
                0.68

            );


        const exposed =
            pitchArea -
            covered;


        return {

            primary:
                covered.toFixed(0) +
                " m²",

            secondary:
                exposed.toFixed(0) +
                " m²",

            relationship:
                (
                    covered /
                    pitchArea *
                    100
                ).toFixed(1) +
                "%",

            primaryLabel:
                "Covered Space",

            secondaryLabel:
                "Exposed Space",

            relationshipLabel:
                "Coverage Ratio",

            geometry:
                defenders.map(
                    function (p) {

                        return {

                            x:
                                p.x,

                            y:
                                p.y

                        };

                    }
                ),

            text:
                `The defensive structure covers an estimated ${covered.toFixed(0)} m², leaving approximately ${exposed.toFixed(0)} m² exposed.`

        };

    }


    /* =====================================================
       NEAREST DEFENDER / PRESSURE
    ===================================================== */

    function pgAnalyzePressure() {

        const defenders =
            pgHomePlayers();


        if (
            defenders.length ===
            0
        ) {

            return pgInsufficient(
                "Add HOME defenders first."
            );

        }


        let target =
            window.pgBall;


        if (
            !target
        ) {

            const attackers =
                pgAwayPlayers();


            if (
                attackers.length >
                0
            ) {

                target =
                    attackers[0];

            }

        }


        if (
            !target
        ) {

            return pgInsufficient(
                "Place the ball or add an AWAY attacker."
            );

        }


        let nearest =
            null;


        let shortest =
            Infinity;


        defenders.forEach(
            function (defender) {

                const distance =
                    pgDistance(
                        defender,
                        target
                    );


                if (
                    distance <
                    shortest
                ) {

                    shortest =
                        distance;

                    nearest =
                        defender;

                }

            }
        );


        return {

            primary:
                shortest.toFixed(1) +
                " m",

            secondary:
                nearest.name,

            relationship:
                pgPressureLevel(
                    shortest
                ),

            primaryLabel:
                "Pressure Distance",

            secondaryLabel:
                "Nearest Defender",

            relationshipLabel:
                "Pressure Level",

            geometry: [

                {

                    x:
                        nearest.x,

                    y:
                        nearest.y

                },

                {

                    x:
                        target.x,

                    y:
                        target.y

                }

            ],

            text:
                `${nearest.name} is the nearest defender at ${shortest.toFixed(1)} m from the selected reference point.`

        };

    }


    /* =====================================================
       SPACE BETWEEN LINES
    ===================================================== */

    function pgAnalyzeSpaceBetweenLines() {

        const players =
            window.pgPlayers;


        if (
            players.length <
            4
        ) {

            return pgInsufficient(
                "Add more players from the two teams."
            );

        }


        const home =
            pgHomePlayers();


        const away =
            pgAwayPlayers();


        if (
            !home.length ||
            !away.length
        ) {

            return pgInsufficient(
                "Add players from both teams."
            );

        }


        const homeCenter =
            pgAveragePoint(
                home
            );


        const awayCenter =
            pgAveragePoint(
                away
            );


        const distance =
            pgDistance(
                homeCenter,
                awayCenter
            );


        return {

            primary:
                distance.toFixed(1) +
                " m",

            secondary:
                "Central Corridor",

            relationship:
                distance >
                15
                    ? "Large Space"
                    : "Compact",

            primaryLabel:
                "Line Separation",

            secondaryLabel:
                "Reception Zone",

            relationshipLabel:
                "Interpretation",

            geometry: [

                homeCenter,

                awayCenter

            ],

            text:
                `The estimated separation between the two team structures is ${distance.toFixed(1)} m.`

        };

    }


    /* =====================================================
       ATTACKING SPACE
    ===================================================== */

    function pgAnalyzeAttackingSpace() {

        const attackers =
            pgAwayPlayers();


        const defenders =
            pgHomePlayers();


        if (
            !attackers.length ||
            !defenders.length
        ) {

            return pgInsufficient(
                "Add AWAY attackers and HOME defenders."
            );

        }


        const separation =
            pgAverageNearestDistance(
                attackers,
                defenders
            );


        return {

            primary:
                separation.toFixed(1) +
                " m",

            secondary:
                attackers.length,

            relationship:
                separation >
                12
                    ? "Open Space"
                    : "Tight Space",

            primaryLabel:
                "Average Access Space",

            secondaryLabel:
                "Attackers",

            relationshipLabel:
                "Spatial Condition",

            text:
                `Attacking players are separated from their nearest defenders by an average of ${separation.toFixed(1)} m.`

        };

    }


    /* =====================================================
       PASSING LANES
    ===================================================== */

    function pgAnalyzePassingLanes() {

        const attackers =
            pgAwayPlayers();


        const defenders =
            pgHomePlayers();


        if (
            attackers.length <
            2 ||
            defenders.length <
            1
        ) {

            return pgInsufficient(
                "Add at least 2 AWAY attackers and 1 HOME defender."
            );

        }


        let open =
            0;


        let blocked =
            0;


        let example =
            null;


        for (
            let i = 0;
            i < attackers.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < attackers.length;
                j++
            ) {

                let isBlocked =
                    false;


                defenders.forEach(
                    function (defender) {

                        const d =
                            pgPointToSegmentDistance(

                                defender,

                                attackers[i],

                                attackers[j]

                            );


                        if (
                            d <
                            3
                        ) {

                            isBlocked =
                                true;

                        }

                    }
                );


                if (
                    isBlocked
                ) {

                    blocked++;

                } else {

                    open++;


                    if (
                        !example
                    ) {

                        example = [

                            attackers[i],

                            attackers[j]

                        ];

                    }

                }

            }

        }


        return {

            primary:
                open,

            secondary:
                blocked,

            relationship:
                open >= blocked
                    ? "Open Passing Network"
                    : "Compressed Network",

            primaryLabel:
                "Open Lanes",

            secondaryLabel:
                "Blocked Lanes",

            relationshipLabel:
                "Passing Environment",

            geometry:
                example
                    ? [

                        {

                            x:
                                example[0].x,

                            y:
                                example[0].y

                        },

                        {

                            x:
                                example[1].x,

                            y:
                                example[1].y

                        }

                    ]
                    : null,

            text:
                `The current snapshot contains ${open} potentially open passing lanes and ${blocked} blocked lanes.`

        };

    }


    /* =====================================================
       LINE BREAK
    ===================================================== */

    function pgAnalyzeLineBreak() {

        const attackers =
            pgAwayPlayers();


        const defenders =
            pgHomePlayers();


        if (
            !attackers.length ||
            defenders.length <
            2
        ) {

            return pgInsufficient(
                "Add attacking players and at least 2 defenders."
            );

        }


        let best =
            attackers[0];


        let bestDistance =
            Infinity;


        attackers.forEach(
            function (attacker) {

                const distance =
                    pgAverageDistanceToGroup(
                        attacker,
                        defenders
                    );


                if (
                    distance <
                    bestDistance
                ) {

                    bestDistance =
                        distance;

                    best =
                        attacker;

                }

            }
        );


        return {

            primary:
                bestDistance.toFixed(1) +
                " m",

            secondary:
                best.name,

            relationship:
                bestDistance <
                10
                    ? "Inside Defensive Structure"
                    : "Outside Structure",

            primaryLabel:
                "Line Interaction",

            secondaryLabel:
                "Attacker",

            relationshipLabel:
                "Break Status",

            text:
                `${best.name} is the closest attacking candidate to the defensive structure at an average distance of ${bestDistance.toFixed(1)} m.`

        };

    }


    /* =====================================================
       DRAW RESULT
    ===================================================== */

    function pgDrawResult(
        analysisId,
        result
    ) {

        if (
            !window.map
        ) {

            return;

        }


        pgCreateLayers();


        pgResultLayer.clearLayers();


        if (
            !result
        ) {

            return;

        }


        /*
           DEFENSIVE STRUCTURE
        */

        if (
            analysisId ===
            "defensive_structure"
        ) {

            if (
                result.geometry &&
                result.geometry.length >=
                3
            ) {

                L.polygon(

                    result.geometry.map(
                        function (p) {

                            return [
                                p.y,
                                p.x
                            ];

                        }
                    ),

                    {

                        color:
                            "#22d3ee",

                        weight:
                            3,

                        fillColor:
                            "#22d3ee",

                        fillOpacity:
                            0.10,

                        dashArray:
                            "8 6"

                    }

                ).addTo(
                    pgResultLayer
                );

            }


            return;

        }


        /*
           DEFENSIVE GAP
        */

        if (
            analysisId ===
            "defensive_gaps"
        ) {

            if (
                result.geometry
            ) {

                L.polyline(

                    result.geometry.map(
                        function (p) {

                            return [
                                p.y,
                                p.x
                            ];

                        }
                    ),

                    {

                        color:
                            "#fb7185",

                        weight:
                            5,

                        dashArray:
                            "8 6"

                    }

                ).addTo(
                    pgResultLayer
                );


                const middle =
                    {

                        x:
                            (
                                result.geometry[0].x +
                                result.geometry[1].x
                            ) / 2,

                        y:
                            (
                                result.geometry[0].y +
                                result.geometry[1].y
                            ) / 2

                    };


                pgAddMapLabel(

                    middle.x,

                    middle.y,

                    result.primary

                );

            }


            return;

        }


        /*
           COVERAGE
        */

        if (
            analysisId ===
            "defensive_coverage"
        ) {

            if (
                result.geometry
            ) {

                result.geometry.forEach(
                    function (p) {

                        L.circle(

                            [
                                p.y,
                                p.x
                            ],

                            {

                                radius:
                                    8,

                                color:
                                    "#34d399",

                                weight:
                                    1.5,

                                fillColor:
                                    "#34d399",

                                fillOpacity:
                                    0.10

                            }

                        ).addTo(
                            pgResultLayer
                        );

                    }
                );

            }


            return;

        }


        /*
           PRESSURE
        */

        if (
            analysisId ===
            "nearest_pressure"
        ) {

            if (
                result.geometry
            ) {

                L.polyline(

                    result.geometry.map(
                        function (p) {

                            return [
                                p.y,
                                p.x
                            ];

                        }
                    ),

                    {

                        color:
                            "#fbbf24",

                        weight:
                            4,

                        dashArray:
                            "6 5"

                    }

                ).addTo(
                    pgResultLayer
                );

            }


            return;

        }


        /*
           GENERIC LINE
        */

        if (
            result.geometry &&
            result.geometry.length ===
            2
        ) {

            L.polyline(

                result.geometry.map(
                    function (p) {

                        return [
                            p.y,
                            p.x
                        ];

                    }
                ),

                {

                    color:
                        "#a78bfa",

                    weight:
                        4,

                    dashArray:
                        "8 6"

                }

            ).addTo(
                pgResultLayer
            );

        }

    }


    /* =====================================================
       MAP LABEL
    ===================================================== */

    function pgAddMapLabel(
        x,
        y,
        text
    ) {

        L.marker(

            [
                y,
                x
            ],

            {

                icon:
                    L.divIcon({

                        className:
                            "pg-analysis-label",

                        html:
                            `<span>${pgEscape(
                                text
                            )}</span>`,

                        iconSize:
                            null,

                        iconAnchor:
                            [0, 0]

                    }),

                interactive:
                    false

            }

        ).addTo(
            pgResultLayer
        );

    }


    /* =====================================================
       SHOW INSIGHT
    ===================================================== */

    function pgShowInsight(
        analysis,
        result
    ) {

        const title =
            document.getElementById(
                "pgInsightTitle"
            );


        const text =
            document.getElementById(
                "pgInsightText"
            );


        const metrics =
            document.getElementById(
                "pgInsightMetrics"
            );


        if (
            title
        ) {

            title.textContent =
                analysis.title;

        }


        if (
            text
        ) {

            text.textContent =
                result.text ||
                result.error ||
                analysis.description;

        }


        if (
            metrics
        ) {

            metrics.innerHTML = `

                <div class="insight-metric">

                    <span>
                        ${pgEscape(
                            result.primaryLabel ||
                            "Primary"
                        )}
                    </span>

                    <strong>
                        ${pgEscape(
                            String(
                                result.primary ||
                                "—"
                            )
                        )}
                    </strong>

                </div>


                <div class="insight-metric">

                    <span>
                        ${pgEscape(
                            result.secondaryLabel ||
                            "Secondary"
                        )}
                    </span>

                    <strong>
                        ${pgEscape(
                            String(
                                result.secondary ||
                                "—"
                            )
                        )}
                    </strong>

                </div>


                <div class="insight-metric">

                    <span>
                        ${pgEscape(
                            result.relationshipLabel ||
                            "Relationship"
                        )}
                    </span>

                    <strong>
                        ${pgEscape(
                            String(
                                result.relationship ||
                                "—"
                            )
                        )}
                    </strong>

                </div>

            `;

        }

    }


    /* =====================================================
       REPORT MODE
    ===================================================== */

    window.pgSetReportMode =
        function (
            mode
        ) {

            if (
                !window.pgAnalysisResult
            ) {

                pgShowPlacementMessage(
                    "Run an analysis first."
                );

                return;

            }


            const analysis =
                window.pgAnalyses[
                    window.pgCurrentAnalysis
                ];


            const result =
                window.pgAnalysisResult;


            const report =
                document.getElementById(
                    "pgReportText"
                );


            if (
                !report
            ) {

                return;

            }


            let heading =
                "FAN REPORT";


            if (
                mode ===
                "coach"
            ) {

                heading =
                    "COACH REPORT";

            }


            if (
                mode ===
                "analyst"
            ) {

                heading =
                    "PERFORMANCE ANALYST REPORT";

            }


            report.innerHTML = `

                <strong>
                    ${heading}
                </strong>

                <p>
                    ${pgEscape(
                        analysis.title
                    )}
                </p>

                <p>
                    ${pgEscape(
                        result.text ||
                        analysis.description
                    )}
                </p>

                <small>
                    Spatial method:
                    ${pgEscape(
                        analysis.requirements
                    )}
                </small>

            `;

        };


    /* =====================================================
       ASSISTANT
    ===================================================== */

    window.pgAskAssistant =
        function () {

            const input =
                document.getElementById(
                    "pgAssistantInput"
                );


            if (
                !input
            ) {

                return;

            }


            const question =
                input.value
                    .trim()
                    .toLowerCase();


            if (
                !question
            ) {

                return;

            }


            input.value =
                "";


            let analysisId =
                null;


            if (
                question.includes(
                    "gap"
                ) ||
                question.includes(
                    "spacing"
                )
            ) {

                analysisId =
                    "defensive_gaps";

            }


            else if (
                question.includes(
                    "pressure"
                ) ||
                question.includes(
                    "nearest"
                )
            ) {

                analysisId =
                    "nearest_pressure";

            }


            else if (
                question.includes(
                    "coverage"
                ) ||
                question.includes(
                    "cover"
                )
            ) {

                analysisId =
                    "defensive_coverage";

            }


            else if (
                question.includes(
                    "structure"
                ) ||
                question.includes(
                    "shape"
                ) ||
                question.includes(
                    "compact"
                )
            ) {

                analysisId =
                    "defensive_structure";

            }


            else if (
                question.includes(
                    "passing"
                ) ||
                question.includes(
                    "lane"
                )
            ) {

                analysisId =
                    "passing_lanes";

            }


            else if (
                question.includes(
                    "line break"
                )
            ) {

                analysisId =
                    "line_break";

            }


            if (
                analysisId
            ) {

                window.pgSelectAnalysis(
                    analysisId
                );


                pgShowPlacementMessage(

                    `I selected ${window.pgAnalyses[analysisId].title}. Press RUN ANALYSIS.`

                );

            } else {

                pgShowPlacementMessage(

                    "Try: defensive gaps, pressure, coverage, structure or passing lanes."

                );

            }

        };


    /* =====================================================
       RESET
    ===================================================== */

   window.pgResetScenario =
    function () {

        window.pgPlayers = [];
        window.pgBall = null;
        window.pgAnalysisResult = null;
        window.pgCurrentAnalysis = null;
        window.pgPlayerNumber = 1;


        if (pgPlayerLayer) {
            pgPlayerLayer.clearLayers();
        }


        if (pgBallLayer) {
            pgBallLayer.clearLayers();
        }


        if (pgResultLayer) {
            pgResultLayer.clearLayers();
        }


        const report =
            document.getElementById("pgReportText");

        if (report) {
            report.innerHTML = "";
        }


        const insight =
            document.getElementById("pgInsightTitle");

        if (insight) {
            insight.textContent =
                "No analysis executed";
        }


        const insightText =
            document.getElementById("pgInsightText");

        if (insightText) {
            insightText.textContent =
                "Add players and the ball, then run a defensive analysis.";
        }


        const metrics =
            document.getElementById("pgInsightMetrics");

        if (metrics) {
            metrics.innerHTML = "";
        }


        /*
         * CLEAR ALL GEOMETRY DETAIL
         */

        document
            .querySelectorAll(".pg-geometry-detail")
            .forEach(function (element) {

                element.innerHTML = "";

            });


        /*
         * CLEAR CURRENT EVIDENCE CONTENT
         */

        document
            .querySelectorAll(".evidence-detail-grid")
            .forEach(function (element) {

                element.innerHTML = "";

            });


        document
            .querySelectorAll(".evidence-method")
            .forEach(function (element) {

                element.innerHTML = "";

            });


        /*
         * UPDATE SCENARIO UI
         */

        pgUpdateScenarioUI();


        /*
         * RESET MESSAGE
         */

        pgShowPlacementMessage(
            "Scenario reset"
        );

    };

    /* =====================================================
       IMPORT SCENARIO
    ===================================================== */

    window.pgImportScenario =
        function () {

            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "file";


            input.accept =
                ".json,.csv";


            input.style.display =
                "none";


            document.body.appendChild(
                input
            );


            input.addEventListener(
                "change",
                function () {

                    const file =
                        input.files[0];


                    if (
                        !file
                    ) {

                        input.remove();

                        return;

                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        function () {

                            try {

                                if (
                                    file.name
                                        .toLowerCase()
                                        .endsWith(
                                            ".json"
                                        )
                                ) {

                                    pgImportJSON(
                                        reader.result
                                    );

                                } else {

                                    pgImportCSV(
                                        reader.result
                                    );

                                }

                            } catch (
                                error
                            ) {

                                console.error(
                                    error
                                );


                                pgShowPlacementMessage(
                                    "Could not import scenario."
                                );

                            }


                            input.remove();

                        };


                    reader.readAsText(
                        file
                    );

                }
            );


            input.click();

        };


    /* =====================================================
       IMPORT JSON
    ===================================================== */

    function pgImportJSON(
        text
    ) {

        const data =
            JSON.parse(
                text
            );


        const players =
            Array.isArray(data)
                ? data
                : data.players;


        if (
            !Array.isArray(
                players
            )
        ) {

            throw new Error(
                "Invalid JSON player data."
            );

        }


        window.pgPlayers =
            players
                .map(
                    function (
                        player,
                        index
                    ) {

                        return {

                            id:
                                player.id ||
                                `import_${index}`,

                            name:
                                player.name ||
                                `Player ${index + 1}`,

                            team:
                                String(
                                    player.team ||
                                    "HOME"
                                ).toUpperCase() ===
                                "AWAY"
                                    ? "AWAY"
                                    : "HOME",

                            position:
                                player.position ||
                                "CM",

                            x:
                                Number(
                                    player.x
                                ),

                            y:
                                Number(
                                    player.y
                                )

                        };

                    }
                )
                .filter(
                    function (player) {

                        return (

                            Number.isFinite(
                                player.x
                            ) &&

                            Number.isFinite(
                                player.y
                            )

                        );

                    }
                );


        if (
            data.ball
        ) {

            window.pgBall = {

                x:
                    Number(
                        data.ball.x
                    ),

                y:
                    Number(
                        data.ball.y
                    )

            };

        }


        pgRenderPlayers();

        pgRenderBall();

        pgUpdateScenarioUI();


        pgShowPlacementMessage(
            `${window.pgPlayers.length} players imported`
        );

    }


    /* =====================================================
       IMPORT CSV
    ===================================================== */

    function pgImportCSV(
        text
    ) {

        const lines =
            text
                .split(/\r?\n/)
                .filter(
                    function (line) {

                        return line.trim();

                    }
                );


        if (
            lines.length <
            2
        ) {

            throw new Error(
                "CSV is empty."
            );

        }


        const headers =
            lines[0]
                .split(",")
                .map(
                    function (header) {

                        return header
                            .trim()
                            .toLowerCase();

                    }
                );


        const players =
            [];


        for (
            let i = 1;
            i < lines.length;
            i++
        ) {

            const values =
                lines[i]
                    .split(",")
                    .map(
                        function (value) {

                            return value.trim();

                        }
                    );


            const row = {};


            headers.forEach(
                function (
                    header,
                    index
                ) {

                    row[header] =
                        values[index];

                }
            );


            const player = {

                id:
                    row.id ||
                    `csv_${i}`,

                name:
                    row.name ||
                    `Player ${i}`,

                team:
                    String(
                        row.team ||
                        "HOME"
                    ).toUpperCase() ===
                    "AWAY"
                        ? "AWAY"
                        : "HOME",

                position:
                    row.position ||
                    "CM",

                x:
                    Number(
                        row.x
                    ),

                y:
                    Number(
                        row.y
                    )

            };


            if (
                Number.isFinite(
                    player.x
                ) &&
                Number.isFinite(
                    player.y
                )
            ) {

                players.push(
                    player
                );

            }

        }


        window.pgPlayers =
            players;


        pgRenderPlayers();

        pgUpdateScenarioUI();


        pgShowPlacementMessage(
            `${players.length} players imported`
        );

    }


    /* =====================================================
       SCENARIO UI
    ===================================================== */

    function pgUpdateScenarioUI() {

        const count =
            document.getElementById(
                "pgPlayerCount"
            );


        const ballStatus =
            document.getElementById(
                "pgBallStatus"
            );


        if (
            count
        ) {

            const home =
                pgHomePlayers()
                    .length;


            const away =
                pgAwayPlayers()
                    .length;


            count.textContent =
                `${home} H · ${away} A`;

        }


        if (
            ballStatus
        ) {

            ballStatus.textContent =
                window.pgBall
                    ? "SET"
                    : "NOT SET";

        }
            pgUpdateSceneIntelligence();

    }

    


    /* =====================================================
       ANALYSIS GROUP TOGGLE
    ===================================================== */

    window.pgToggleAnalysisGroup =
        function (
            button
        ) {

            if (
                !button
            ) {

                return;

            }


            button.classList.toggle(
                "active"
            );


            const content =
                button.nextElementSibling;


            if (
                content
            ) {

                content.classList.toggle(
                    "open"
                );

            }

        };

        /* =====================================================
   SCENE INTELLIGENCE
===================================================== */

function pgUpdateSceneIntelligence() {

    const title =
        document.getElementById(
            "sceneIntelTitle"
        );

    const status =
        document.getElementById(
            "sceneIntelStatus"
        );

    const homeEl =
        document.getElementById(
            "intelHomePlayers"
        );

    const awayEl =
        document.getElementById(
            "intelAwayPlayers"
        );

    const ballEl =
        document.getElementById(
            "intelBall"
        );

    const note =
        document.getElementById(
            "sceneIntelNote"
        );

    if (
        !title ||
        !status ||
        !homeEl ||
        !awayEl ||
        !ballEl ||
        !note
    ) {
        return;
    }


    const id =
        window.pgCurrentAnalysis;

    const home =
        pgHomePlayers().length;

    const away =
        pgAwayPlayers().length;

    const ball =
        !!window.pgBall;


    const requirements = {

        defensive_structure: {
            home: 3,
            away: 0,
            ball: false
        },

        defensive_gaps: {
            home: 2,
            away: 0,
            ball: false
        },

        defensive_coverage: {
            home: 2,
            away: 0,
            ball: false
        },

        nearest_pressure: {
            home: 1,
            away: 1,
            ball: true
        },

        space_between_lines: {
            home: 1,
            away: 1,
            total: 4,
            ball: false
        },

        attacking_space: {
            home: 1,
            away: 1,
            ball: false
        },

        passing_lanes: {
            home: 1,
            away: 2,
            ball: false
        },

        line_break: {
            home: 2,
            away: 1,
            ball: false
        },

        fullback_overlap: {
            home: 2,
            away: 1,
            ball: false
        }

    };


    const req =
        requirements[id] || {
            home: 1,
            away: 1,
            ball: false
        };


    const analysis =
        window.pgAnalyses?.[id];


    title.textContent =
        (
            analysis?.title ||
            "Spatial Analysis"
        ).toUpperCase();


    /*
       HOME
    */

    if (req.home > 0) {

        const homeReady =
            home >= req.home;

        homeEl.textContent =
            `${home} / ${req.home}`;

        homeEl.style.color =
            homeReady
                ? "#17845b"
                : "#0f172a";

    } else {

        homeEl.textContent =
            "—";

    }


    /*
       AWAY
    */

    if (req.away > 0) {

        const awayReady =
            away >= req.away;

        awayEl.textContent =
            `${away} / ${req.away}`;

        awayEl.style.color =
            awayReady
                ? "#17845b"
                : "#0f172a";

    } else {

        awayEl.textContent =
            "—";

    }


    /*
       BALL
    */

    if (req.ball) {

        ballEl.textContent =
            ball
                ? "SET ✓"
                : "REQUIRED";

        ballEl.style.color =
            ball
                ? "#17845b"
                : "#0f172a";

    } else {

        ballEl.textContent =
            ball
                ? "SET"
                : "OPTIONAL";

        ballEl.style.color =
            "#0f172a";

    }


    /*
       CHECK REQUIREMENTS
    */

    const homeReady =
        home >=
        (req.home || 0);

    const awayReady =
        away >=
        (req.away || 0);

    const totalReady =
        !req.total ||
        (
            home + away >=
            req.total
        );

    const ballReady =
        !req.ball ||
        ball;


    const ready =
        homeReady &&
        awayReady &&
        totalReady &&
        ballReady;


    /*
       STATUS
    */

    if (ready) {

        status.textContent =
            "READY";

        status.style.background =
            "#ecfdf5";

        status.style.color =
            "#17845b";

        note.textContent =
            "Scene requirements satisfied. Ready for spatial analysis.";

    } else {

        status.textContent =
            "INCOMPLETE";

        status.style.background =
            "#fff7ed";

        status.style.color =
            "#c2410c";


        if (
            req.ball &&
            !ball
        ) {

            note.textContent =
                "Place the ball or add an AWAY attacker.";

        }
        else if (
            req.home &&
            home < req.home
        ) {

            const missing =
                req.home - home;

            note.textContent =
                `${missing} more HOME player${missing > 1 ? "s" : ""} required.`;

        }
        else if (
            req.away &&
            away < req.away
        ) {

            const missing =
                req.away - away;

            note.textContent =
                `${missing} more AWAY player${missing > 1 ? "s" : ""} required.`;

        }
        else if (
            req.total &&
            home + away < req.total
        ) {

            const missing =
                req.total -
                (home + away);

            note.textContent =
                `${missing} more player${missing > 1 ? "s" : ""} required across both teams.`;

        }

    }

}


    /* =====================================================
       PLACEMENT MESSAGE
    ===================================================== */

    function pgShowPlacementMessage(
        message
    ) {

        let element =
            document.getElementById(
                "pgPlacementMessage"
            );


        if (
            !element
        ) {

            element =
                document.createElement(
                    "div"
                );


            element.id =
                "pgPlacementMessage";


            element.style.position =
                "fixed";


            element.style.left =
                "50%";


            element.style.bottom =
                "30px";


            element.style.transform =
                "translateX(-50%)";


            element.style.zIndex =
                "99999";


            element.style.padding =
                "12px 20px";


            element.style.borderRadius =
                "12px";


            element.style.background =
                "rgba(5,15,30,.95)";


            element.style.border =
                "1px solid rgba(34,211,238,.4)";


            element.style.color =
                "#e2e8f0";


            element.style.fontSize =
                "13px";


            element.style.fontWeight =
                "600";


            element.style.boxShadow =
                "0 15px 40px rgba(0,0,0,.4)";


            document.body.appendChild(
                element
            );

        }


        element.textContent =
            message;


        element.style.opacity =
            "1";


        clearTimeout(
            element._timer
        );


        element._timer =
            setTimeout(
                function () {

                    element.style.opacity =
                        "0";

                },
                2500
            );

    }


    /* =====================================================
       DATA HELPERS
    ===================================================== */

    function pgHomePlayers() {

        return window.pgPlayers.filter(
            function (player) {

                return (
                    player.team ===
                    "HOME"
                );

            }
        );

    }


    function pgAwayPlayers() {

        return window.pgPlayers.filter(
            function (player) {

                return (
                    player.team ===
                    "AWAY"
                );

            }
        );

    }


    function pgDistance(
        a,
        b
    ) {

        const dx =
            a.x - b.x;


        const dy =
            a.y - b.y;


        return Math.sqrt(
            dx * dx +
            dy * dy
        );

    }


    function pgAveragePoint(
        players
    ) {

        const x =
            players.reduce(
                function (
                    sum,
                    player
                ) {

                    return (
                        sum +
                        player.x
                    );

                },
                0
            ) /
            players.length;


        const y =
            players.reduce(
                function (
                    sum,
                    player
                ) {

                    return (
                        sum +
                        player.y
                    );

                },
                0
            ) /
            players.length;


        return {

            x:
                x,

            y:
                y

        };

    }


    function pgAverageNearestDistance(
        source,
        target
    ) {

        if (
            !source.length ||
            !target.length
        ) {

            return 0;

        }


        let total =
            0;


        source.forEach(
            function (player) {

                let shortest =
                    Infinity;


                target.forEach(
                    function (other) {

                        const d =
                            pgDistance(
                                player,
                                other
                            );


                        if (
                            d <
                            shortest
                        ) {

                            shortest =
                                d;

                        }

                    }
                );


                total +=
                    shortest;

            }
        );


        return (
            total /
            source.length
        );

    }


    function pgAverageDistanceToGroup(
        player,
        group
    ) {

        if (
            !group.length
        ) {

            return 0;

        }


        return (

            group.reduce(
                function (
                    sum,
                    other
                ) {

                    return (
                        sum +
                        pgDistance(
                            player,
                            other
                        )
                    );

                },
                0
            ) /
            group.length

        );

    }


    /* =====================================================
       BOUNDS
    ===================================================== */

    function pgBounds(
        players
    ) {

        const xs =
            players.map(
                function (p) {

                    return p.x;

                }
            );


        const ys =
            players.map(
                function (p) {

                    return p.y;

                }
            );


        return {

            minX:
                Math.min(
                    ...xs
                ),

            maxX:
                Math.max(
                    ...xs
                ),

            minY:
                Math.min(
                    ...ys
                ),

            maxY:
                Math.max(
                    ...ys
                )

        };

    }


    /* =====================================================
       CONVEX HULL
    ===================================================== */

    function pgConvexHull(
        points
    ) {

        if (
            points.length <=
            2
        ) {

            return points;

        }


        const sorted =
            [...points].sort(
                function (
                    a,
                    b
                ) {

                    if (
                        a.x ===
                        b.x
                    ) {

                        return (
                            a.y -
                            b.y
                        );

                    }


                    return (
                        a.x -
                        b.x
                    );

                }
            );


        function cross(
            o,
            a,
            b
        ) {

            return (

                (
                    a.x -
                    o.x
                ) *

                (
                    b.y -
                    o.y
                )

                -

                (
                    a.y -
                    o.y
                ) *

                (
                    b.x -
                    o.x
                )

            );

        }


        const lower =
            [];


        sorted.forEach(
            function (point) {

                while (

                    lower.length >=
                    2 &&

                    cross(

                        lower[
                            lower.length -
                            2
                        ],

                        lower[
                            lower.length -
                            1
                        ],

                        point

                    ) <= 0

                ) {

                    lower.pop();

                }


                lower.push(
                    point
                );

            }
        );


        const upper =
            [];


        for (
            let i =
                sorted.length -
                1;

            i >= 0;

            i--
        ) {

            const point =
                sorted[i];


            while (

                upper.length >=
                2 &&

                cross(

                    upper[
                        upper.length -
                        2
                    ],

                    upper[
                        upper.length -
                        1
                    ],

                    point

                ) <= 0

            ) {

                upper.pop();

            }


            upper.push(
                point
            );

        }


        upper.pop();

        lower.pop();


        return lower.concat(
            upper
        );

    }


    /* =====================================================
       POLYGON AREA
    ===================================================== */

    function pgPolygonArea(
        points
    ) {

        if (
            points.length <
            3
        ) {

            return 0;

        }


        let area =
            0;


        for (
            let i = 0;
            i < points.length;
            i++
        ) {

            const j =
                (
                    i + 1
                ) %
                points.length;


            area +=
                points[i].x *
                points[j].y;


            area -=
                points[j].x *
                points[i].y;

        }


        return Math.abs(
            area / 2
        );

    }


    /* =====================================================
       POINT TO SEGMENT
    ===================================================== */

    function pgPointToSegmentDistance(
        point,
        start,
        end
    ) {

        const dx =
            end.x -
            start.x;


        const dy =
            end.y -
            start.y;


        if (
            dx === 0 &&
            dy === 0
        ) {

            return pgDistance(
                point,
                start
            );

        }


        let t =

            (

                (
                    point.x -
                    start.x
                ) *
                dx

                +

                (
                    point.y -
                    start.y
                ) *
                dy

            )

            /

            (
                dx * dx +
                dy * dy
            );


        t =
            Math.max(
                0,
                Math.min(
                    1,
                    t
                )
            );


        const projection = {

            x:
                start.x +
                t * dx,

            y:
                start.y +
                t * dy

        };


        return pgDistance(
            point,
            projection
        );

    }


    /* =====================================================
       PRESSURE LEVEL
    ===================================================== */

    function pgPressureLevel(
        distance
    ) {

        if (
            distance <=
            3
        ) {

            return "VERY HIGH";

        }


        if (
            distance <=
            6
        ) {

            return "HIGH";

        }


        if (
            distance <=
            10
        ) {

            return "MEDIUM";

        }


        return "LOW";

    }


    /* =====================================================
       INSUFFICIENT DATA
    ===================================================== */

function pgInsufficient(
    message
) {

    const requirements =
        document.getElementById(
            "pgAnalysisRequirements"
        );

    if (requirements) {

        requirements.innerHTML = `
            <span style="
                display:flex;
                align-items:center;
                gap:8px;
                color:#c2410c;
            ">
                <i class="fa-solid fa-circle-exclamation"></i>
                ${pgEscape(message)}
            </span>
        `;

        requirements.style.background =
            "#fff7ed";

        requirements.style.borderColor =
            "#fed7aa";

    }

    return {

        error:
            true,

        primary:
            "—",

        secondary:
            "—",

        relationship:
            "Insufficient Data",

        primaryLabel:
            "Status",

        secondaryLabel:
            "Required",

        relationshipLabel:
            "Analysis",

        text:
            message

    };

}


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function pgEscape(
        value
    ) {

        return String(
            value
        )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

    }


    /* =====================================================
       START
    ===================================================== */

    pgInitializeBridge();


})();

/* =========================================================
   PITCHGRID — SPATIAL EVIDENCE FIX
   Connects the evidence panel directly to the real
   PitchGrid analysis state.
========================================================= */

(function () {

    "use strict";

    function el(id) {
        return document.getElementById(id);
    }


    /* ---------------------------------------------------------
       UPDATE SPATIAL EVIDENCE
    --------------------------------------------------------- */

    function updateSpatialEvidence() {

        const result =
            window.pgAnalysisResult;

        const analysisId =
            window.pgCurrentAnalysis;

        const analysis =
            window.pgAnalyses
                ? window.pgAnalyses[analysisId]
                : null;


        if (!analysis) {
            return;
        }


        /* -----------------------------------------------------
           ANALYSIS ERROR / INSUFFICIENT DATA
        ----------------------------------------------------- */

        if (
            result &&
            result.error
        ) {

            if (el("evidenceTitle")) {
                el("evidenceTitle").textContent =
                    analysis.title;
            }

            if (el("evidenceHeadline")) {
                el("evidenceHeadline").textContent =
                    "MORE SPATIAL DATA REQUIRED";
            }

            if (el("evidenceDescription")) {
                el("evidenceDescription").textContent =
                    result.error;
            }

            if (el("evidenceSignal")) {
                el("evidenceSignal").textContent =
                    "WAITING";
            }

            if (el("metricStructure")) {
                el("metricStructure").textContent =
                    "INCOMPLETE";
            }

            return;
        }


        /* -----------------------------------------------------
           NO RESULT
        ----------------------------------------------------- */

        if (!result) {
            return;
        }


        /* -----------------------------------------------------
           MAIN EVIDENCE HEADER
        ----------------------------------------------------- */

        if (el("evidenceTitle")) {

            el("evidenceTitle").textContent =
                analysis.title ||
                "Spatial Analysis";

        }


        if (el("evidenceHeadline")) {

            el("evidenceHeadline").textContent =
                "SPATIAL ANALYSIS COMPLETE";

        }


        if (el("evidenceDescription")) {

            el("evidenceDescription").textContent =
                result.text ||
                analysis.description ||
                "PitchGrid reconstructed the current spatial situation.";

        }


        if (el("evidenceSignal")) {

            el("evidenceSignal").textContent =
                "INTERPRETED";

        }


        if (
            el("evidenceClock") &&
            el("sceneClock")
        ) {

            el("evidenceClock").textContent =
                el("sceneClock").textContent;

        }


        /* -----------------------------------------------------
           METRICS
        ----------------------------------------------------- */

        if (el("metricExposure")) {

            el("metricExposure").textContent =
                result.primary ||
                "—";

        }


        if (el("metricArea")) {

            el("metricArea").textContent =
                result.secondary ||
                "—";

        }


        if (el("metricNearest")) {

            el("metricNearest").textContent =
                result.relationship ||
                "—";

        }


        if (el("metricStructure")) {

            el("metricStructure").textContent =
                "ANALYZED";

        }


        /* -----------------------------------------------------
           TACTICAL STORY
        ----------------------------------------------------- */

        if (el("storyWhat")) {

            el("storyWhat").textContent =
                result.text ||
                "The spatial relationship has been reconstructed from the current snapshot.";

        }


        if (el("storyWhy")) {

            el("storyWhy").textContent =
                buildWhyStatement(
                    analysis,
                    result
                );

        }


        if (el("storyTactical")) {

            el("storyTactical").textContent =
                buildTacticalStatement(
                    analysis,
                    result
                );

        }


        /* -----------------------------------------------------
           SCROLL / ACTIVE STATE
        ----------------------------------------------------- */

        const evidence =
            el("spatialEvidence");

        if (evidence) {

            evidence.classList.add(
                "interpreted"
            );

        }

    }


    /* ---------------------------------------------------------
       WHY DID IT MATTER?
    --------------------------------------------------------- */

    function buildWhyStatement(
        analysis,
        result
    ) {

        const id =
            window.pgCurrentAnalysis;


        if (
            id === "defensive_gaps"
        ) {

            return (
                "The measured separation shows where the defensive structure lost spatial connection between players."
            );

        }


        if (
            id === "defensive_coverage"
        ) {

            return (
                "The coverage measurement shows how much of the defensive space is protected versus exposed."
            );

        }


        if (
            id === "nearest_pressure"
        ) {

            return (
                "The defender-to-target distance indicates how much time and spatial access the attacker has in this moment."
            );

        }


        if (
            id === "defensive_structure"
        ) {

            return (
                "The defensive geometry shows how the block is organized through its spatial footprint."
            );

        }


        if (
            id === "space_between_lines"
        ) {

            return (
                "The distance between units reveals whether the central corridor is becoming available to the opponent."
            );

        }


        if (
            id === "attacking_space"
        ) {

            return (
                "The available space around the attacking players identifies where progression can become possible."
            );

        }


        if (
            id === "passing_lanes"
        ) {

            return (
                "The spatial relationships determine whether a passing route is open or blocked."
            );

        }


        if (
            id === "line_break"
        ) {

            return (
                "The geometry indicates whether an attacker can access or penetrate the defensive structure."
            );

        }


        return (
            "The geometry shows how player spacing shaped access, pressure and available space in the scene."
        );

    }


    /* ---------------------------------------------------------
       TACTICAL INTERPRETATION
    --------------------------------------------------------- */

    function buildTacticalStatement(
        analysis,
        result
    ) {

        const id =
            window.pgCurrentAnalysis;


        if (
            id === "defensive_gaps"
        ) {

            return (
                "The key tactical question is whether this gap can be attacked before the defensive structure reconnects."
            );

        }


        if (
            id === "nearest_pressure"
        ) {

            return (
                "The important detail is the relationship between the ball, the nearest defender and the available attacking space."
            );

        }


        if (
            id === "defensive_coverage"
        ) {

            return (
                "The tactical consequence depends on whether the exposed geometry can be reached or exploited by the attacking side."
            );

        }


        if (
            id === "passing_lanes"
        ) {

            return (
                "The passing lane becomes tactically relevant when an attacker can receive beyond or between the defensive lines."
            );

        }


        if (
            id === "line_break"
        ) {

            return (
                "A successful line break changes the spatial relationship between the attacker and the defensive structure."
            );

        }


        return (
            "The important point is not a single player position, but how the surrounding structure created or removed space."
        );

    }


    /* =========================================================
       AUDIENCE OUTPUT
    ========================================================= */

    window.pgBuildAudience =
        function (mode) {

            updateSpatialEvidence();


            const output =
                el("audienceOutput");


            if (!output) {
                return;
            }


            const result =
                window.pgAnalysisResult;


            const analysis =
                window.pgAnalyses
                    ? window.pgAnalyses[
                        window.pgCurrentAnalysis
                    ]
                    : null;


            if (
                !result ||
                !analysis
            ) {

                output.innerHTML = `
                    <strong>NO SPATIAL SCENE</strong>
                    <p>
                        Run a spatial analysis first.
                    </p>
                `;

                output.classList.add("show");

                return;
            }


            const title =
                analysis.title;


            let heading =
                "ANALYST REPORT";


            let story =
                "";


            if (
                mode === "coach"
            ) {

                heading =
                    "COACH REPORT";

                story =
                    "The spatial evidence highlights a tactical relationship that should be reviewed: where the structure opened, where pressure was applied, and where the next action became available.";

            }


            else if (
                mode === "fan"
            ) {

                heading =
                    "FAN STORY";

                story =
                    "The simple football story is that player positioning changed the space around the ball and created a new tactical possibility.";

            }


            else {

                heading =
                    "PERFORMANCE ANALYST REPORT";

                story =
                    "The snapshot can be read through measurable spatial relationships: distances, gaps, defensive structure and access to space.";

            }


            output.innerHTML = `

                <div class="audience-result">

                    <span class="audience-result-kicker">
                        ${heading}
                    </span>

                    <h3>
                        ${title}
                    </h3>

                    <p>
                        ${story}
                    </p>

                    <p>
                        ${result.text || analysis.description}
                    </p>

                    <div class="audience-metrics">

                        <span>
                            ${result.primaryLabel || "PRIMARY"}
                            <b>${result.primary || "—"}</b>
                        </span>

                        <span>
                            ${result.secondaryLabel || "SECONDARY"}
                            <b>${result.secondary || "—"}</b>
                        </span>

                        <span>
                            ${result.relationshipLabel || "RELATIONSHIP"}
                            <b>${result.relationship || "—"}</b>
                        </span>

                    </div>

                </div>

            `;


            output.classList.add(
                "show"
            );


            output.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        };


    /* =========================================================
       PITCHGRID ARTICLE
    ========================================================= */

    window.pgOpenArticle =
        function () {

            updateSpatialEvidence();


            const output =
                el("audienceOutput");


            if (!output) {
                return;
            }


            const result =
                window.pgAnalysisResult;


            const analysis =
                window.pgAnalyses
                    ? window.pgAnalyses[
                        window.pgCurrentAnalysis
                    ]
                    : null;


            if (
                !result ||
                !analysis
            ) {

                output.innerHTML = `
                    <strong>NO SCENE TO PUBLISH</strong>
                    <p>
                        Run a spatial analysis before turning the snapshot into an article.
                    </p>
                `;

                output.classList.add("show");

                return;
            }


            output.innerHTML = `

                <div class="audience-result">

                    <span class="audience-result-kicker">
                        PITCHGRID STORY
                    </span>

                    <h3>
                        ${analysis.title}
                    </h3>

                    <p>
                        The moment begins with the spatial setup.
                        PitchGrid then reveals the geometry,
                        identifies the important relationship,
                        and translates it into a tactical explanation.
                    </p>

                    <div class="article-flow">

                        <span>01 · THE MOMENT</span>
                        <span>02 · SPATIAL EVIDENCE</span>
                        <span>03 · WHAT CHANGED</span>
                        <span>04 · WHY IT MATTERED</span>
                        <span>05 · TACTICAL TAKEAWAY</span>

                    </div>

                    <p>
                        ${result.text || analysis.description}
                    </p>

                </div>

            `;


            output.classList.add(
                "show"
            );


            output.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        };


    /* =========================================================
       HOOK INTO RUN SPATIAL ANALYSIS
    ========================================================= */

    const oldRun =
        window.pgRunAnalysis;


    if (
        typeof oldRun === "function"
    ) {

        window.pgRunAnalysis =
            function () {

                const response =
                    oldRun.apply(
                        this,
                        arguments
                    );


                /*
                   Wait because the analysis engine
                   updates pgAnalysisResult after
                   the calculation.
                */

                setTimeout(
                    function () {

                        updateSpatialEvidence();

                    },
                    100
                );


                setTimeout(
                    function () {

                        updateSpatialEvidence();

                    },
                    500
                );


                setTimeout(
                    function () {

                        updateSpatialEvidence();

                    },
                    1000
                );


                return response;

            };

    }


    /* =========================================================
       REPORT MODE VISUAL STATE
    ========================================================= */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".output-actions button"
                );


            if (!button) {
                return;
            }


            document
                .querySelectorAll(
                    ".output-actions button"
                )
                .forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


            button.classList.add(
                "active"
            );

        }
    );


})();

/* =========================================================
   PITCHGRID FINAL INTELLIGENCE PATCH
   SPACE + ATTACK + EVIDENCE + ARTICLE
========================================================= */

(function () {

    "use strict";

    /* =====================================================
       HELPERS
    ===================================================== */

    function pgx(id) {
        return document.getElementById(id);
    }

    function setText(id, value) {

        const el = pgx(id);

        if (el) {
            el.textContent = value ?? "—";
        }

    }

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

    function distance(a, b) {

        if (!a || !b) return Infinity;

        return Math.hypot(
            Number(a.x) - Number(b.x),
            Number(a.y) - Number(b.y)
        );

    }

    function getHomePlayers() {

        return (window.pgPlayers || [])
            .filter(p => p.team === "HOME");

    }

    function getAwayPlayers() {

        return (window.pgPlayers || [])
            .filter(p => p.team === "AWAY");

    }

    function getBall() {

        return window.pgBall || null;

    }

    function nearestPlayer(target, players) {

        if (!target || !players.length) {
            return null;
        }

        let best = null;

        players.forEach(player => {

            const d = distance(target, player);

            if (!best || d < best.distance) {

                best = {
                    player,
                    distance: d
                };

            }

        });

        return best;

    }

    function getBounds(players) {

        if (!players.length) {
            return null;
        }

        return {

            minX: Math.min(...players.map(p => Number(p.x))),
            maxX: Math.max(...players.map(p => Number(p.x))),

            minY: Math.min(...players.map(p => Number(p.y))),
            maxY: Math.max(...players.map(p => Number(p.y)))

        };

    }

    function convexHull(points) {

        if (points.length <= 2) {
            return points.slice();
        }

        const sorted = [...points]
            .sort((a, b) =>
                a.x === b.x
                    ? a.y - b.y
                    : a.x - b.x
            );

        function cross(o, a, b) {

            return (
                (a.x - o.x) *
                (b.y - o.y)
            ) - (
                (a.y - o.y) *
                (b.x - o.x)
            );

        }

        const lower = [];

        sorted.forEach(point => {

            while (
                lower.length >= 2 &&
                cross(
                    lower[lower.length - 2],
                    lower[lower.length - 1],
                    point
                ) <= 0
            ) {

                lower.pop();

            }

            lower.push(point);

        });

        const upper = [];

        for (
            let i = sorted.length - 1;
            i >= 0;
            i--
        ) {

            const point = sorted[i];

            while (
                upper.length >= 2 &&
                cross(
                    upper[upper.length - 2],
                    upper[upper.length - 1],
                    point
                ) <= 0
            ) {

                upper.pop();

            }

            upper.push(point);

        }

        lower.pop();
        upper.pop();

        return lower.concat(upper);

    }

    function polygonArea(points) {

        if (points.length < 3) {
            return 0;
        }

        let area = 0;

        for (
            let i = 0;
            i < points.length;
            i++
        ) {

            const j =
                (i + 1) %
                points.length;

            area +=
                points[i].x *
                points[j].y;

            area -=
                points[j].x *
                points[i].y;

        }

        return Math.abs(area) / 2;

    }

    function lineSegmentDistance(point, a, b) {

        const dx = b.x - a.x;
        const dy = b.y - a.y;

        const lengthSquared =
            dx * dx +
            dy * dy;

        if (!lengthSquared) {
            return distance(point, a);
        }

        let t =
            (
                (point.x - a.x) * dx +
                (point.y - a.y) * dy
            ) /
            lengthSquared;

        t =
            Math.max(
                0,
                Math.min(1, t)
            );

        const projection = {

            x: a.x + t * dx,
            y: a.y + t * dy

        };

        return distance(
            point,
            projection
        );

    }


    /* =====================================================
       ANALYSIS DEFINITIONS
    ===================================================== */

    window.pgAnalyses =
        Object.assign(
            window.pgAnalyses || {},
            {

                spatial_control: {

                    title:
                        "Spatial Control",

                    description:
                        "Measures how the pitch is divided between HOME control, AWAY control and contested space.",

                    requirements:
                        "HOME + AWAY players"

                },

                occupied_exposed_space: {

                    title:
                        "Occupied vs Exposed Space",

                    description:
                        "Separates the defensive footprint from the remaining space that may become available to the attacking team.",

                    requirements:
                        "HOME defenders + AWAY attackers"

                },

                attacking_access: {

                    title:
                        "Attacking Access",

                    description:
                        "Measures the attacking corridor toward goal and identifies defensive obstruction along that route.",

                    requirements:
                        "AWAY attackers + HOME defenders"

                },

                final_third_threat: {

                    title:
                        "Final Third Threat",

                    description:
                        "Identifies the most dangerous attacking pocket using goal proximity, defensive pressure and local density.",

                    requirements:
                        "AWAY attackers + HOME defenders"

                },

                pressure_field: {

                    title:
                        "Pressure Field",

                    description:
                        "Maps the defensive pressure around the ball or attacking player and identifies the available escape relationship.",

                    requirements:
                        "Ball + HOME defenders"

                }

            }
        );


    /* =====================================================
       RESULT FACTORY
    ===================================================== */

    function makeResult(data) {

        return Object.assign(

            {

                type:
                    "spatial",

                timestamp:
                    new Date().toISOString()

            },

            data

        );

    }

    function errorResult(message) {

        return {

            error: true,

            text: message,

            primary: "—",

            secondary: "—",

            relationship: "—"

        };

    }


    /* =====================================================
       SPACE
       SPACE BETWEEN LINES
    ===================================================== */

    function analyzeSpaceBetweenLines() {

        const home =
            getHomePlayers();

        const away =
            getAwayPlayers();

        if (
            home.length < 3 ||
            away.length < 2
        ) {

            return errorResult(
                "Add at least 3 HOME defenders and 2 AWAY attackers."
            );

        }

        const homeSorted =
            [...home].sort(
                (a, b) =>
                    Number(a.x) -
                    Number(b.x)
            );

        const awaySorted =
            [...away].sort(
                (a, b) =>
                    Number(a.x) -
                    Number(b.x)
            );

        const defensiveLine =
            homeSorted[
                homeSorted.length - 1
            ];

        const attackingLine =
            awaySorted[0];

        const lineGap =
            Math.abs(
                Number(attackingLine.x) -
                Number(defensiveLine.x)
            );

        const nearest =
            nearestPlayer(
                attackingLine,
                home
            );

        return makeResult({

            primary:
                lineGap.toFixed(1) +
                " m",

            secondary:
                nearest
                    ? nearest.distance.toFixed(1) + " m"
                    : "—",

            relationship:
                lineGap >= 15
                    ? "HIGH RECEIVING SPACE"
                    : lineGap >= 10
                        ? "AVAILABLE SPACE"
                        : "TIGHT SPACE",

            primaryLabel:
                "Line Gap",

            secondaryLabel:
                "Nearest Defender",

            relationshipLabel:
                "Receiving Space",

            geometry: {

                kind:
                    "between-lines",

                from:
                    defensiveLine,

                to:
                    attackingLine

            },

            text:
                `The spatial distance between the advanced HOME defensive line and the AWAY attacking line is ${lineGap.toFixed(1)} m. This creates ${lineGap >= 15 ? "a significant" : "a limited"} receiving corridor between the lines.`

        });

    }


    /* =====================================================
       SPACE
       SPATIAL CONTROL
    ===================================================== */

    function analyzeSpatialControl() {

        const home =
            getHomePlayers();

        const away =
            getAwayPlayers();

        if (
            !home.length ||
            !away.length
        ) {

            return errorResult(
                "Add players from both teams."
            );

        }

        const step = 3;

        let homeCells = 0;
        let awayCells = 0;
        let contestedCells = 0;

        for (
            let x = 0;
            x <= 105;
            x += step
        ) {

            for (
                let y = 0;
                y <= 68;
                y += step
            ) {

                const point = {
                    x,
                    y
                };

                const nearestHome =
                    nearestPlayer(
                        point,
                        home
                    );

                const nearestAway =
                    nearestPlayer(
                        point,
                        away
                    );

                if (
                    !nearestHome ||
                    !nearestAway
                ) {

                    continue;

                }

                const difference =
                    Math.abs(
                        nearestHome.distance -
                        nearestAway.distance
                    );

                if (
                    difference < 2
                ) {

                    contestedCells++;

                }
                else if (
                    nearestHome.distance <
                    nearestAway.distance
                ) {

                    homeCells++;

                }
                else {

                    awayCells++;

                }

            }

        }

        const total =
            homeCells +
            awayCells +
            contestedCells;

        const pitchArea =
            105 * 68;

        const homeArea =
            total
                ? homeCells / total * pitchArea
                : 0;

        const awayArea =
            total
                ? awayCells / total * pitchArea
                : 0;

        const contestedArea =
            total
                ? contestedCells / total * pitchArea
                : 0;

        return makeResult({

            primary:
                homeArea.toFixed(0) +
                " m²",

            secondary:
                awayArea.toFixed(0) +
                " m²",

            relationship:
                contestedArea.toFixed(0) +
                " m²",

            primaryLabel:
                "HOME Control",

            secondaryLabel:
                "AWAY Control",

            relationshipLabel:
                "Contested",

            text:
                `The proximity model estimates ${homeArea.toFixed(0)} m² under HOME influence, ${awayArea.toFixed(0)} m² under AWAY influence and ${contestedArea.toFixed(0)} m² as contested space.`

        });

    }


    /* =====================================================
       SPACE
       OCCUPIED VS EXPOSED
    ===================================================== */

    function analyzeOccupiedExposed() {

        const home =
            getHomePlayers();

        const away =
            getAwayPlayers();

        if (
            home.length < 3 ||
            away.length < 1
        ) {

            return errorResult(
                "Add at least 3 HOME defenders and 1 AWAY attacker."
            );

        }

        const points =
            home.map(
                p => ({
                    x: Number(p.x),
                    y: Number(p.y)
                })
            );

        const hull =
            convexHull(points);

        const occupied =
            polygonArea(hull);

        const exposed =
            Math.max(
                0,
                7140 - occupied
            );

        const attacker =
            away.reduce(
                (best, player) => {

                    const centerX =
                        points.reduce(
                            (sum, p) =>
                                sum + p.x,
                            0
                        ) /
                        points.length;

                    const centerY =
                        points.reduce(
                            (sum, p) =>
                                sum + p.y,
                            0
                        ) /
                        points.length;

                    const d =
                        distance(
                            player,
                            {
                                x: centerX,
                                y: centerY
                            }
                        );

                    if (
                        !best ||
                        d < best.d
                    ) {

                        return {
                            player,
                            d
                        };

                    }

                    return best;

                },
                null
            );

        const nearest =
            nearestPlayer(
                attacker.player,
                home
            );

        return makeResult({

            primary:
                occupied.toFixed(0) +
                " m²",

            secondary:
                exposed.toFixed(0) +
                " m²",

            relationship:
                nearest
                    ? nearest.distance.toFixed(1) +
                      " m"
                    : "—",

            primaryLabel:
                "Occupied",

            secondaryLabel:
                "Exposed",

            relationshipLabel:
                "Attacker Separation",

            geometry: {

                kind:
                    "occupied-exposed",

                hull,

                attacker:
                    attacker.player

            },

            text:
                `The HOME defensive footprint occupies approximately ${occupied.toFixed(0)} m². The remaining ${exposed.toFixed(0)} m² represents non-occupied pitch space, while the selected attacker is ${nearest ? nearest.distance.toFixed(1) : "—"} m from the nearest defender.`

        });

    }


    /* =====================================================
       ATTACK
       ATTACKING ACCESS
    ===================================================== */

    function analyzeAttackingAccess() {

        const home =
            getHomePlayers();

        const away =
            getAwayPlayers();

        if (
            home.length < 2 ||
            away.length < 1
        ) {

            return errorResult(
                "Add at least 2 HOME defenders and 1 AWAY attacker."
            );

        }

        const goal = {

            x: 105,
            y: 34

        };

        const attacker =
            away.reduce(
                (best, player) => {

                    const d =
                        distance(
                            player,
                            goal
                        );

                    if (
                        !best ||
                        d < best.d
                    ) {

                        return {
                            player,
                            d
                        };

                    }

                    return best;

                },
                null
            );

        const nearest =
            nearestPlayer(
                attacker.player,
                home
            );

        const blockers =
            home.filter(
                defender =>
                    lineSegmentDistance(
                        defender,
                        attacker.player,
                        goal
                    ) < 5
            );

        return makeResult({

            primary:
                attacker.d.toFixed(1) +
                " m",

            secondary:
                nearest
                    ? nearest.distance.toFixed(1) +
                      " m"
                    : "—",

            relationship:
                blockers.length === 0
                    ? "OPEN"
                    : blockers.length +
                      " BLOCKER" +
                      (
                          blockers.length > 1
                              ? "S"
                              : ""
                      ),

            primaryLabel:
                "Goal Distance",

            secondaryLabel:
                "Defender Separation",

            relationshipLabel:
                "Access Corridor",

            geometry: {

                kind:
                    "attacking-access",

                attacker:
                    attacker.player,

                goal,

                nearest:
                    nearest
                        ? nearest.player
                        : null,

                blockers

            },

            text:
                `The closest attacking player to goal is ${attacker.d.toFixed(1)} m away. The nearest defender is ${nearest ? nearest.distance.toFixed(1) : "—"} m away and ${blockers.length} defender(s) intersect the direct attacking corridor.`

        });

    }


    /* =====================================================
       ATTACK
       FINAL THIRD THREAT
    ===================================================== */

    function analyzeFinalThirdThreat() {

        const home =
            getHomePlayers();

        const away =
            getAwayPlayers();

        if (
            home.length < 2 ||
            away.length < 1
        ) {

            return errorResult(
                "Add at least 2 HOME defenders and 1 AWAY attacker."
            );

        }

        const finalThird =
            away.filter(
                player =>
                    Number(player.x) >= 70
            );

        const attackers =
            finalThird.length
                ? finalThird
                : away;

        const goal = {

            x: 105,
            y: 34

        };

        let best = null;

        attackers.forEach(
            attacker => {

                const goalDistance =
                    distance(
                        attacker,
                        goal
                    );

                const pressure =
                    nearestPlayer(
                        attacker,
                        home
                    );

                const localDensity =
                    home.filter(
                        defender =>
                            distance(
                                attacker,
                                defender
                            ) <= 12
                    ).length;

                const score =
                    (
                        1 /
                        (goalDistance + 1)
                    ) * 100
                    +
                    pressure.distance
                    -
                    localDensity * 2;

                if (
                    !best ||
                    score > best.score
                ) {

                    best = {

                        attacker,
                        goalDistance,
                        pressure,
                        localDensity,
                        score

                    };

                }

            }
        );

        return makeResult({

            primary:
                best.goalDistance.toFixed(1) +
                " m",

            secondary:
                best.pressure.distance.toFixed(1) +
                " m",

            relationship:
                best.localDensity +
                " DEFENDER" +
                (
                    best.localDensity !== 1
                        ? "S"
                        : ""
                ),

            primaryLabel:
                "Goal Distance",

            secondaryLabel:
                "Nearest Pressure",

            relationshipLabel:
                "Local Density",

            geometry: {

                kind:
                    "final-third-threat",

                attacker:
                    best.attacker,

                goal,

                nearest:
                    best.pressure.player

            },

            text:
                `The most threatening attacking pocket is ${best.goalDistance.toFixed(1)} m from goal, with the nearest defender ${best.pressure.distance.toFixed(1)} m away and ${best.localDensity} defender(s) within a 12 m local pressure radius.`

        });

    }


    /* =====================================================
       ATTACK
       PRESSURE FIELD
    ===================================================== */

    function analyzePressureField() {

        const home =
            getHomePlayers();

        if (
            home.length < 2
        ) {

            return errorResult(
                "Add at least 2 HOME defenders."
            );

        }

        const target =
            getBall() ||
            getAwayPlayers()[0];

        if (!target) {

            return errorResult(
                "Place the ball or add an AWAY attacker."
            );

        }

        const nearest =
            nearestPlayer(
                target,
                home
            );

        const defendersSorted =
            home
                .map(
                    defender => ({
                        defender,
                        d:
                            distance(
                                target,
                                defender
                            )
                    })
                )
                .sort(
                    (a, b) =>
                        a.d - b.d
                );

        const second =
            defendersSorted[1] || null;

        const pressureRadius =
            nearest
                ? nearest.distance
                : 0;

        return makeResult({

            primary:
                nearest
                    ? nearest.distance.toFixed(1) +
                      " m"
                    : "—",

            secondary:
                second
                    ? second.d.toFixed(1) +
                      " m"
                    : "—",

            relationship:
                pressureRadius <= 5
                    ? "HIGH PRESSURE"
                    : pressureRadius <= 8
                        ? "MEDIUM PRESSURE"
                        : "LOW PRESSURE",

            primaryLabel:
                "Nearest Pressure",

            secondaryLabel:
                "Second Defender",

            relationshipLabel:
                "Pressure State",

            geometry: {

                kind:
                    "pressure-field",

                target,

                nearest:
                    nearest
                        ? nearest.player
                        : null,

                second:
                    second
                        ? second.defender
                        : null

            },

            text:
                `The target is ${nearest ? nearest.distance.toFixed(1) : "—"} m from the nearest HOME defender and ${second ? second.d.toFixed(1) : "—"} m from the second defender. The current spatial pressure state is classified as ${pressureRadius <= 5 ? "high" : pressureRadius <= 8 ? "medium" : "low"}.`

        });

    }


    /* =====================================================
       ATTACH ANALYSIS FUNCTIONS
    ===================================================== */

    window.pgCustomAnalyses = {

        space_between_lines:
            analyzeSpaceBetweenLines,

        spatial_control:
            analyzeSpatialControl,

        occupied_exposed_space:
            analyzeOccupiedExposed,

        attacking_access:
            analyzeAttackingAccess,

        final_third_threat:
            analyzeFinalThirdThreat,

        pressure_field:
            analyzePressureField

    };


    /* =====================================================
       ADD MISSING BUTTONS
    ===================================================== */

    function addMissingButtons() {

        const groups =
            document.querySelectorAll(
                ".question-group"
            );

        groups.forEach(
            group => {

                const header =
                    (
                        group
                            .querySelector(
                                ".question-group-header"
                            )
                            ?.innerText ||
                        ""
                    ).toUpperCase();

                const content =
                    group.querySelector(
                        ".question-group-content"
                    );

                if (!content) {
                    return;
                }

                function addButton(
                    id,
                    title,
                    description
                ) {

                    const exists =
                        [...content.querySelectorAll(
                            ".question-item"
                        )]
                        .some(
                            button =>
                                (
                                    button.getAttribute(
                                        "onclick"
                                    ) || ""
                                )
                                .includes(
                                    `'${id}'`
                                )
                        );

                    if (exists) {
                        return;
                    }

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "question-item";

                    button.setAttribute(
                        "onclick",
                        `pgSelectAnalysis('${id}')`
                    );

                    button.innerHTML = `

                        <span class="question-item-title">
                            ${title}
                        </span>

                        <span class="question-item-description">
                            ${description}
                        </span>

                    `;

                    content.appendChild(
                        button
                    );

                }

                if (
                    header.includes(
                        "SPACE"
                    )
                ) {

                    addButton(
                        "occupied_exposed_space",
                        "Occupied vs Exposed Space",
                        "Occupied · Exposed · Access"
                    );

                }

                if (
                    header.includes(
                        "ATTACK"
                    )
                ) {

                    addButton(
                        "attacking_access",
                        "Attacking Access",
                        "Corridor · Access · Goal"
                    );

                    addButton(
                        "final_third_threat",
                        "Final Third Threat",
                        "Density · Access · Threat"
                    );

                    addButton(
                        "pressure_field",
                        "Pressure Field",
                        "Pressure · Escape · Radius"
                    );

                }

            }
        );

    }


    /* =====================================================
       DRAW CUSTOM RESULT
       NOTE:
       DOES NOT CREATE A NEW MAP
       DOES NOT TOUCH PITCH
    ===================================================== */

    function drawCustomResult(
        analysisId,
        result
    ) {

        if (
            typeof window.map ===
            "undefined" ||
            !window.map
        ) {

            return;

        }

        if (
            !window.L
        ) {

            return;

        }

        if (
            !window.pgCustomLayer
        ) {

            window.pgCustomLayer =
                L.layerGroup().addTo(
                    window.map
                );

        }

        window.pgCustomLayer.clearLayers();

        const g =
            result.geometry;

        if (!g) {
            return;
        }


        /* ---------------------------------------------
           BETWEEN LINES
        --------------------------------------------- */

        if (
            g.kind ===
            "between-lines"
        ) {

            L.polyline(
                [
                    [
                        g.from.y,
                        g.from.x
                    ],
                    [
                        g.to.y,
                        g.to.x
                    ]
                ],
                {
                    color:
                        "#0284c7",

                    weight:
                        3,

                    dashArray:
                        "7,6"
                }
            ).addTo(
                window.pgCustomLayer
            );

        }


        /* ---------------------------------------------
           OCCUPIED / EXPOSED
        --------------------------------------------- */

        if (
            g.kind ===
            "occupied-exposed"
        ) {

            if (
                g.hull &&
                g.hull.length >= 3
            ) {

                L.polygon(
                    g.hull.map(
                        p => [
                            p.y,
                            p.x
                        ]
                    ),
                    {
                        color:
                            "#17845b",

                        weight:
                            2,

                        fillOpacity:
                            0.08
                    }
                ).addTo(
                    window.pgCustomLayer
                );

            }

            L.circleMarker(
                [
                    g.attacker.y,
                    g.attacker.x
                ],
                {
                    radius:
                        7,

                    color:
                        "#0284c7",

                    fillOpacity:
                        0.9
                }
            ).addTo(
                window.pgCustomLayer
            );

        }


        /* ---------------------------------------------
           ATTACKING ACCESS
        --------------------------------------------- */

        if (
            g.kind ===
            "attacking-access"
        ) {

            L.polyline(
                [
                    [
                        g.attacker.y,
                        g.attacker.x
                    ],
                    [
                        g.goal.y,
                        g.goal.x
                    ]
                ],
                {
                    color:
                        "#0284c7",

                    weight:
                        3,

                    dashArray:
                        "8,6"
                }
            ).addTo(
                window.pgCustomLayer
            );

            g.blockers.forEach(
                blocker => {

                    L.circleMarker(
                        [
                            blocker.y,
                            blocker.x
                        ],
                        {
                            radius:
                                6,

                            color:
                                "#ef4444",

                            fillOpacity:
                                0.8
                        }
                    ).addTo(
                        window.pgCustomLayer
                    );

                }
            );

        }


        /* ---------------------------------------------
           FINAL THIRD THREAT
        --------------------------------------------- */

        if (
            g.kind ===
            "final-third-threat"
        ) {

            L.circle(
                [
                    g.attacker.y,
                    g.attacker.x
                ],
                {
                    radius:
                        8,

                    color:
                        "#0284c7",

                    fillOpacity:
                        0.12,

                    weight:
                        2
                }
            ).addTo(
                window.pgCustomLayer
            );

            L.polyline(
                [
                    [
                        g.attacker.y,
                        g.attacker.x
                    ],
                    [
                        g.goal.y,
                        g.goal.x
                    ]
                ],
                {
                    color:
                        "#0284c7",

                    weight:
                        2,

                    dashArray:
                        "5,5"
                }
            ).addTo(
                window.pgCustomLayer
            );

        }


        /* ---------------------------------------------
           PRESSURE FIELD
        --------------------------------------------- */

        if (
            g.kind ===
            "pressure-field"
        ) {

            L.circle(
                [
                    g.target.y,
                    g.target.x
                ],
                {
                    radius:
                        8,

                    color:
                        "#ef4444",

                    fillOpacity:
                        0.06,

                    weight:
                        2
                }
            ).addTo(
                window.pgCustomLayer
            );

            if (
                g.nearest
            ) {

                L.polyline(
                    [
                        [
                            g.target.y,
                            g.target.x
                        ],
                        [
                            g.nearest.y,
                            g.nearest.x
                        ]
                    ],
                    {
                        color:
                            "#ef4444",

                        weight:
                            3
                    }
                ).addTo(
                    window.pgCustomLayer
                );

            }

            if (
                g.second
            ) {

                L.polyline(
                    [
                        [
                            g.target.y,
                            g.target.x
                        ],
                        [
                            g.second.y,
                            g.second.x
                        ]
                    ],
                    {
                        color:
                            "#f59e0b",

                        weight:
                            2,

                        dashArray:
                            "5,5"
                    }
                ).addTo(
                    window.pgCustomLayer
                );

            }

        }

    }


function updateGeometryTab(result) {

    const tab = pgx("tab-geometry");

    if (!tab) {
        return;
    }

    let detail = tab.querySelector(".pg-geometry-detail");

    if (!detail) {
        detail = document.createElement("div");
        detail.className = "pg-geometry-detail";
        tab.appendChild(detail);
    }

    const analysis = window.pgCurrentAnalysis;

    /* ==============================
       ANALYSIS LABELS
    ============================== */

    const labels = {

        defensive_structure: {
            primary: "Block Area",
            secondary: "Width",
            relationship: "Depth"
        },

        defensive_gaps: {
            primary: "Largest Gap",
            secondary: "Players",
            relationship: "Critical Spacing"
        },

        defensive_coverage: {
            primary: "Covered Space",
            secondary: "Exposed Space",
            relationship: "Coverage Ratio"
        },

        nearest_pressure: {
            primary: "Pressure Distance",
            secondary: "Nearest Defender",
            relationship: "Pressure Level"
        },

        space_between_lines: {
            primary: "Line Gap",
            secondary: "Nearest Defender",
            relationship: "Receiving Space"
        },

        spatial_control: {
            primary: "HOME Control",
            secondary: "AWAY Control",
            relationship: "Contested Space"
        },

        attacking_access: {
            primary: "Goal Distance",
            secondary: "Defender Separation",
            relationship: "Access Corridor"
        },

        line_break: {
            primary: "Break Distance",
            secondary: "Defender Separation",
            relationship: "Line Access"
        }

    };


    const current =
        labels[analysis] || {

            primary:
                result.primaryLabel ||
                "Primary",

            secondary:
                result.secondaryLabel ||
                "Secondary",

            relationship:
                result.relationshipLabel ||
                "Spatial Relationship"

        };

        /* ==============================
   DEFENSIVE STRUCTURE — VISUAL
============================== */

if (analysis === "defensive_structure") {

    const area =
        result.primary || "—";

    const width =
        result.secondary || "—";

    const depth =
        result.relationship || "—";


    detail.innerHTML = `

        <div class="pg-structure-card">

            <div class="pg-structure-header">

                <div>

                    <small>
                        DEFENSIVE SHAPE
                    </small>

                    <h3>
                        Structural Profile
                    </h3>

                </div>

                <div class="pg-structure-status">
                    ANALYZED
                </div>

            </div>


            <div class="pg-structure-area">

                <span>
                    BLOCK AREA
                </span>

                <strong>
                    ${escapeHTML(area)}
                </strong>

                <div class="pg-structure-bar">

                    <div class="pg-structure-fill"></div>

                </div>

            </div>


            <div class="pg-structure-dimensions">


                <div class="pg-structure-dimension">

                    <span>
                        WIDTH
                    </span>

                    <strong>
                        ${escapeHTML(width)}
                    </strong>

                </div>


                <div class="pg-structure-dimension">

                    <span>
                        DEPTH
                    </span>

                    <strong>
                        ${escapeHTML(depth)}
                    </strong>

                </div>


            </div>


            <div class="pg-structure-divider"></div>


            <div class="pg-structure-description">

                <span>
                    SPATIAL INTERPRETATION
                </span>

                <p>
                    ${escapeHTML(
                        result.text || ""
                    )}
                </p>

            </div>

        </div>

    `;

    return;
}


  /* ==============================
   DEFENSIVE GAPS — VISUAL
============================== */

if (analysis === "defensive_gaps") {

    const gap =
        result.primary || "—";

    const players =
        result.secondary || "—";

    const spacing =
        result.relationship || "—";


    detail.innerHTML = `

        <div class="pg-gap-card">

            <div class="pg-gap-header">

                <div>

                    <small>
                        CRITICAL SPACING
                    </small>

                    <h3>
                        Defensive Gap Detector
                    </h3>

                </div>

                <div class="pg-gap-status">
                    SPATIAL GAP
                </div>

            </div>


            <div class="pg-gap-visual">

                <div class="pg-gap-node">

                    <span class="pg-gap-player">
                        DEFENDER A
                    </span>

                    <div class="pg-gap-dot"></div>

                </div>


                <div class="pg-gap-distance">

                    <div class="pg-gap-line"></div>

                    <strong>
                        ${escapeHTML(gap)}
                    </strong>

                    <small>
                        GAP DISTANCE
                    </small>

                </div>


                <div class="pg-gap-node">

                    <span class="pg-gap-player">
                        DEFENDER B
                    </span>

                    <div class="pg-gap-dot"></div>

                </div>

            </div>


            <div class="pg-gap-metrics">


                <div class="pg-gap-metric">

                    <span>
                        LARGEST GAP
                    </span>

                    <strong>
                        ${escapeHTML(gap)}
                    </strong>

                </div>


                <div class="pg-gap-metric">

                    <span>
                        PLAYERS
                    </span>

                    <strong>
                        ${escapeHTML(players)}
                    </strong>

                </div>


                <div class="pg-gap-metric">

                    <span>
                        SPACING STATUS
                    </span>

                    <strong>
                        ${escapeHTML(spacing)}
                    </strong>

                </div>

            </div>


            <div class="pg-gap-divider"></div>


            <div class="pg-gap-description">

                <span>
                    SPATIAL INTERPRETATION
                </span>

                <p>
                    ${escapeHTML(
                        result.text || ""
                    )}
                </p>

            </div>

        </div>

    `;

    return;
}

    if (analysis === "defensive_coverage") {

        const covered =
            result.primary || "—";

        const exposed =
            result.secondary || "—";

        const ratio =
            result.relationship || "—";


        detail.innerHTML = `

            <div class="pg-coverage-card">

                <div class="pg-coverage-header">

                    <div>

                        <small>
                            SPATIAL COVERAGE
                        </small>

                        <h3>
                            Defensive Coverage
                        </h3>

                    </div>

                    <div class="pg-coverage-status">
                        ANALYZED
                    </div>

                </div>


                <div class="pg-coverage-metrics">


                    <div class="pg-coverage-metric">

                        <span>
                            COVERED SPACE
                        </span>

                        <strong>
                            ${escapeHTML(covered)}
                        </strong>

                        <div class="pg-coverage-bar">

                            <div
                                class="pg-coverage-fill covered"
                                style="width:${escapeHTML(ratio)}"
                            ></div>

                        </div>

                    </div>



                    <div class="pg-coverage-metric">

                        <span>
                            EXPOSED SPACE
                        </span>

                        <strong>
                            ${escapeHTML(exposed)}
                        </strong>

                        <div class="pg-coverage-bar">

                            <div
                                class="pg-coverage-fill exposed"
                                style="width:96.2%"
                            ></div>

                        </div>

                    </div>



                    <div class="pg-coverage-metric ratio">

                        <span>
                            COVERAGE RATIO
                        </span>

                        <strong>
                            ${escapeHTML(ratio)}
                        </strong>

                    </div>

                </div>


                <div class="pg-coverage-divider"></div>


                <div class="pg-coverage-description">

                    <span>
                        SPATIAL INTERPRETATION
                    </span>

                    <p>
                        ${escapeHTML(
                            result.text || ""
                        )}
                    </p>

                </div>

            </div>

        `;

        return;
    }


    /* ==============================
       DEFAULT — OTHER ANALYSES
    ============================== */

    detail.innerHTML = `

        <div class="evidence-detail-grid">

            <div>

                <small>
                    PRIMARY
                </small>

                <b>
                    ${escapeHTML(
                        current.primary
                    )}
                </b>

                <span>
                    ${escapeHTML(
                        result.primary ||
                        "—"
                    )}
                </span>

            </div>


            <div>

                <small>
                    SECONDARY
                </small>

                <b>
                    ${escapeHTML(
                        current.secondary
                    )}
                </b>

                <span>
                    ${escapeHTML(
                        result.secondary ||
                        "—"
                    )}
                </span>

            </div>


            <div>

                <small>
                    RELATIONSHIP
                </small>

                <b>
                    ${escapeHTML(
                        current.relationship
                    )}
                </b>

                <span>
                    ${escapeHTML(
                        result.relationship ||
                        "—"
                    )}
                </span>

            </div>

        </div>


        <p class="evidence-method">

            ${escapeHTML(
                result.text ||
                ""
            )}

        </p>

    `;
}


 function updateTacticalStory(
    result,
    analysis
) {

    const stories = {

        defensive_structure: {

            what:
                `The defensive block occupies ${result.primary || "—"} with a measured width of ${result.secondary || "—"} and depth of ${result.relationship || "—"}.`,

            why:
                "The geometry describes the actual spatial footprint created by the HOME player positions placed on the pitch.",

            tactical:
                "Changes in width and depth alter how the defensive block controls central and lateral space."
        },


        defensive_gaps: {

            what:
                `The largest defensive separation is ${result.primary || "—"} between ${result.secondary || "the selected defenders"}.`,

            why:
                "This identifies the most significant spacing between the HOME defenders selected by their actual pitch positions.",

            tactical:
                "A larger gap can create a spatial channel that an attacker may access."
        },


        defensive_coverage: {

            what:
                `The defensive structure covers an estimated ${result.primary || "—"}, leaving approximately ${result.secondary || "—"} exposed.`,

            why:
                `The current coverage ratio is ${result.relationship || "—"}.`,

            tactical:
                "The relationship between covered and exposed space indicates where the defensive structure provides spatial protection and where space remains available."
        },


        nearest_pressure: {

            what:
                `${result.secondary || "The nearest defender"} is the closest HOME defender at ${result.primary || "—"}.`,

            why:
                `The measured pressure level is ${result.relationship || "—"}.`,

            tactical:
                "The shorter the distance to the reference point, the more immediate the defender's spatial access."
        },


        space_between_lines: {

            what:
                `The measured space between the defensive and attacking structures is ${result.primary || "—"}.`,

            why:
                `The nearest defensive relationship is ${result.secondary || "—"}.`,

            tactical:
                "The size of the inter-line space determines how much room an attacking player has to receive between units."
        },


        spatial_control: {

            what:
                `Spatial control is distributed between the two teams across the measured area.`,

            why:
                `${result.primaryLabel || "HOME Control"}: ${result.primary || "—"} · ${result.secondaryLabel || "AWAY Control"}: ${result.secondary || "—"}.`,

            tactical:
                `The contested relationship is ${result.relationship || "—"}.`
        },


        attacking_access: {

            what:
                `The attacking access measurement is ${result.primary || "—"}.`,

            why:
                `Defender separation is ${result.secondary || "—"}.`,

            tactical:
                "The geometry indicates how much spatial access is available to the attacking player."
        },


        line_break: {

            what:
                `The measured line-breaking distance is ${result.primary || "—"}.`,

            why:
                `The defensive separation is ${result.secondary || "—"}.`,

            tactical:
                "The measured geometry indicates the available route for penetrating the defensive line."
        }

    };


    const story =
        stories[analysis] || {

            what:
                result.text ||
                "Spatial relationship measured from the current match snapshot.",

            why:
                `The primary spatial signal is ${result.primary || "—"}.`,

            tactical:
                `The measured relationship is ${result.relationship || "—"}.`

        };


    setText(
        "storyWhat",
        story.what
    );

    setText(
        "storyWhy",
        story.why
    );

    setText(
        "storyTactical",
        story.tactical
    );

}
function updateSceneSequence(
    result
) {

    const tab =
        pgx(
            "tab-sequence"
        );

    if (!tab) {
        return;
    }

    const track =
        tab.querySelector(
            ".sequence-track"
        );

    if (!track) {
        return;
    }


    const analysis =
        window.pgCurrentAnalysis;


    const sequences = {

        defensive_structure: {
            s2: "Defensive block organization",
            s3: "Shape · Width · Depth",
            s4: "Measured defensive footprint",
            s5: "How the block controls space"
        },

        defensive_gaps: {
            s2: "HOME defenders positioned",
            s3: "Largest measured gap",
            s4: "Critical spacing",
            s5: "Potential attacking channel"
        },

        defensive_coverage: {
            s2: "HOME defensive coverage",
            s3: "Covered versus exposed space",
            s4: "Coverage ratio",
            s5: "Where protection is weakest"
        },

        nearest_pressure: {
            s2: "Target and HOME defenders",
            s3: "Nearest defender",
            s4: "Pressure distance",
            s5: "How quickly pressure can arrive"
        },

        space_between_lines: {
            s2: "Defensive and attacking units",
            s3: "Line separation",
            s4: "Receiving space",
            s5: "Access between units"
        },

        spatial_control: {
            s2: "HOME and AWAY influence",
            s3: "Spatial control",
            s4: "Contested space",
            s5: "Access to territory"
        },

        attacking_access: {
            s2: "Attacker versus defenders",
            s3: "Access corridor",
            s4: "Defender separation",
            s5: "Attacking route"
        },

        line_break: {
            s2: "Attacker versus defensive line",
            s3: "Break distance",
            s4: "Line access",
            s5: "Potential penetration"
        }

    };


    const sequence =
        sequences[analysis] || {

            s2:
                "Spatial organization",

            s3:
                result.primaryLabel ||
                "Spatial signal",

            s4:
                result.relationship ||
                "Spatial relationship",

            s5:
                "Tactical consequence"

        };


    track.innerHTML = `

        <div class="active">

            <b>01</b>

            <span>
                SETUP
            </span>

            <small>
                Player + ball positions
            </small>

        </div>

        <i></i>


        <div class="active">

            <b>02</b>

            <span>
                STRUCTURE
            </span>

            <small>
                ${escapeHTML(
                    sequence.s2
                )}
            </small>

        </div>

        <i></i>


        <div class="active">

            <b>03</b>

            <span>
                MEASURE
            </span>

            <small>
                ${escapeHTML(
                    sequence.s3
                )}
            </small>

        </div>

        <i></i>


        <div class="active">

            <b>04</b>

            <span>
                SPATIAL SIGNAL
            </span>

            <small>
                ${escapeHTML(
                    sequence.s4
                )}
            </small>

        </div>

        <i></i>


        <div>

            <b>05</b>

            <span>
                CONSEQUENCE
            </span>

            <small>
                ${escapeHTML(
                    sequence.s5
                )}
            </small>

        </div>

    `;

}
    /* =====================================================
       SPATIAL ENGINE
    ===================================================== */

   function updateSpatialEngine(
    analysis
) {

    const tab =
        pgx(
            "tab-engine"
        );

    if (!tab) {
        return;
    }

    const grid =
        tab.querySelector(
            ".engine-grid"
        );

    if (!grid) {
        return;
    }


    const engines = {

        defensive_structure: {

            functions: [
                "pgConvexHull()",
                "pgPolygonArea()",
                "pgBounds()"
            ],

            input: [
                "HOME Player Points",
                "X / Y Coordinates"
            ],

            output: [
                "Block Area",
                "Width",
                "Depth"
            ]

        },


        defensive_gaps: {

            functions: [
                "pgDistance()",
                "Pairwise Defender Distance"
            ],

            input: [
                "HOME Defender Points",
                "X / Y Coordinates"
            ],

            output: [
                "Largest Gap",
                "Player Pair",
                "Critical Spacing"
            ]

        },


        defensive_coverage: {

            functions: [
                "Coverage Radius Model",
                "Pitch Area Calculation"
            ],

            input: [
                "HOME Defender Points",
                "8m Coverage Radius",
                "105 × 68m Pitch"
            ],

            output: [
                "Covered Space",
                "Exposed Space",
                "Coverage Ratio"
            ]

        },


        nearest_pressure: {

            functions: [
                "pgDistance()",
                "pgPressureLevel()"
            ],

            input: [
                "HOME Defender Points",
                "Ball / AWAY Target"
            ],

            output: [
                "Pressure Distance",
                "Nearest Defender",
                "Pressure Level"
            ]

        },


        space_between_lines: {

            functions: [
                "pgAveragePoint()",
                "pgDistance()"
            ],

            input: [
                "HOME Player Points",
                "AWAY Player Points"
            ],

            output: [
                "Line Gap",
                "Nearest Defender",
                "Receiving Space"
            ]

        },


        spatial_control: {

            functions: [
                "Spatial Proximity",
                "Control Comparison"
            ],

            input: [
                "HOME Player Points",
                "AWAY Player Points"
            ],

            output: [
                "HOME Control",
                "AWAY Control",
                "Contested Space"
            ]

        },


        attacking_access: {

            functions: [
                "pgDistance()",
                "Access Geometry"
            ],

            input: [
                "AWAY Attacker",
                "HOME Defenders"
            ],

            output: [
                "Goal Distance",
                "Defender Separation",
                "Access Corridor"
            ]

        },


        line_break: {

            functions: [
                "pgDistance()",
                "Defensive Line Geometry"
            ],

            input: [
                "AWAY Attacker",
                "HOME Defensive Line"
            ],

            output: [
                "Break Distance",
                "Defender Separation",
                "Line Access"
            ]

        }

    };


    const engine =
        engines[analysis] || {

            functions: [
                "Spatial Distance"
            ],

            input: [
                "Player Points"
            ],

            output: [
                "Geometry",
                "Metrics"
            ]

        };


    grid.innerHTML = `

        <div>

            <small>
                SPATIAL FUNCTIONS
            </small>

            ${engine.functions
                .map(
                    function (item) {

                        return `
                            <strong>
                                ${escapeHTML(item)}
                            </strong>
                        `;

                    }
                )
                .join("")}

        </div>


        <div>

            <small>
                INPUT
            </small>

            ${engine.input
                .map(
                    function (item) {

                        return `
                            <strong>
                                ${escapeHTML(item)}
                            </strong>
                        `;

                    }
                )
                .join("")}

            <span>
                SRID 0 · 105 × 68 m
            </span>

        </div>


        <div>

            <small>
                OUTPUT
            </small>

            ${engine.output
                .map(
                    function (item) {

                        return `
                            <strong>
                                ${escapeHTML(item)}
                            </strong>
                        `;

                    }
                )
                .join("")}

            <span>
                ${escapeHTML(
                    window.pgAnalyses?.[
                        analysis
                    ]?.title ||
                    "Spatial Analysis"
                )}
            </span>

        </div>

    `;

}

/* =====================================================
   DYNAMIC EVIDENCE ENGINE
===================================================== */

function updateEvidence() {

    const result =
        window.pgAnalysisResult;

    const analysis =
        window.pgAnalyses?.[
            window.pgCurrentAnalysis
        ];

    if (
        !result ||
        !analysis ||
        result.error
    ) {
        return;
    }


    /* =====================================================
       TITLE
    ===================================================== */

    setText(
        "evidenceTitle",
        analysis.title
    );


    /* =====================================================
       SIGNAL
    ===================================================== */

    let signal =
        "SPATIAL STATE";

    switch (
        window.pgCurrentAnalysis
    ) {

        case "defensive_structure":
            signal =
                "STRUCTURE READ";
            break;

        case "defensive_gaps":
            signal =
                "GAP DETECTED";
            break;

        case "defensive_coverage":
            signal =
                "SPACE EXPOSED";
            break;

        case "nearest_pressure":
            signal =
                "PRESSURE READ";
            break;

        case "space_between_lines":
            signal =
                "RECEIVING SPACE";
            break;

        case "spatial_control":
        case "voronoi":
            signal =
                "SPATIAL CONTROL";
            break;

        case "attacking_access":
        case "fullback_overlap":
            signal =
                "ATTACKING ACCESS";
            break;

        default:
            signal =
                "ANALYSIS COMPLETE";
    }


    setText(
        "evidenceSignal",
        signal
    );


    /* =====================================================
       METRICS
    ===================================================== */

    const metrics =
        document.getElementById(
            "insightMetrics"
        );

    if (metrics) {

        metrics.innerHTML = `

            <div class="insight-metric">

                <small>
                    ${escapeHTML(
                        result.primaryLabel ||
                        "PRIMARY"
                    )}
                </small>

                <strong>
                    ${escapeHTML(
                        result.primary ||
                        "—"
                    )}
                </strong>

                <span>
                    spatial measure
                </span>

            </div>


            <div class="insight-metric">

                <small>
                    ${escapeHTML(
                        result.secondaryLabel ||
                        "SECONDARY"
                    )}
                </small>

                <strong>
                    ${escapeHTML(
                        result.secondary ||
                        "—"
                    )}
                </strong>

                <span>
                    scene relationship
                </span>

            </div>


            <div class="insight-metric">

                <small>
                    ${escapeHTML(
                        result.relationshipLabel ||
                        "RELATIONSHIP"
                    )}
                </small>

                <strong>
                    ${escapeHTML(
                        result.relationship ||
                        "—"
                    )}
                </strong>

                <span>
                    tactical signal
                </span>

            </div>

        `;

    }


    /* =====================================================
       WHAT IT MEANS
    ===================================================== */

    setText(
        "evidenceDescription",
        result.text ||
        analysis.description ||
        "The spatial scene has been interpreted."
    );


    /* =====================================================
       TACTICAL SIGNAL
    ===================================================== */

    const tacticalSignal =
        document.getElementById(
            "tacticalSignal"
        );

    if (
        tacticalSignal
    ) {

        let tactical =
            "SPATIAL STATE";

        switch (
            window.pgCurrentAnalysis
        ) {

            case "defensive_structure":

                tactical =
                    "STRUCTURE SHAPE";

                break;


            case "defensive_gaps":

                tactical =
                    "GAP TO WATCH";

                break;


            case "defensive_coverage":

                tactical =
                    "HIGH EXPOSURE";

                break;


            case "nearest_pressure":

                tactical =
                    "PRESSURE SIGNAL";

                break;


            case "space_between_lines":

                tactical =
                    "RECEIVING SPACE";

                break;


            case "spatial_control":

            case "voronoi":

                tactical =
                    "CONTROL BATTLE";

                break;


            case "attacking_access":

            case "fullback_overlap":

                tactical =
                    "ATTACKING ACCESS";

                break;

        }

        tacticalSignal.textContent =
            tactical;

    }


    /* =====================================================
       SNAPSHOT
    ===================================================== */

    pgCapturePitchSnapshot();


    /* =====================================================
       STATE
    ===================================================== */

    const evidence =
        document.getElementById(
            "spatialEvidence"
        );

    if (evidence) {

        evidence.classList.add(
            "interpreted"
        );

    }

}


    /* =====================================================
       AUDIENCE REPORTS
    ===================================================== */

    window.pgBuildAudience =
        function (mode) {

            const result =
                window.pgAnalysisResult;

            const analysis =
                window.pgAnalyses?.[
                    window.pgCurrentAnalysis
                ];

            const output =
                pgx(
                    "audienceOutput"
                );

            if (!output) {
                return;
            }

            if (
                !result ||
                result.error
            ) {

                output.innerHTML = `

                    <div class="audience-result">

                        <strong>
                            RUN AN ANALYSIS FIRST
                        </strong>

                    </div>

                `;

                return;

            }

            let heading =
                "FAN STORY";

            let body = "";

            if (
                mode ===
                "coach"
            ) {

                heading =
                    "COACH REPORT";

                body = `

                    The key coaching signal is
                    ${
                        result.primaryLabel ||
                        "the primary spatial metric"
                    }
                    at
                    ${
                        result.primary ||
                        "—"
                    }.

                    The ${
                        result.relationshipLabel ||
                        "spatial relationship"
                    }
                    is
                    ${
                        result.relationship ||
                        "—"
                    }.

                    The practical question is how
                    the team can protect this space,
                    reduce attacking access or
                    exploit the same spatial weakness.

                `;

            }
            else if (
                mode ===
                "analyst"
            ) {

                heading =
                    "PERFORMANCE ANALYST REPORT";

                body = `

                    The snapshot produced
                    ${
                        result.primaryLabel ||
                        "a primary spatial signal"
                    }
                    of
                    ${
                        result.primary ||
                        "—"
                    },

                    with
                    ${
                        result.secondaryLabel ||
                        "a secondary measure"
                    }
                    of
                    ${
                        result.secondary ||
                        "—"
                    }.

                    The measured relationship is
                    ${
                        result.relationship ||
                        "—"
                    }.

                    ${
                        result.text ||
                        ""
                    }

                `;

            }
            else {

                body = `

                    The interesting part of this
                    football moment is not only the
                    final action.

                    It is the space that existed
                    before the action happened.

                    ${
                        result.text ||
                        analysis.description
                    }

                `;

            }

            output.innerHTML = `

                <div class="audience-result">

                    <div class="audience-type">

                        ${heading}

                    </div>


                    <h3>

                        ${escapeHTML(
                            analysis?.title ||
                            "Spatial Analysis"
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            body
                        )}

                    </p>


                    <div class="audience-metrics">

                        <span>

                            ${escapeHTML(
                                result.primary ||
                                "—"
                            )}

                        </span>

                        <span>

                            ${escapeHTML(
                                result.secondary ||
                                "—"
                            )}

                        </span>

                        <span>

                            ${escapeHTML(
                                result.relationship ||
                                "—"
                            )}

                        </span>

                    </div>

                </div>

            `;

        };


    /* =====================================================
       OVERRIDE RUN ANALYSIS
    ===================================================== */

    const originalRun =
        window.pgRunAnalysis;

    window.pgRunAnalysis =
        function () {

            const id =
                window.pgCurrentAnalysis;

            const customFunction =
                window.pgCustomAnalyses[
                    id
                ];

            if (
                typeof customFunction ===
                "function"
            ) {

                const result =
                    customFunction();

                if (!result) {
                    return;
                }

                window.pgAnalysisResult =
                    result;

                if (
                    result.error
                ) {

                    if (
                        typeof window.pgShowPlacementMessage ===
                        "function"
                    ) {

                        window.pgShowPlacementMessage(
                            result.text
                        );

                    }

                    return;

                }

                drawCustomResult(
                    id,
                    result
                );

                updateEvidence();

                if (
                    typeof window.pgUpdateScenarioUI ===
                    "function"
                ) {

                    window.pgUpdateScenarioUI();

                }

                if (
                    typeof window.pgShowPlacementMessage ===
                    "function"
                ) {

                    window.pgShowPlacementMessage(
                        "Spatial analysis completed"
                    );

                }

                return;

            }


            if (
                typeof originalRun ===
                "function"
            ) {

                originalRun();

            }

            setTimeout(
                updateEvidence,
                100
            );

            setTimeout(
                updateEvidence,
                500
            );

        };


    /* =====================================================
       SELECT ANALYSIS
    ===================================================== */

    const originalSelect =
        window.pgSelectAnalysis;

    if (
        typeof originalSelect ===
        "function"
    ) {

        window.pgSelectAnalysis =
            function (id) {

                originalSelect(id);

                const analysis =
                    window.pgAnalyses?.[id];

                if (analysis) {

                    setText(
                        "evidenceTitle",
                        analysis.title
                    );

                    setText(
                        "evidenceHeadline",
                        "QUESTION SELECTED"
                    );

                    setText(
                        "evidenceDescription",
                        analysis.description
                    );

                    setText(
                        "evidenceSignal",
                        "READY"
                    );

                }

                document
                    .querySelectorAll(
                        ".question-item"
                    )
                    .forEach(
                        button => {

                            const onclick =
                                button.getAttribute(
                                    "onclick"
                                ) || "";

                            button.classList.toggle(
                                "selected",
                                onclick.includes(
                                    `'${id}'`
                                )
                            );

                        }
                    );

            };

    }


    /* =====================================================
       EVIDENCE TABS
    ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const tab =
                event.target.closest(
                    ".evidence-tab"
                );

            if (!tab) {
                return;
            }

            const name =
                tab.dataset.tab;

            document
                .querySelectorAll(
                    ".evidence-tab"
                )
                .forEach(
                    button =>
                        button.classList.toggle(
                            "active",
                            button === tab
                        )
                );

            document
                .querySelectorAll(
                    ".evidence-content"
                )
                .forEach(
                    content =>
                        content.classList.toggle(
                            "active",
                            content.id ===
                            `tab-${name}`
                        )
                );

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initializePitchGridPatch() {

        addMissingButtons();

        if (
            window.pgAnalysisResult
        ) {

            setTimeout(
                updateEvidence,
                100
            );

        }

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePitchGridPatch
        );

    }
    else {

        initializePitchGridPatch();

    }


})();
/* =========================================================
   PITCHGRID — SPATIAL FINDING OUTPUT
========================================================= */

(function () {

    "use strict";


    function pgFinding(id) {
        return document.getElementById(id);
    }


    function pgFindingText(id, value) {

        const el = pgFinding(id);

        if (el) {
            el.textContent =
                value !== undefined &&
                value !== null &&
                value !== ""
                    ? value
                    : "—";
        }

    }


    window.pgUpdateSpatialFinding =
        function () {

            const panel =
                pgFinding("spatialFinding");

            const result =
                window.pgAnalysisResult;

            const analysis =
                window.pgAnalyses
                    ? window.pgAnalyses[
                        window.pgCurrentAnalysis
                    ]
                    : null;


            if (!panel) {
                return;
            }


            /*
               No analysis yet
            */

            if (!result || !analysis) {

                panel.classList.remove(
                    "has-result",
                    "analysis-error"
                );

                pgFindingText(
                    "findingAnalysis",
                    "WAITING FOR ANALYSIS"
                );

                pgFindingText(
                    "findingValue",
                    "—"
                );

                pgFindingText(
                    "findingLabel",
                    "SPATIAL MEASURE"
                );

                pgFindingText(
                    "findingRelation",
                    "—"
                );

                pgFindingText(
                    "findingSecondary",
                    "Run the spatial analysis to reveal the measured relationship."
                );

                pgFindingText(
                    "findingSignal",
                    "WAITING FOR ANALYSIS"
                );

                pgFindingText(
                    "findingText",
                    "Select a spatial question, build the match scene, then run the analysis."
                );

                return;
            }


            /*
               Error
            */

            if (result.error) {

                panel.classList.remove(
                    "has-result"
                );

                panel.classList.add(
                    "analysis-error"
                );


                pgFindingText(
                    "findingAnalysis",
                    analysis.title ||
                    "SPATIAL ANALYSIS"
                );

                pgFindingText(
                    "findingValue",
                    "—"
                );

                pgFindingText(
                    "findingLabel",
                    "ANALYSIS INPUT"
                );

                pgFindingText(
                    "findingRelation",
                    "INSUFFICIENT SCENE"
                );

                pgFindingText(
                    "findingSecondary",
                    result.text ||
                    "The current scene does not contain enough spatial data."
                );

                pgFindingText(
                    "findingSignal",
                    "SCENE INCOMPLETE"
                );

                pgFindingText(
                    "findingText",
                    result.text ||
                    "Add the required players or ball and run the analysis again."
                );

                return;
            }


            /*
               Successful analysis
            */

            panel.classList.remove(
                "analysis-error"
            );

            panel.classList.add(
                "has-result"
            );


            const title =
                analysis.title ||
                "SPATIAL ANALYSIS";


            const primary =
                result.primary ||
                "—";


            const primaryLabel =
                result.primaryLabel ||
                "SPATIAL MEASURE";


            const relationship =
                result.relationship ||
                "—";


            const secondary =
                result.secondary ||
                "—";


            const secondaryLabel =
                result.secondaryLabel ||
                "SECONDARY MEASURE";


            const reading =
                result.text ||
                analysis.description ||
                "Spatial relationship identified.";


            pgFindingText(
                "findingAnalysis",
                title
            );


            pgFindingText(
                "findingValue",
                primary
            );


            pgFindingText(
                "findingLabel",
                primaryLabel
            );


            pgFindingText(
                "findingRelation",
                relationship
            );


            pgFindingText(
                "findingSecondary",
                `${secondaryLabel}: ${secondary}`
            );


            pgFindingText(
                "findingSignal",
                "ANALYSIS COMPLETE"
            );


            pgFindingText(
                "findingText",
                reading
            );


            /*
               Match scene clock
            */

            const sceneClock =
                pgFinding("sceneClock");

            const findingClock =
                pgFinding("findingClock");


            if (
                sceneClock &&
                findingClock
            ) {

                findingClock.textContent =
                    sceneClock.textContent ||
                    "84:32";

            }

        };


    /*
       Connect to RUN ANALYSIS
    */

    const originalRun =
        window.pgRunAnalysis;


    if (
        typeof originalRun === "function"
    ) {

        window.pgRunAnalysis =
            function () {

                const response =
                    originalRun.apply(
                        this,
                        arguments
                    );


                setTimeout(
                    function () {

                        window.pgUpdateSpatialFinding();

                    },
                    150
                );


                setTimeout(
                    function () {

                        window.pgUpdateSpatialFinding();

                    },
                    600
                );


                return response;

            };

    }


})();

/* =========================================================
   PITCHGRID — SPATIAL BRIEF ENGINE
========================================================= */

(function () {

    "use strict";


    const briefConfig = {

        defensive_structure: {
            title: "DEFENSIVE STRUCTURE",

            question:
                "Defensive width, depth and structural shape.",

            flow:
                ["PLAYERS", "GEOMETRY", "STRUCTURE"],

            requirement:
                "3 HOME players required",

            required:
                3,

            message:
                "BUILD THE SCENE"
        },


        defensive_gaps: {
            title: "DEFENSIVE GAPS",

            question:
                "Critical spacing between defenders.",

            flow:
                ["PLAYERS", "DISTANCE", "GAPS"],

            requirement:
                "2+ HOME players required",

            required:
                2,

            message:
                "BUILD THE SCENE"
        },


        defensive_coverage: {
            title: "DEFENSIVE COVERAGE",

            question:
                "How much defensive space is protected versus exposed.",

            flow:
                ["PLAYERS", "BUFFER", "COVERAGE"],

            requirement:
                "1+ HOME players required",

            required:
                1,

            message:
                "BUILD THE SCENE"
        },


        nearest_pressure: {
            title: "NEAREST PRESSURE",

            question:
                "Who can access the target first — and from what distance?",

            flow:
                ["DEFENDER", "DISTANCE", "PRESSURE"],

            requirement:
                "1 HOME player + target",

            required:
                1,

            message:
                "WAITING FOR TARGET"
        },


        distance_analysis: {
            title: "SPACE BETWEEN LINES",

            question:
                "The receiving space between defensive and midfield lines.",

            flow:
                ["LINES", "DISTANCE", "SPACE"],

            requirement:
                "Players from both lines required",

            required:
                2,

            message:
                "BUILD THE TWO LINES"
        },


        voronoi: {
            title: "SPATIAL CONTROL",

            question:
                "Which players control the available territory?",

            flow:
                ["PLAYERS", "TERRITORY", "CONTROL"],

            requirement:
                "2+ players required",

            required:
                2,

            message:
                "BUILD THE SPATIAL FIELD"
        },


        fullback_overlap: {
            title: "ATTACKING ACCESS",

            question:
                "Where attacking players gain access to the final corridor.",

            flow:
                ["ATTACKERS", "CORRIDOR", "ACCESS"],

            requirement:
                "Attacking players required",

            required:
                2,

            message:
                "BUILD THE ATTACK"
        },


        line_break: {
            title: "LINE BREAK SPACE",

            question:
                "Whether an attacker can access or penetrate the defensive structure.",

            flow:
                ["ATTACKER", "DEFENSIVE LINE", "BREAK"],

            requirement:
                "Attackers + 2 defenders",

            required:
                2,

            message:
                "BUILD THE STRUCTURE"
        }

    };


    function getConfig(id) {

        return (
            briefConfig[id] ||
            briefConfig.defensive_structure
        );

    }


    function getHomePlayers() {

        return Array.isArray(
            window.pgPlayers
        )
            ? window.pgPlayers.filter(
                player =>
                    String(
                        player.team ||
                        ""
                    ).toUpperCase() ===
                    "HOME"
            )
            : [];

    }


    function updateProgress(config) {

        const count =
            getHomePlayers().length;

        const countEl =
            document.getElementById(
                "briefCount"
            );

        const bar =
            document.getElementById(
                "briefProgressBar"
            );

        const message =
            document.getElementById(
                "briefSceneMessage"
            );

        const status =
            document.getElementById(
                "briefStatus"
            );

        if (!countEl) {
            return;
        }


        const safeCount =
            Math.min(
                count,
                config.required
            );


        const percentage =
            Math.min(
                100,
                (
                    safeCount /
                    config.required
                ) * 100
            );


        countEl.textContent =
            `${safeCount} / ${config.required}`;


        if (bar) {

            bar.style.width =
                `${percentage}%`;

        }


        if (
            safeCount >=
            config.required
        ) {

            if (message) {

                message.textContent =
                    "SCENE READY";

            }

            if (status) {

                status.textContent =
                    "READY";

            }

        }

        else {

            const remaining =
                config.required -
                safeCount;

            if (message) {

                message.textContent =
                    remaining === 1
                        ? "1 MORE REQUIRED"
                        : `${remaining} MORE REQUIRED`;

            }

            if (status) {

                status.textContent =
                    "BUILDING";

            }

        }

    }


    window.pgUpdateSpatialBrief =
        function (analysisId) {

            const config =
                getConfig(
                    analysisId
                );


            const title =
                document.getElementById(
                    "briefTitle"
                );

            const question =
                document.getElementById(
                    "briefQuestion"
                );

            const requirement =
                document.getElementById(
                    "briefRequirement"
                );

            const flow =
                document.getElementById(
                    "briefFlow"
                );


            if (title) {

                title.textContent =
                    config.title;

            }


            if (question) {

                question.textContent =
                    config.question;

            }


            if (requirement) {

                requirement.textContent =
                    config.requirement;

            }


            if (flow) {

                flow.innerHTML =
                    config.flow
                        .map(
                            function (item, index) {

                                let html =
                                    `<span>${item}</span>`;

                                if (
                                    index <
                                    config.flow.length - 1
                                ) {

                                    html +=
                                        `<i class="fa-solid fa-arrow-right"></i>`;

                                }

                                return html;

                            }
                        )
                        .join("");

            }


            updateProgress(
                config
            );

        };


    window.pgUpdateSpatialBriefProgress =
        function () {

            const id =
                window.pgCurrentAnalysis ||
                "defensive_structure";

            updateProgress(
                getConfig(id)
            );

        };


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                function () {

                    window.pgUpdateSpatialBrief(
                        window.pgCurrentAnalysis ||
                        "defensive_structure"
                    );

                },
                100
            );

        }
    );


})();


/* =========================================================
   PITCHGRID — SPATIAL STORY ENGINE
========================================================= */

(function () {

    "use strict";


    function el(id) {
        return document.getElementById(id);
    }


    function getAnalysis() {

        const id =
            window.pgCurrentAnalysis ||
            "defensive_structure";

        const analyses =
            window.pgAnalyses ||
            {};

        return analyses[id] || {
            title: id
        };

    }


    function getResult() {

        return (
            window.pgAnalysisResult ||
            window.pgLastResult ||
            null
        );

    }


    function setText(id, value) {

        const node = el(id);

        if (node) {
            node.textContent =
                value || "—";
        }

    }


    function updateStory() {

        const analysis =
            getAnalysis();

        const result =
            getResult();

        const title =
            String(
                analysis.title ||
                "Spatial Analysis"
            ).toUpperCase();


        /*
           --------------------------------------------------
           DEFAULT STORY
        --------------------------------------------------
        */

        let structure =
            "Defensive Block";

        let structureValue =
            "SPATIAL FOOTPRINT";

        let deformation =
            "Spatial Shift";

        let deformationValue =
            "RELATIONSHIP";

        let consequence =
            "Space Identified";

        let consequenceValue =
            "SPATIAL ACCESS";

        let reading =
            "Build the scene and run the spatial analysis to reveal how player relationships shape the available space.";


        /*
           --------------------------------------------------
           RESULT-DRIVEN VALUES
        --------------------------------------------------
        */

        if (
            result &&
            !result.error
        ) {

            if (
                result.primary
            ) {

                structureValue =
                    String(
                        result.primary
                    );

            }

            if (
                result.secondary
            ) {

                deformationValue =
                    String(
                        result.secondary
                    );

            }

            if (
                result.relationship
            ) {

                consequenceValue =
                    String(
                        result.relationship
                    );

            }

            if (
                result.text
            ) {

                reading =
                    String(
                        result.text
                    );

            }

        }


        /*
           --------------------------------------------------
           DEFENSIVE STRUCTURE
        --------------------------------------------------
        */

        if (
            window.pgCurrentAnalysis ===
            "defensive_structure"
        ) {

            structure =
                "Defensive Block";

            deformation =
                "Structural Shape";

            consequence =
                "Spatial Balance";


            if (
                result &&
                !result.error
            ) {

                structureValue =
                    result.primary ||
                    structureValue;

                deformationValue =
                    result.secondary ||
                    deformationValue;

                consequenceValue =
                    result.relationship ||
                    consequenceValue;

            }

        }


        /*
           --------------------------------------------------
           DEFENSIVE GAPS
        --------------------------------------------------
        */

        else if (
            window.pgCurrentAnalysis ===
            "defensive_gaps"
        ) {

            structure =
                "Defensive Pair";

            deformation =
                "Critical Gap";

            consequence =
                "Exposure";


            if (
                result &&
                !result.error
            ) {

                structureValue =
                    result.primary ||
                    "PLAYER RELATIONSHIP";

                deformationValue =
                    result.secondary ||
                    "DISTANCE";

                consequenceValue =
                    result.relationship ||
                    "GAP AVAILABLE";

            }

        }


        /*
           --------------------------------------------------
           DEFENSIVE COVERAGE
        --------------------------------------------------
        */

        else if (
            window.pgCurrentAnalysis ===
            "defensive_coverage"
        ) {

            structure =
                "Defensive Footprint";

            deformation =
                "Covered Space";

            consequence =
                "Exposed Space";


            if (
                result &&
                !result.error
            ) {

                structureValue =
                    result.primary ||
                    "COVERAGE";

                deformationValue =
                    result.secondary ||
                    "PROTECTED";

                consequenceValue =
                    result.relationship ||
                    "EXPOSED";

            }

        }


        /*
           --------------------------------------------------
           SPACE BETWEEN LINES
        --------------------------------------------------
        */

        else if (
            window.pgCurrentAnalysis ===
            "distance_analysis" ||
            window.pgCurrentAnalysis ===
            "space_between_lines"
        ) {

            structure =
                "Defensive Line";

            deformation =
                "Receiving Space";

            consequence =
                "Line Access";


            if (
                result &&
                !result.error
            ) {

                structureValue =
                    result.primary ||
                    "LINE POSITION";

                deformationValue =
                    result.secondary ||
                    "SPACE";

                consequenceValue =
                    result.relationship ||
                    "ACCESS";

            }

        }


        /*
           --------------------------------------------------
           SPATIAL CONTROL
        --------------------------------------------------
        */

        else if (
            window.pgCurrentAnalysis ===
            "voronoi" ||
            window.pgCurrentAnalysis ===
            "spatial_control"
        ) {

            structure =
                "Player Positions";

            deformation =
                "Territory";

            consequence =
                "Spatial Control";


            if (
                result &&
                !result.error
            ) {

                structureValue =
                    result.primary ||
                    "PLAYERS";

                deformationValue =
                    result.secondary ||
                    "TERRITORY";

                consequenceValue =
                    result.relationship ||
                    "CONTROL";

            }

        }


        /*
           --------------------------------------------------
           ATTACKING ACCESS
        --------------------------------------------------
        */

        else if (
            window.pgCurrentAnalysis ===
            "fullback_overlap" ||
            window.pgCurrentAnalysis ===
            "attacking_access" ||
            window.pgCurrentAnalysis ===
            "attacking_space"
        ) {

            structure =
                "Attacking Shape";

            deformation =
                "Access Corridor";

            consequence =
                "Progression";


            if (
                result &&
                !result.error
            ) {

                structureValue =
                    result.primary ||
                    "ATTACKING SHAPE";

                deformationValue =
                    result.secondary ||
                    "CORRIDOR";

                consequenceValue =
                    result.relationship ||
                    "ACCESS";

            }

        }


        /*
           --------------------------------------------------
           LINE BREAK
        --------------------------------------------------
        */

        else if (
            window.pgCurrentAnalysis ===
            "line_break"
        ) {

            structure =
                "Defensive Screen";

            deformation =
                "Break Corridor";

            consequence =
                "Line Access";


            if (
                result &&
                !result.error
            ) {

                structureValue =
                    result.primary ||
                    "DEFENSIVE LINE";

                deformationValue =
                    result.secondary ||
                    "CORRIDOR";

                consequenceValue =
                    result.relationship ||
                    "LINE BREAK";

            }

        }


        /*
           --------------------------------------------------
           UPDATE DOM
        --------------------------------------------------
        */

        setText(
            "storyTitle",
            title
        );

        setText(
            "storyStructure",
            structure
        );

        setText(
            "storyStructureValue",
            structureValue
        );

        setText(
            "storyDeformation",
            deformation
        );

        setText(
            "storyDeformationValue",
            deformationValue
        );

        setText(
            "storyConsequence",
            consequence
        );

        setText(
            "storyConsequenceValue",
            consequenceValue
        );

        setText(
            "storyReading",
            reading
        );


        /*
           --------------------------------------------------
           SCENE CLOCK
        --------------------------------------------------
        */

        const clock =
            el("sceneClock");

        if (
            clock &&
            el("storyClock")
        ) {

            el(
                "storyClock"
            ).textContent =
                clock.textContent ||
                "84:32";

        }

    }


    /*
       ------------------------------------------------------
       PUBLIC FUNCTION
       ------------------------------------------------------
    */

    window.pgUpdateSpatialStory =
        updateStory;


    /*
       ------------------------------------------------------
       HOOK INTO ANALYSIS SELECTION
       ------------------------------------------------------
    */

    const originalSelect =
        window.pgSelectAnalysis;


    window.pgSelectAnalysis =
        function (id) {

            if (
                typeof originalSelect ===
                "function"
            ) {

                originalSelect(id);

            }


            setTimeout(
                updateStory,
                50
            );

        };


    /*
       ------------------------------------------------------
       HOOK INTO RUN ANALYSIS
       ------------------------------------------------------
    */

    const originalRun =
        window.pgRunAnalysis;


    window.pgRunAnalysis =
        function () {

            let output;

            if (
                typeof originalRun ===
                "function"
            ) {

                output =
                    originalRun.apply(
                        this,
                        arguments
                    );

            }


            setTimeout(
                updateStory,
                100
            );


            setTimeout(
                updateStory,
                350
            );


            return output;

        };


    /*
       ------------------------------------------------------
       INITIAL STATE
       ------------------------------------------------------
    */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                updateStory,
                500
            );

        }
    );


})();


/* =========================================================
   POSTGIS TACTICAL LAB
   Spatial Question Builder
========================================================= */

(function () {

    "use strict";


    const labConfig = {

        space: {
            question:
                "Find the most exposed space between defensive lines.",

            analysis: "distance_analysis",

            title:
                "Space Between Lines",

            functions: [
                "ST_Distance()",
                "ST_MakeLine()",
                "ST_Buffer()",
                "ST_Intersection()"
            ]
        },


        control: {
            question:
                "Which players control the largest spatial territory?",

            analysis: "voronoi",

            title:
                "Spatial Control",

            functions: [
                "ST_VoronoiPolygons()",
                "ST_Intersection()",
                "ST_Area()",
                "ST_Union()"
            ]
        },


        passing: {
            question:
                "Which passing lane is most vulnerable to defensive pressure?",

            analysis: "passing_lanes",

            title:
                "Passing Lane Geometry",

            functions: [
                "ST_MakeLine()",
                "ST_Buffer()",
                "ST_Intersects()",
                "ST_DWithin()"
            ]
        },


        defending: {
            question:
                "How much defensive space is actually protected?",

            analysis: "defensive_coverage",

            title:
                "Defensive Coverage",

            functions: [
                "ST_Buffer()",
                "ST_Union()",
                "ST_Difference()",
                "ST_Area()"
            ]
        },


        risk: {
            question:
                "Where is the highest immediate spatial pressure?",

            analysis: "nearest_pressure",

            title:
                "Nearest Pressure",

            functions: [
                "ST_Distance()",
                "ST_DWithin()",
                "ST_ClosestPoint()",
                "ST_Intersects()"
            ]
        }

    };


    let currentDomain = "space";


    function lab(id) {
        return document.getElementById(id);
    }


    function setLabText(id, value) {

        const node = lab(id);

        if (node) {
            node.textContent = value || "—";
        }

    }


    function setProcess(step) {

        const ids = [
            "processGeometry",
            "processPostgis",
            "processResult",
            "processInsight"
        ];

        ids.forEach(function (id, index) {

            const node = lab(id);

            if (!node) return;

            node.classList.toggle(
                "active",
                index <= step
            );

        });

    }


    function setState(text) {

        const state = lab("labState");

        if (!state) return;

        state.innerHTML = `
            <span></span>
            ${text}
        `;

    }


    /* ---------------------------------------------------------
       DOMAIN SELECTOR
    --------------------------------------------------------- */

    window.pgLabDomain = function (domain) {

        if (!labConfig[domain]) {
            return;
        }

        currentDomain = domain;

        document
            .querySelectorAll(".lab-domain")
            .forEach(function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.domain === domain
                );

            });


        setLabText(
            "labQuestion",
            labConfig[domain].question
        );


        setLabText(
            "labResultTitle",
            "Waiting for spatial query"
        );


        setLabText(
            "labResultStatus",
            "READY"
        );


        const functions =
            lab("labFunctions");

        if (functions) {

            functions.innerHTML =
                labConfig[domain]
                    .functions
                    .map(function (fn) {

                        return `<span>${fn}</span>`;

                    })
                    .join("");

        }

    };


    /* ---------------------------------------------------------
       RUN LAB
    --------------------------------------------------------- */

    
    /* ---------------------------------------------------------
       INITIAL STATE
    --------------------------------------------------------- */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            pgLabDomain("space");

        }
    );


})();

/* =========================================================
   PITCHGRID
   POSTGIS TACTICAL QUESTION ENGINE
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       QUESTION DATABASE
    ===================================================== */

    const PG_TACTICAL_ENGINE = {

        space: {

            questions: [

                {
                    id: "space_between_lines",

                    label:
                        "Where is the largest receiving space between the lines?",

                    description:
                        "Measure the spatial separation between defensive and attacking units.",

                    analysis:
                        "space_receiving",

                    functions: [
                        "ST_Distance()",
                        "ST_MakeLine()",
                        "ST_Buffer()",
                        "ST_Intersection()"
                    ]
                },


                {
                    id: "spatial_corridor",

                    label:
                        "Where is the largest exposed progression corridor?",

                    description:
                        "Detect an open corridor created by the defensive geometry.",

                    analysis:
                        "occupied_exposed_space",

                    functions: [
                        "ST_ConvexHull()",
                        "ST_Difference()",
                        "ST_Buffer()",
                        "ST_Area()"
                    ]
                },


                {
                    id: "exposed_space",

                    label:
                        "How much space is currently exposed?",

                    description:
                        "Compare the defensive footprint with the remaining pitch space.",

                    analysis:
                        "occupied_exposed_space",

                    functions: [
                        "ST_ConvexHull()",
                        "ST_Difference()",
                        "ST_Area()",
                        "ST_Percent()"
                    ]
                },


                {
                    id: "compression",

                    label:
                        "How compressed is the current spatial structure?",

                    description:
                        "Measure how tightly the defensive units occupy the pitch.",

                    analysis:
                        "defensive_structure",

                    functions: [
                        "ST_ConvexHull()",
                        "ST_Area()",
                        "ST_Perimeter()",
                        "ST_Centroid()"
                    ]
                }

            ]

        },


        control: {

            questions: [

                {
                    id: "spatial_control",

                    label:
                        "Who controls the largest territory?",

                    description:
                        "Estimate territorial control using player influence regions.",

                    analysis:
                        "spatial_control",

                    functions: [
                        "ST_VoronoiPolygons()",
                        "ST_Intersection()",
                        "ST_Area()",
                        "ST_Union()"
                    ]
                },


                {
                    id: "contested_space",

                    label:
                        "Where is the most contested space?",

                    description:
                        "Identify areas where opposing spatial influence converges.",

                    analysis:
                        "spatial_control",

                    functions: [
                        "ST_VoronoiPolygons()",
                        "ST_Intersection()",
                        "ST_Area()"
                    ]
                },


                {
                    id: "isolation",

                    label:
                        "Which attacker is spatially isolated?",

                    description:
                        "Compare attacker distance to teammates and defenders.",

                    analysis:
                        "nearest_pressure",

                    functions: [
                        "ST_Distance()",
                        "ST_DWithin()",
                        "ST_ClosestPoint()"
                    ]
                }

            ]

        },


        pressure: {

            questions: [

                {
                    id: "nearest_pressure",

                    label:
                        "Who can reach the ball fastest?",

                    description:
                        "Measure nearest-defender access to the target.",

                    analysis:
                        "nearest_pressure",

                    functions: [
                        "ST_Distance()",
                        "ST_DWithin()",
                        "ST_ClosestPoint()"
                    ]
                },


                {
                    id: "pressure_field",

                    label:
                        "Where is the strongest immediate pressure?",

                    description:
                        "Build a local pressure field around the ball.",

                    analysis:
                        "pressure_field",

                    functions: [
                        "ST_Buffer()",
                        "ST_Distance()",
                        "ST_Union()"
                    ]
                },


                {
                    id: "escape_route",

                    label:
                        "Where can the pressured player escape?",

                    description:
                        "Identify the available spatial route away from pressure.",

                    analysis:
                        "pressure_field",

                    functions: [
                        "ST_Difference()",
                        "ST_Buffer()",
                        "ST_Intersection()"
                    ]
                }

            ]

        },


        passing: {

            questions: [

                {
                    id: "passing_lane",

                    label:
                        "Which passing lane is most vulnerable?",

                    description:
                        "Construct a passing corridor and test defensive obstruction.",

                    analysis:
                        "attacking_access",

                    functions: [
                        "ST_MakeLine()",
                        "ST_Buffer()",
                        "ST_Intersects()",
                        "ST_DWithin()"
                    ]
                },


                {
                    id: "blocked_lane",

                    label:
                        "Which passing lane is blocked?",

                    description:
                        "Identify the defender intersecting the passing corridor.",

                    analysis:
                        "attacking_access",

                    functions: [
                        "ST_MakeLine()",
                        "ST_Buffer()",
                        "ST_Intersects()"
                    ]
                },


                {
                    id: "third_man",

                    label:
                        "Where is the third-man route?",

                    description:
                        "Identify a spatial connection between three attacking points.",

                    analysis:
                        "attacking_access",

                    functions: [
                        "ST_MakeLine()",
                        "ST_Distance()",
                        "ST_Intersection()"
                    ]
                }

            ]

        },


        defending: {

            questions: [

                {
                    id: "defensive_structure",

                    label:
                        "What is the current defensive shape?",

                    description:
                        "Measure width, depth and spatial footprint.",

                    analysis:
                        "defensive_structure",

                    functions: [
                        "ST_ConvexHull()",
                        "ST_Area()",
                        "ST_Perimeter()",
                        "ST_Centroid()"
                    ]
                },


                {
                    id: "chain_break",

                    label:
                        "Where did the defensive chain break?",

                    description:
                        "Measure relationships between consecutive defenders.",

                    analysis:
                        "defensive_gaps",

                    functions: [
                        "ST_Distance()",
                        "ST_MakeLine()",
                        "ST_Azimuth()"
                    ]
                },


                {
                    id: "defensive_coverage",

                    label:
                        "How much defensive space is actually protected?",

                    description:
                        "Estimate protected and exposed pitch space.",

                    analysis:
                        "defensive_coverage",

                    functions: [
                        "ST_Buffer()",
                        "ST_Union()",
                        "ST_Difference()",
                        "ST_Area()"
                    ]
                },


                {
                    id: "polygon_deformation",

                    label:
                        "How has the defensive polygon deformed?",

                    description:
                        "Compare defensive geometry through width, depth and area.",

                    analysis:
                        "defensive_structure",

                    functions: [
                        "ST_ConvexHull()",
                        "ST_Area()",
                        "ST_Perimeter()",
                        "ST_Centroid()"
                    ]
                }

            ]

        },


        attacking: {

            questions: [

                {
                    id: "attacking_access",

                    label:
                        "Where does the attack have spatial access?",

                    description:
                        "Measure the attacking route toward goal and defensive obstruction.",

                    analysis:
                        "attacking_access",

                    functions: [
                        "ST_MakeLine()",
                        "ST_Buffer()",
                        "ST_Intersects()",
                        "ST_Distance()"
                    ]
                },


                {
                    id: "line_break",

                    label:
                        "Where can the defensive line be broken?",

                    description:
                        "Detect a usable spatial corridor through the defensive screen.",

                    analysis:
                        "distance_analysis",

                    functions: [
                        "ST_Distance()",
                        "ST_Intersection()",
                        "ST_Buffer()"
                    ]
                },


                {
                    id: "final_third",

                    label:
                        "Where is the most dangerous attacking pocket?",

                    description:
                        "Combine location, goal proximity and defensive pressure.",

                    analysis:
                        "final_third_threat",

                    functions: [
                        "ST_Distance()",
                        "ST_DWithin()",
                        "ST_Buffer()",
                        "ST_Intersection()"
                    ]
                }

            ]

        },


        transition: {

            questions: [

                {
                    id: "transition_exposure",

                    label:
                        "Where is the team most exposed in transition?",

                    description:
                        "Identify exposed space created by the current structure.",

                    analysis:
                        "occupied_exposed_space",

                    functions: [
                        "ST_ConvexHull()",
                        "ST_Difference()",
                        "ST_Area()"
                    ]
                },


                {
                    id: "rest_defense",

                    label:
                        "Is the rest-defense structure protecting the central space?",

                    description:
                        "Measure the defensive footprint behind the attack.",

                    analysis:
                        "defensive_coverage",

                    functions: [
                        "ST_Buffer()",
                        "ST_Union()",
                        "ST_Intersection()",
                        "ST_Area()"
                    ]
                },


                {
                    id: "recovery_space",

                    label:
                        "Where is the recovery route?",

                    description:
                        "Measure the shortest spatial route back into defensive structure.",

                    analysis:
                        "nearest_pressure",

                    functions: [
                        "ST_Distance()",
                        "ST_MakeLine()",
                        "ST_DWithin()"
                    ]
                }

            ]

        }

    };


    let currentDomain = "space";

    let currentQuestion =
        PG_TACTICAL_ENGINE.space.questions[0];


    /* =====================================================
       HELPERS
    ===================================================== */

    function $(id) {

        return document.getElementById(id);

    }


    function text(id, value) {

        const node = $(id);

        if (node) {
            node.textContent =
                value ?? "—";
        }

    }


    /* =====================================================
       STATE
    ===================================================== */

    function setLabState(state) {

        const node =
            $("labState");

        if (!node) return;

        node.innerHTML = `
            <i></i>
            <strong>${state}</strong>
        `;

    }


    function setPipeline(step) {

        document
            .querySelectorAll(".pg-engine-step")
            .forEach(function (node, index) {

                node.classList.toggle(
                    "active",
                    index <= step
                );

            });

    }


    /* =====================================================
       DOMAIN
    ===================================================== */

    window.pgLabDomain = function (domain) {

        const config =
            PG_TACTICAL_ENGINE[domain];

        if (!config) return;

        currentDomain =
            domain;

        currentQuestion =
            config.questions[0];


        document
            .querySelectorAll(".pg-domain")
            .forEach(function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.domain === domain
                );

            });


        renderQuestions();

        selectQuestion(
            currentQuestion
        );

    };


    /* =====================================================
       QUESTION LIST
    ===================================================== */

    function renderQuestions() {

        const container =
            $("pgLabQuestions");

        if (!container) return;


        const questions =
            PG_TACTICAL_ENGINE[
                currentDomain
            ].questions;


        container.innerHTML =
            questions.map(function (q, index) {

                return `
                    <button
                        class="pg-question-option
                        ${index === 0 ? "active" : ""}"
                        data-question="${q.id}"
                    >

                        <span>

                            <strong>
                                ${q.label}
                            </strong>

                            <small>
                                ${q.description}
                            </small>

                        </span>

                        <i class="fa-solid fa-arrow-right"></i>

                    </button>
                `;

            }).join("");


        container
            .querySelectorAll(
                ".pg-question-option"
            )
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const q =
                            questions.find(
                                item =>
                                    item.id ===
                                    button.dataset.question
                            );

                        if (!q) return;

                        selectQuestion(q);

                    }
                );

            });

    }


    /* =====================================================
       SELECT QUESTION
    ===================================================== */

    function selectQuestion(question) {

        currentQuestion =
            question;


        document
            .querySelectorAll(
                ".pg-question-option"
            )
            .forEach(function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.question ===
                    question.id
                );

            });


        text(
            "labQuestion",
            question.label
        );


        const functions =
            $("labFunctions");

        if (functions) {

            functions.innerHTML =
                question.functions
                    .map(
                        fn =>
                            `<span>${fn}</span>`
                    )
                    .join("");

        }


        const result =
            $("labResult");

        if (result) {

            result.classList.remove(
                "show"
            );

        }


        setLabState(
            "READY"
        );

        setPipeline(0);

    }


    /* =====================================================
   PITCHGRID QUERY VALIDATION
===================================================== */


/* =====================================================
   READ CURRENT PITCH SCENE
   PITCHGRID — LIVE SCENE READER
===================================================== */

function pgReadCurrentScene() {

    const players =
        Array.isArray(window.pgPlayers)
            ? window.pgPlayers
            : [];


    /* ================================
       HOME PLAYERS
    ================================= */

    const homePlayers =
        players
            .filter(function (player) {

                return player &&
                    String(player.team).toUpperCase() === "HOME";

            })
            .map(function (player) {

                return {
                    id: player.id,
                    name: player.name,
                    position: player.position,
                    team: "HOME",
                    x: Number(player.x),
                    y: Number(player.y)
                };

            })
            .filter(function (player) {

                return Number.isFinite(player.x) &&
                       Number.isFinite(player.y);

            });


    /* ================================
       AWAY PLAYERS
    ================================= */

    const awayPlayers =
        players
            .filter(function (player) {

                return player &&
                    String(player.team).toUpperCase() === "AWAY";

            })
            .map(function (player) {

                return {
                    id: player.id,
                    name: player.name,
                    position: player.position,
                    team: "AWAY",
                    x: Number(player.x),
                    y: Number(player.y)
                };

            })
            .filter(function (player) {

                return Number.isFinite(player.x) &&
                       Number.isFinite(player.y);

            });


    /* ================================
       BALL
    ================================= */

    let ball = null;


    /*
       Current PitchGrid ball
    */

    if (
        window.pgBall &&
        Number.isFinite(Number(window.pgBall.x)) &&
        Number.isFinite(Number(window.pgBall.y))
    ) {

        ball = {

            x: Number(window.pgBall.x),

            y: Number(window.pgBall.y)

        };

    }


    /*
       Backup ball variable
    */

    else if (
        window.ball &&
        Number.isFinite(Number(window.ball.x)) &&
        Number.isFinite(Number(window.ball.y))
    ) {

        ball = {

            x: Number(window.ball.x),

            y: Number(window.ball.y)

        };

    }


    /*
       Another possible ball variable
    */

    else if (
        window.pgCurrentBall &&
        Number.isFinite(Number(window.pgCurrentBall.x)) &&
        Number.isFinite(Number(window.pgCurrentBall.y))
    ) {

        ball = {

            x: Number(window.pgCurrentBall.x),

            y: Number(window.pgCurrentBall.y)

        };

    }


    /* ================================
       RETURN CURRENT SCENE
    ================================= */

    return {

        players: players,

        home: homePlayers,

        away: awayPlayers,

        ball: ball,

        playerCount:
            players.length,

        homeCount:
            homePlayers.length,

        awayCount:
            awayPlayers.length

    };

}


/* =====================================================
   DEBUG CURRENT SCENE
===================================================== */

window.pgDebugScene = function () {

    const scene =
        pgReadCurrentScene();


    console.log(
        "========== PITCHGRID CURRENT SCENE =========="
    );


    console.log(
        "TOTAL PLAYERS:",
        scene.playerCount
    );


    console.log(
        "HOME PLAYERS:",
        scene.home
    );


    console.log(
        "AWAY PLAYERS:",
        scene.away
    );


    console.log(
        "HOME COUNT:",
        scene.homeCount
    );


    console.log(
        "AWAY COUNT:",
        scene.awayCount
    );


    console.log(
        "BALL:",
        scene.ball
    );


    console.log(
        "=============================================="
    );


    return scene;

};


/* =====================================================
   QUERY REQUIREMENTS
===================================================== */

const pgQueryRequirements = {

    space_between_lines: {
        home: 2,
        away: 1,
        ball: false
    },

    distance_analysis: {
        home: 2,
        away: 1,
        ball: false
    },

    occupied_exposed_space: {
        home: 2,
        away: 1,
        ball: false
    },


    spatial_control: {
        home: 2,
        away: 2,
        ball: false
    },

    voronoi: {
        home: 2,
        away: 2,
        ball: false
    },


    pressure_field: {
        home: 1,
        away: 1,
        ball: true
    },

    nearest_defender: {
        home: 1,
        away: 1,
        ball: true
    },


    passing_lane: {
        home: 2,
        away: 1,
        ball: true
    },

    passing_lane_analysis: {
        home: 2,
        away: 1,
        ball: true
    },


    defensive_structure: {
        home: 3,
        away: 1,
        ball: false
    },

    defensive_gaps: {
        home: 3,
        away: 1,
        ball: false
    },

    defensive_coverage: {
        home: 3,
        away: 1,
        ball: false
    },


    attacking_access: {
        home: 2,
        away: 2,
        ball: true
    },

    attacking_space: {
        home: 2,
        away: 2,
        ball: true
    },

    fullback_overlap: {
        home: 2,
        away: 2,
        ball: true
    },

    line_break: {
        home: 2,
        away: 2,
        ball: true
    },


    transition_space: {
        home: 2,
        away: 2,
        ball: true
    }

};


/* =====================================================
   VALIDATE CURRENT SCENE
===================================================== */

/* =====================================================
   VALIDATE CURRENT SCENE
===================================================== */

function pgValidateCurrentScene() {

    const scene =
        pgReadCurrentScene();

    const analysisId =
        currentQuestion &&
        currentQuestion.analysis
            ? currentQuestion.analysis
            : null;

    const requirement =
        analysisId &&
        pgQueryRequirements[analysisId]
            ? pgQueryRequirements[analysisId]
            : null;

    /*
       If this analysis has no special
       requirement, allow it to run.
    */

    if (!requirement) {

        return {
            valid: true,
            scene: scene,
            missing: []
        };

    }

    const missing = [];

    /* =========================================
       DEFENDERS
       HOME = DEFENSIVE UNIT
    ========================================= */

    const requiredDefenders =
        Number(requirement.defenders || 0);

    if (
        scene.home.length <
        requiredDefenders
    ) {

        missing.push(
            "DEFENDERS: " +
            requiredDefenders +
            " required, " +
            scene.home.length +
            " placed"
        );

    }

    /* =========================================
       ATTACKERS
       AWAY = ATTACKING UNIT
    ========================================= */

    const requiredAttackers =
        Number(requirement.attackers || 0);

    if (
        scene.away.length <
        requiredAttackers
    ) {

        missing.push(
            "ATTACKERS: " +
            requiredAttackers +
            " required, " +
            scene.away.length +
            " placed"
        );

    }

    /* =========================================
       BALL
    ========================================= */

    if (
        requirement.ball &&
        !scene.ball
    ) {

        missing.push(
            "BALL position is required"
        );

    }

    return {

        valid:
            missing.length === 0,

        scene:
            scene,

        missing:
            missing

    };

}


/* =====================================================
   QUERY NOTIFICATION
===================================================== */

function pgShowQueryNotification(
    message,
    type
) {

    let notification =
        document.getElementById(
            "pgQueryNotification"
        );


    if (!notification) {

        notification =
            document.createElement("div");


        notification.id =
            "pgQueryNotification";


        notification.style.position =
            "fixed";


        notification.style.left =
            "50%";


        notification.style.bottom =
            "28px";


        notification.style.transform =
            "translateX(-50%)";


        notification.style.zIndex =
            "99999";


        notification.style.padding =
            "14px 20px";


        notification.style.background =
            "#ffffff";


        notification.style.border =
            "1px solid #17845b";


        notification.style.color =
            "#17221d";


        notification.style.fontSize =
            "12px";


        notification.style.fontWeight =
            "600";


        notification.style.letterSpacing =
            "0.04em";


        notification.style.boxShadow =
            "0 8px 24px rgba(0,0,0,0.08)";


        notification.style.maxWidth =
            "620px";


        notification.style.textAlign =
            "center";


        document.body.appendChild(
            notification
        );

    }


    notification.textContent =
        message;


    notification.style.display =
        "block";


    clearTimeout(
        window.pgNotificationTimer
    );


    window.pgNotificationTimer =
        setTimeout(function () {

            notification.style.display =
                "none";

        }, 3500);

}


/* =====================================================
   DEBUG
===================================================== */

window.pgDebugScene = function () {

    const scene =
        pgReadCurrentScene();


    console.log(
        "========== PITCHGRID SCENE =========="
    );


    console.log(
        "TOTAL PLAYERS:",
        scene.playerCount
    );


    console.log(
        "HOME PLAYERS:",
        scene.home
    );


    console.log(
        "AWAY PLAYERS:",
        scene.away
    );


    console.log(
        "BALL:",
        scene.ball
    );


    console.log(
        "HOME COUNT:",
        scene.homeCount
    );


    console.log(
        "AWAY COUNT:",
        scene.awayCount
    );


    console.log(
        "====================================="
    );


    return scene;

};


/* =====================================================
   SPACE ANALYSIS
   LARGEST RECEIVING SPACE BETWEEN THE LINES
===================================================== */

window.pgAnalyzeReceivingSpace = function () {

    const scene =
        typeof pgReadCurrentScene === "function"
            ? pgReadCurrentScene()
            : {
                home: [],
                away: [],
                ball: null
            };


    const defenders =
        scene.home
            .filter(function (player) {

                return player &&
                    Number.isFinite(Number(player.x)) &&
                    Number.isFinite(Number(player.y));

            });


    const attackers =
        scene.away
            .filter(function (player) {

                return player &&
                    Number.isFinite(Number(player.x)) &&
                    Number.isFinite(Number(player.y));

            });


    /* =========================================
       DATA CHECK
    ========================================= */

    if (
        defenders.length < 2 ||
        attackers.length < 1
    ) {

        return {

            error: true,

            primary: "—",

            secondary: "—",

            relationship: "—",

            text:
                "At least two defensive players and one receiving player are required."

        };

    }


    /* =========================================
       SORT DEFENDERS BY X
       The most advanced HOME defender
       defines the defensive line.
    ========================================= */

    const sortedDefenders =
        defenders
            .slice()
            .sort(function (a, b) {

                return Number(b.x) -
                       Number(a.x);

            });


    const defensiveLineX =
        Number(
            sortedDefenders[0].x
        );


    /* =========================================
       FIND THE RECEIVING PLAYER WITH
       THE LARGEST SPACE FROM THE LINE
    ========================================= */

    let largestSpace = null;


    attackers.forEach(function (attacker) {

        const distance =
            Number(attacker.x) -
            defensiveLineX;


        if (
            distance > 0 &&
            (
                !largestSpace ||
                distance > largestSpace.distance
            )
        ) {

            largestSpace = {

                player: attacker,

                distance: distance

            };

        }

    });


    /*
       If attackers are already behind /
       level with the defensive line.
    */

    if (!largestSpace) {

        return {

            error: false,

            primary: "0.0 m",

            primaryLabel:
                "RECEIVING SPACE",

            secondary:
                "LINES ALIGNED",

            secondaryLabel:
                "SPATIAL RELATIONSHIP",

            relationship:
                "COMPRESSED",

            relationshipLabel:
                "TACTICAL STATE",

            text:
                "The attacking and defensive structures are closely aligned. " +
                "There is currently no significant receiving space between the lines.",

            geometry: null

        };

    }


    /* =========================================
       RECEIVING PLAYER
    ========================================= */

    const receiver =
        largestSpace.player;


    const receiverX =
        Number(receiver.x);


    const receiverY =
        Number(receiver.y);


    const space =
        Number(
            largestSpace.distance.toFixed(2)
        );


    /* =========================================
       FIND DEFENDERS AROUND THE RECEIVER
       TO BUILD THE RECEIVING CORRIDOR
    ========================================= */

    const defendersByY =
        defenders
            .slice()
            .sort(function (a, b) {

                return Number(a.y) -
                       Number(b.y);

            });


    let lowerY =
        Number(
            defendersByY[0].y
        );


    let upperY =
        Number(
            defendersByY[
                defendersByY.length - 1
            ].y
        );


    /*
       Expand the corridor slightly
       so the geometry is visually readable.
    */

    lowerY =
        Math.max(
            0,
            lowerY - 5
        );


    upperY =
        Math.min(
            68,
            upperY + 5
        );


    /* =========================================
       GEOMETRY
       Leaflet CRS.Simple uses:

       [Y, X]

       while our football coordinates are:

       X = pitch length
       Y = pitch width
    ========================================= */

    const corridorCoordinates = [

        [
            lowerY,
            defensiveLineX
        ],

        [
            upperY,
            defensiveLineX
        ],

        [
            upperY,
            receiverX
        ],

        [
            lowerY,
            receiverX
        ]

    ];


    /* =========================================
       DRAW ON EXISTING PITCH
    ========================================= */

    if (
        typeof map !== "undefined" &&
        map
    ) {

        /*
           Remove previous receiving geometry
        */

        if (
            window.pgReceivingLayer &&
            map.hasLayer(
                window.pgReceivingLayer
            )
        ) {

            map.removeLayer(
                window.pgReceivingLayer
            );

        }


        /*
           Create new geometry layer
        */

        window.pgReceivingLayer =
            L.layerGroup();


        /*
           Main receiving corridor
        */

        const corridor =
            L.polygon(
                corridorCoordinates,
                {

                    weight: 2,

                    fillOpacity: 0.18,

                    dashArray: "6 5"

                }
            );


        corridor.addTo(
            window.pgReceivingLayer
        );


        /*
           Defensive line
        */

        const defensiveLine =
            L.polyline(
                [
                    [
                        lowerY,
                        defensiveLineX
                    ],
                    [
                        upperY,
                        defensiveLineX
                    ]
                ],
                {

                    weight: 3,

                    dashArray: "4 4"

                }
            );


        defensiveLine.addTo(
            window.pgReceivingLayer
        );


        /*
           Receiving line / player reference
        */

        const receivingLine =
            L.polyline(
                [
                    [
                        lowerY,
                        receiverX
                    ],
                    [
                        upperY,
                        receiverX
                    ]
                ],
                {

                    weight: 2,

                    dashArray: "3 5"

                }
            );


        receivingLine.addTo(
            window.pgReceivingLayer
        );


        /*
           Measurement line
        */

        const measurementLine =
            L.polyline(
                [
                    [
                        receiverY,
                        defensiveLineX
                    ],
                    [
                        receiverY,
                        receiverX
                    ]
                ],
                {

                    weight: 3

                }
            );


        measurementLine.addTo(
            window.pgReceivingLayer
        );


        /*
           Add everything to map
        */

        window.pgReceivingLayer.addTo(
            map
        );

    }


    /* =========================================
       POSTGIS TRACE
    ========================================= */

    const postgisTrace = [

        "ST_MakeLine()",

        "ST_Distance()",

        "ST_Buffer()",

        "ST_Intersection()"

    ];


    /* =========================================
       TACTICAL STATE
    ========================================= */

    let tacticalState =
        "RECEIVING SPACE OPEN";


    if (space >= 20) {

        tacticalState =
            "LARGE RECEIVING SPACE";

    }
    else if (space >= 12) {

        tacticalState =
            "RECEIVING SPACE AVAILABLE";

    }
    else if (space >= 6) {

        tacticalState =
            "LIMITED RECEIVING SPACE";

    }
    else {

        tacticalState =
            "COMPRESSED";

    }


    /* =========================================
       TACTICAL READING
    ========================================= */

    let reading =
        "The largest receiving space between the lines is " +
        space +
        "m, located in front of the defensive structure.";


    if (space >= 20) {

        reading =
            "A large receiving gap of " +
            space +
            "m has emerged between the defensive and attacking structures. " +
            "The space can provide a significant zone for receiving between the lines.";

    }
    else if (space >= 12) {

        reading =
            "The defensive and attacking structures are separated by " +
            space +
            "m, creating a meaningful receiving space between the lines.";

    }
    else if (space < 6) {

        reading =
            "The defensive structure is tightly connected to the receiving unit, " +
            "leaving limited space between the lines.";

    }


    /* =========================================
       RETURN ENGINE RESULT
    ========================================= */

    return {

        primary:
            space + " m",

        primaryLabel:
            "RECEIVING SPACE",

        secondary:
            receiver.name ||
            "Receiving Player",

        secondaryLabel:
            "RECEIVING POINT",

        relationship:
            tacticalState,

        relationshipLabel:
            "TACTICAL STATE",

        text:
            reading,

        interpreter:
            "The detected corridor represents the measurable spatial separation " +
            "between the defensive line and the most advanced receiving player.",

        geometry: {

            type:
                "receiving_corridor",

            defensiveLineX:
                defensiveLineX,

            receiverX:
                receiverX,

            receiverY:
                receiverY,

            lowerY:
                lowerY,

            upperY:
                upperY,

            distance:
                space

        },

        postgis:
            postgisTrace

    };

};


/* =====================================================
   RUN TACTICAL LAB
===================================================== */

window.pgRunTacticalLab = function () {

    if (!currentQuestion) {

        pgShowQueryNotification(
            "SELECT A SPATIAL QUESTION FIRST.",
            "warning"
        );

        return;

    }


    /* =========================================
       READ THE ACTUAL CURRENT PITCH
       ========================================= */

    const validation =
        pgValidateCurrentScene();


    /* =========================================
       STOP IF DATA IS MISSING
       ========================================= */

    if (!validation.valid) {

        const message =
            "QUERY BLOCKED — " +
            validation.missing.join(" • ");


        console.warn(
            "PITCHGRID QUERY BLOCKED:",
            validation.missing
        );


        pgShowQueryNotification(
            message,
            "warning"
        );


        const resultBox =
            $("labResult");


        if (resultBox) {

            resultBox.classList.add(
                "show"
            );

        }


        setLabState(
            "WAITING FOR SCENE DATA"
        );


        text(
            "labResultTitle",
            currentQuestion.label
        );


        text(
            "labResultStatus",
            "INSUFFICIENT DATA"
        );


        text(
            "labMetric1",
            "—"
        );


        text(
            "labMetric2",
            "—"
        );


        text(
            "labMetric3",
            "—"
        );


        text(
            "labReading",
            "The current scene does not contain enough spatial data. " +
            validation.missing.join(" • ")
        );


        text(
            "labInterpreter",
            "Add the missing spatial elements to the pitch, then run the query again."
        );


        return;

    }


    /* =========================================
       SAVE LIVE SCENE
       ========================================= */

    window.pgCurrentScene =
        validation.scene;


    console.log(
        "PITCHGRID QUERY SCENE:",
        window.pgCurrentScene
    );


    /* =========================================
       SHOW RESULT
       ========================================= */

    const resultBox =
        $("labResult");


    if (resultBox) {

        resultBox.classList.add(
            "show"
        );

    }


    /* =========================================
       STEP 01
       ========================================= */

    setLabState(
        "BUILDING GEOMETRY"
    );


    setPipeline(0);


    /* =========================================
       STEP 02
       ========================================= */

    setTimeout(
        function () {

            setPipeline(1);

            setLabState(
                "RUNNING SPATIAL LOGIC"
            );

        },
        300
    );


    /* =========================================
       STEP 03
       SELECT ANALYSIS
       ========================================= */

    setTimeout(
        function () {

            if (
                typeof window.pgSelectAnalysis ===
                "function"
            ) {

                window.pgSelectAnalysis(
                    currentQuestion.analysis
                );

            }


            setPipeline(2);

        },
        600
    );


    /* =========================================
   STEP 04
   RUN ENGINE
========================================= */

setTimeout(
    function () {

        let result = null;


        /*
           SPACE
           Largest Receiving Space
        */

        if (
            currentQuestion &&
            currentQuestion.analysis ===
            "space_receiving"
        ) {

            result =
                window.pgAnalyzeReceivingSpace();


            window.pgAnalysisResult =
                result;

        }


        /*
           Existing analyses
        */

        else if (
            typeof window.pgRunAnalysis ===
            "function"
        ) {

            window.pgRunAnalysis();

        }

    },
    850
);


    /* =========================================
       STEP 05
       READ RESULT
       ========================================= */

    setTimeout(
        function () {

            updateLabFromEngine();

            setPipeline(3);

            setLabState(
                "SPATIAL RESULT DETECTED"
            );

        },
        1250
    );

};


/* =====================================================
   ENGINE RESULT
===================================================== */




    /* =====================================================
       ENGINE RESULT
    ===================================================== */

    function updateLabFromEngine() {

        const result =
            window.pgAnalysisResult;


        if (!result) {

            text(
                "labResultTitle",
                currentQuestion.label
            );

            text(
                "labResultStatus",
                "NO RESULT"
            );

            text(
                "labReading",
                "Add the required players and run the spatial query."
            );

            return;

        }


        if (result.error) {

            text(
                "labResultTitle",
                currentQuestion.label
            );

            text(
                "labResultStatus",
                "INSUFFICIENT DATA"
            );

            text(
                "labReading",
                result.text
            );

            return;

        }


        text(
            "labResultTitle",
            currentQuestion.label
        );


        text(
            "labResultStatus",
            "DETECTED"
        );


        text(
            "labMetric1",
            result.primary
        );


        text(
            "labMetric2",
            result.secondary
        );


        text(
            "labMetric3",
            result.relationship
        );


        text(
            "labMetric1Label",
            result.primaryLabel ||
            "PRIMARY SIGNAL"
        );


        text(
            "labMetric2Label",
            result.secondaryLabel ||
            "SPATIAL RELATIONSHIP"
        );


        text(
            "labMetric3Label",
            result.relationshipLabel ||
            "TACTICAL STATE"
        );


        text(
            "labReading",
            result.text
        );


        /*
         * Tactical interpretation
         */

        text(
            "labInterpreter",
            buildInterpretation(result)
        );


        /*
         * Update scene state
         */

        text(
            "pgSceneStatus",
            "SPATIAL RESULT DETECTED"
        );


        updateSpatialStory(
            result
        );

    }


    /* =====================================================
       TACTICAL INTERPRETER
    ===================================================== */

    function buildInterpretation(result) {

        if (!result) {

            return "No spatial relationship has been detected yet.";

        }


        if (result.error) {

            return result.text ||
                "More spatial information is required.";

        }


        if (
            currentDomain ===
            "space"
        ) {

            return `
                The geometry identifies a meaningful change
                in available space. The tactical importance
                comes from how this space connects players,
                lines and progression routes.
            `;

        }


        if (
            currentDomain ===
            "control"
        ) {

            return `
                Spatial control is determined by the relationship
                between player positions and the territory around them.
                The important question is not possession alone,
                but who can reach and influence the space first.
            `;

        }


        if (
            currentDomain ===
            "pressure"
        ) {

            return `
                Pressure becomes tactically relevant when defensive
                access reduces the opponent's available options.
                The geometry shows both the pressure source and
                the remaining escape space.
            `;

        }


        if (
            currentDomain ===
            "passing"
        ) {

            return `
                A passing lane becomes valuable when the geometry
                connects the ball carrier to a receiver without
                sufficient defensive obstruction.
            `;

        }


        if (
            currentDomain ===
            "defending"
        ) {

            return `
                Defensive structure is not only about player distance.
                The geometry reveals whether the chain remains connected,
                where it deforms and where usable space appears.
            `;

        }


        if (
            currentDomain ===
            "attacking"
        ) {

            return `
                Attacking access is created when the geometry provides
                a usable route through or around the defensive structure.
                The detected space becomes a potential progression path.
            `;

        }


        if (
            currentDomain ===
            "transition"
        ) {

            return `
                Transition risk appears when the existing structure
                no longer protects the space required for recovery.
                The geometry identifies where that exposure begins.
            `;

        }


        return result.text ||
            "Spatial relationship detected.";

    }


    /* =====================================================
       SPATIAL STORY
    ===================================================== */

    function updateSpatialStory(result) {

        text(
            "storyTitle",
            currentQuestion.label
                .toUpperCase()
        );


        text(
            "storyStructure",
            currentDomain
                .toUpperCase()
        );


        text(
            "storyStructureValue",
            result.primary
        );


        text(
            "storyDeformation",
            result.secondaryLabel ||
            "SPATIAL CHANGE"
        );


        text(
            "storyDeformationValue",
            result.secondary
        );


        text(
            "storyConsequence",
            result.relationshipLabel ||
            "TACTICAL CONSEQUENCE"
        );


        text(
            "storyConsequenceValue",
            result.relationship
        );


        text(
            "storyReading",
            result.text
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            renderQuestions();

            selectQuestion(
                PG_TACTICAL_ENGINE
                    .space
                    .questions[0]
            );

        }
    );


})();

/* =========================================================
   PITCH VIEW CONTROLS
========================================================= */

window.pgPitchZoomIn = function () {

    if (typeof map !== "undefined" && map) {
        map.zoomIn();
    }

};


window.pgPitchZoomOut = function () {

    if (typeof map !== "undefined" && map) {
        map.zoomOut();
    }

};


window.pgPitchFit = function () {

    if (typeof map !== "undefined" && map) {

        try {

            map.setView(
                [34, 52.5],
                0
            );

        } catch (error) {

            console.warn(
                "Pitch fit unavailable",
                error
            );

        }

    }

};


/* =========================================================
   LIVE X / Y HUD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            typeof map === "undefined" ||
            !map
        ) {
            return;
        }


        map.on(
            "mousemove",
            function (event) {

                const x =
                    event.latlng.lng;

                const y =
                    event.latlng.lat;


                const xNode =
                    document.getElementById(
                        "pitchX"
                    );

                const yNode =
                    document.getElementById(
                        "pitchY"
                    );


                if (xNode) {

                    xNode.textContent =
                        Number(x).toFixed(2) +
                        "m";

                }


                if (yNode) {

                    yNode.textContent =
                        Number(y).toFixed(2) +
                        "m";

                }

            }
        );

    }
);

/* =========================================================
   PITCHGRID — SPATIAL QUERY VALIDATOR
   ---------------------------------------------------------
   Validates whether the current pitch scene contains the
   spatial objects required by the selected tactical question.
   ========================================================= */

(function () {
    "use strict";

    /* -----------------------------------------------------
       QUERY REQUIREMENTS
       ----------------------------------------------------- */

    const PG_QUERY_REQUIREMENTS = {

        space_between_lines: {
            title: "Where is the largest exposed space between the lines?",
            requires: {
                ball: false,
                attackers: 2,
                defenders: 2
            },
            labels: [
                "2 attacking players",
                "2 defensive players"
            ]
        },

        spatial_control: {
            title: "Who controls the current spatial territory?",
            requires: {
                ball: false,
                attackers: 1,
                defenders: 1
            },
            labels: [
                "1 attacking player",
                "1 defensive player"
            ]
        },

        pressure: {
            title: "Who can reach the ball first?",
            requires: {
                ball: true,
                attackers: 1,
                defenders: 1
            },
            labels: [
                "Ball",
                "1 attacking player",
                "1 defensive player"
            ]
        },

        passing_lane: {
            title: "Which passing lane is open?",
            requires: {
                ball: true,
                attackers: 2,
                defenders: 1
            },
            labels: [
                "Ball",
                "2 attacking players",
                "1 defensive player"
            ]
        },

        defensive_break: {
            title: "Where does the defensive block break?",
            requires: {
                ball: false,
                attackers: 1,
                defenders: 3
            },
            labels: [
                "1 attacking player",
                "3 defensive players"
            ]
        },

        attacking_access: {
            title: "Where is attacking access available?",
            requires: {
                ball: false,
                attackers: 2,
                defenders: 2
            },
            labels: [
                "2 attacking players",
                "2 defensive players"
            ]
        },

        transition_exposure: {
            title: "Where is the transition space exposed?",
            requires: {
                ball: true,
                attackers: 2,
                defenders: 2
            },
            labels: [
                "Ball",
                "2 attacking players",
                "2 defensive players"
            ]
        },

        shot_angle: {
            title: "How open is the shooting angle?",
            requires: {
                ball: true,
                attackers: 1,
                defenders: 0
            },
            labels: [
                "Ball",
                "1 attacking player"
            ]
        }
    };


    /* -----------------------------------------------------
       SCENE READER
       -----------------------------------------------------
       This function deliberately does NOT create players.
       It reads the current scene only.
       ----------------------------------------------------- */

    function readCurrentScene() {

        let players = [];
        let ball = null;

        /*
         * Try common global scene containers.
         * We will connect this to your exact marker structure
         * after confirming the current script.
         */

        if (Array.isArray(window.players)) {
            players = window.players;
        }

        else if (Array.isArray(window.playerMarkers)) {
            players = window.playerMarkers;
        }

        else if (Array.isArray(window.pgPlayers)) {
            players = window.pgPlayers;
        }

        else if (Array.isArray(window.currentPlayers)) {
            players = window.currentPlayers;
        }


        /* -------------------------------------------------
           BALL
           ------------------------------------------------- */

        ball =
            window.ball ||
            window.ballMarker ||
            window.pgBall ||
            window.currentBall ||
            null;


        /* -------------------------------------------------
           NORMALIZE PLAYERS
           ------------------------------------------------- */

        const normalizedPlayers = players
            .map(function (p, index) {

                if (!p) return null;

                let x = null;
                let y = null;

                /*
                 * Leaflet CRS.Simple:
                 *
                 * lng = X
                 * lat = Y
                 */

                if (p.x !== undefined && p.y !== undefined) {

                    x = Number(p.x);
                    y = Number(p.y);

                }

                else if (p.latlng) {

                    x = Number(p.latlng.lng);
                    y = Number(p.latlng.lat);

                }

                else if (p.marker && p.marker.getLatLng) {

                    const ll = p.marker.getLatLng();

                    x = Number(ll.lng);
                    y = Number(ll.lat);

                }

                else if (
                    p._latlng &&
                    p._latlng.lng !== undefined &&
                    p._latlng.lat !== undefined
                ) {

                    x = Number(p._latlng.lng);
                    y = Number(p._latlng.lat);

                }


                if (!Number.isFinite(x) || !Number.isFinite(y)) {
                    return null;
                }


                /* -----------------------------------------
                   TEAM DETECTION
                   ----------------------------------------- */

                let team =
                    p.team ||
                    p.side ||
                    p.type ||
                    p.teamType ||
                    "";


                team = String(team).toLowerCase();


                let normalizedTeam = "unknown";


                if (
                    team.includes("home") ||
                    team.includes("attack") ||
                    team.includes("attacker")
                ) {
                    normalizedTeam = "home";
                }

                else if (
                    team.includes("away") ||
                    team.includes("defend") ||
                    team.includes("defender")
                ) {
                    normalizedTeam = "away";
                }


                return {

                    id: p.id !== undefined
                        ? p.id
                        : index + 1,

                    x: x,
                    y: y,

                    team: normalizedTeam,

                    raw: p

                };

            })
            .filter(Boolean);


        /* -------------------------------------------------
           NORMALIZE BALL
           ------------------------------------------------- */

        let normalizedBall = null;


        if (ball) {

            let bx = null;
            let by = null;


            if (
                ball.x !== undefined &&
                ball.y !== undefined
            ) {

                bx = Number(ball.x);
                by = Number(ball.y);

            }

            else if (ball.latlng) {

                bx = Number(ball.latlng.lng);
                by = Number(ball.latlng.lat);

            }

            else if (
                ball.getLatLng &&
                typeof ball.getLatLng === "function"
            ) {

                const ll = ball.getLatLng();

                bx = Number(ll.lng);
                by = Number(ll.lat);

            }

            else if (ball._latlng) {

                bx = Number(ball._latlng.lng);
                by = Number(ball._latlng.lat);

            }


            if (
                Number.isFinite(bx) &&
                Number.isFinite(by)
            ) {

                normalizedBall = {

                    x: bx,
                    y: by

                };

            }

        }


        /* -------------------------------------------------
           SCENE OBJECT
           ------------------------------------------------- */

        return {

            players: normalizedPlayers,

            home: normalizedPlayers.filter(
                p => p.team === "home"
            ),

            away: normalizedPlayers.filter(
                p => p.team === "away"
            ),

            ball: normalizedBall,

            timestamp: Date.now()

        };

    }


    /* -----------------------------------------------------
       VALIDATE SCENE
       ----------------------------------------------------- */

    function validateScene(queryId) {

        const requirement =
            PG_QUERY_REQUIREMENTS[queryId];

        if (!requirement) {

            return {

                valid: true,

                scene: readCurrentScene(),

                missing: []

            };

        }


        const scene = readCurrentScene();

        const missing = [];


        /* BALL */

        if (
            requirement.requires.ball &&
            !scene.ball
        ) {

            missing.push("Ball");

        }


        /* ATTACKERS */

        if (
            scene.home.length <
            requirement.requires.attackers
        ) {

            const needed =
                requirement.requires.attackers -
                scene.home.length;

            if (needed > 0) {

                missing.push(
                    `${needed} attacking player${needed > 1 ? "s" : ""}`
                );

            }

        }


        /* DEFENDERS */

        if (
            scene.away.length <
            requirement.requires.defenders
        ) {

            const needed =
                requirement.requires.defenders -
                scene.away.length;

            if (needed > 0) {

                missing.push(
                    `${needed} defensive player${needed > 1 ? "s" : ""}`
                );

            }

        }


        return {

            valid: missing.length === 0,

            scene: scene,

            missing: missing,

            requirement: requirement

        };

    }


    /* -----------------------------------------------------
       NOTIFICATION
       ----------------------------------------------------- */

    function showQueryNotification(validation) {

        removeQueryNotification();


        const box =
            document.createElement("div");

        box.id = "pgQueryNotification";

        box.className =
            validation.valid
                ? "pg-query-notification ready"
                : "pg-query-notification blocked";


        if (validation.valid) {

            box.innerHTML = `
                <div class="pg-qn-icon">✓</div>

                <div class="pg-qn-content">
                    <strong>SCENE READY</strong>

                    <span>
                        Required spatial objects detected.
                        Ready to run query.
                    </span>
                </div>
            `;

        }

        else {

            box.innerHTML = `
                <div class="pg-qn-icon">!</div>

                <div class="pg-qn-content">

                    <strong>QUERY BLOCKED</strong>

                    <span>
                        This spatial question needs:
                        <b>${validation.missing.join(" • ")}</b>
                    </span>

                </div>
            `;

        }


        document.body.appendChild(box);


        requestAnimationFrame(function () {

            box.classList.add("show");

        });


        setTimeout(function () {

            removeQueryNotification();

        }, 5000);

    }


    function removeQueryNotification() {

        const old =
            document.getElementById(
                "pgQueryNotification"
            );

        if (!old) return;

        old.classList.remove("show");

        setTimeout(function () {

            if (old.parentNode) {
                old.parentNode.removeChild(old);
            }

        }, 250);

    }


    /* -----------------------------------------------------
       PUBLIC API
       ----------------------------------------------------- */

    window.PitchGridQueryValidator = {

        requirements:
            PG_QUERY_REQUIREMENTS,

        readScene:
            readCurrentScene,

        validate:
            validateScene,

        notify:
            showQueryNotification

    };


    /* -----------------------------------------------------
       TEST HELPER
       ----------------------------------------------------- */

    window.pgCheckCurrentQuery = function (queryId) {

        const result =
            validateScene(queryId);

        showQueryNotification(result);

        console.log(
            "PITCHGRID QUERY VALIDATION",
            result
        );

        return result;

    };

})();

/* =====================================================
   PITCHGRID LAB DEBUG
===================================================== */

window.pgDebugLab = function () {

    console.clear();

    console.log("========== PITCHGRID LAB DEBUG ==========");

    console.log("1. currentQuestion:", currentQuestion);

    console.log(
        "2. currentQuestion.analysis:",
        currentQuestion &&
        currentQuestion.analysis
    );

    console.log(
        "3. pgPlayers:",
        window.pgPlayers
    );

    console.log(
        "4. pgBall:",
        window.pgBall
    );

    console.log(
        "5. pgReadCurrentScene:",
        typeof pgReadCurrentScene
    );

    if (
        typeof pgReadCurrentScene ===
        "function"
    ) {

        console.log(
            "6. CURRENT SCENE:",
            pgReadCurrentScene()
        );
    }

    console.log(
        "7. pgAnalyzeReceivingSpace:",
        typeof window.pgAnalyzeReceivingSpace
    );

    console.log(
        "8. pgRunTacticalLab:",
        typeof window.pgRunTacticalLab
    );

    console.log(
        "9. map:",
        typeof map,
        map
    );

    console.log(
        "10. pgQueryRequirements:",
        typeof pgQueryRequirements !== "undefined"
            ? pgQueryRequirements
            : "NOT FOUND"
    );

    console.log(
        "11. space_receiving requirement:",
        typeof pgQueryRequirements !== "undefined"
            ? pgQueryRequirements.space_receiving
            : "NOT FOUND"
    );

    if (
        typeof pgReadCurrentScene ===
        "function"
    ) {

        const scene =
            pgReadCurrentScene();

        console.log(
            "12. HOME COUNT:",
            scene.home.length
        );

        console.log(
            "13. AWAY COUNT:",
            scene.away.length
        );

        console.log(
            "14. BALL:",
            scene.ball
        );
    }

    console.log(
        "========== END DEBUG =========="
    );
};

