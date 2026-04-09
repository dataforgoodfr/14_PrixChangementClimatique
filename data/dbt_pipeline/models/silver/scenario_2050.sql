WITH
geo_com AS (
    SELECT
        *,
        (geo_point_2_d::json ->> 'lon')::double AS lon,
        (geo_point_2_d::json ->> 'lat')::double AS lat,
        ARRAY[
            (geo_point_2_d::json ->> 'lat')::double,
            (geo_point_2_d::json ->> 'lon')::double
        ] AS geom_array
    FROM {{ ref('opendatasoft_communes') }}
)
SELECT
    c.code_geo,
    s.rx_1_d_abs,
    s.pxcdd_abs,
    s.rr_50_d_abs,
    s.pxcwd_abs,
    s.tx_35_d_abs,
    s.swi_04_d_abs
FROM
    geo_com AS c
LEFT JOIN
    LATERAL
    (
        SELECT
            s.longitude,
            s.latitude,
            s.rx_1_d_abs,
            s.pxcdd_abs,
            s.rr_50_d_abs,
            s.pxcwd_abs,
            s.tx_35_d_abs,
            s.swi_04_d_abs
        FROM {{ ref('drias_tracc') }} AS s
        WHERE
            s.longitude BETWEEN (c.lon - 1) AND (c.lon + 1)
            AND s.latitude BETWEEN (c.lat - 1) AND (c.lat + 1)
ORDER BY c.geom_array <-> ARRAY[s.latitude, s.longitude]  -- noqa
    LIMIT 1
    ) AS s
    ON TRUE
