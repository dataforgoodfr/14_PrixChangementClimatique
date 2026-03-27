SELECT
    c.code_geo AS code_geo,
    s.nortx_35_d_yr,
    s.norrrq_99_ref_d_yr,
    s.norswi_04_yr,
    s.nortr_yr,
    s.norrr_yr
FROM (
    SELECT
        *,
        (geo_point_2_d::json ->> 'lon')::DOUBLE AS lon,
        (geo_point_2_d::json ->> 'lat')::DOUBLE AS lat,
        ARRAY[
            (geo_point_2_d::json ->> 'lat')::DOUBLE,
            (geo_point_2_d::json ->> 'lon')::DOUBLE
        ] AS geom_array
    FROM opendatasoft_communes
) c
LEFT JOIN LATERAL (
    SELECT *
    FROM DRIAS s
    WHERE s.Longitude BETWEEN (c.lon - 1) AND (c.lon + 1)
      AND s.Latitude  BETWEEN (c.lat - 1) AND (c.lat + 1)
    ORDER BY c.geom_array <-> ARRAY[s.Latitude, s.Longitude]
    LIMIT 1
) s ON TRUE