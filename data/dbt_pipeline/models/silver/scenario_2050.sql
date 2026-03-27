SELECT
    c.code_geo,
    s.nortx_35_d_yr,
    s.norrrq_99_ref_d_yr,
    s.norswi_04_yr,
    s.nortr_yr,
    s.norrr_yr
FROM (
    SELECT
        *,
        (geo_point_2_d::json ->> 'lon')::double AS lon,
        (geo_point_2_d::json ->> 'lat')::double AS lat,
        ARRAY[
            (geo_point_2_d::json ->> 'lat')::double,
            (geo_point_2_d::json ->> 'lon')::double
        ] AS geom_array
    FROM opendatasoft_communes
) AS c
LEFT JOIN LATERAL (
    SELECT
        s.longitude,
        s.latitude,
        s.nortx_35_d_yr,
        s.norrrq_99_ref_d_yr,
        s.norswi_04_yr,
        s.nortr_yr,
        s.norrr_yr
    FROM drias AS s
    WHERE
        s.longitude BETWEEN (c.lon - 1) AND (c.lon + 1)
        AND s.latitude BETWEEN (c.lat - 1) AND (c.lat + 1)
    ORDER BY c.geom_array <-> ARRAY[s.latitude, s.longitude]  -- noqa
    LIMIT 1
) AS s ON TRUE
