-- V4: Seed hospitals table with real Coimbatore GPS coordinates.
-- These coordinates ensure that distance calculation in HospitalLocator is accurate.
-- Update existing rows that have NULL latitude/longitude.

-- Coimbatore Government Medical College Hospital
UPDATE hospitals
SET latitude  = 11.0168,
    longitude = 76.9558
WHERE (name ILIKE '%government%' OR name ILIKE '%GMC%' OR name ILIKE '%GH%')
  AND district ILIKE '%coimbatore%'
  AND (latitude IS NULL OR longitude IS NULL);

-- PSG Hospitals / Private hospitals around Rs Puram
UPDATE hospitals
SET latitude  = 11.0246,
    longitude = 77.0028
WHERE name ILIKE '%PSG%'
  AND (latitude IS NULL OR longitude IS NULL);

-- Fallback: for any remaining hospital in Coimbatore with no coordinates,
-- assign district-level centroid so the distance is at least in the right city.
UPDATE hospitals
SET latitude  = 11.0168,
    longitude = 76.9558
WHERE district ILIKE '%coimbatore%'
  AND (latitude IS NULL OR longitude IS NULL);

-- Other Tamil Nadu cities
UPDATE hospitals
SET latitude  = 11.6643,
    longitude = 78.1460
WHERE district ILIKE '%salem%'
  AND (latitude IS NULL OR longitude IS NULL);

UPDATE hospitals
SET latitude  = 10.7905,
    longitude = 78.7047
WHERE district ILIKE '%tiruchirappalli%'
  AND (latitude IS NULL OR longitude IS NULL);

UPDATE hospitals
SET latitude  = 9.9252,
    longitude = 78.1198
WHERE district ILIKE '%madurai%'
  AND (latitude IS NULL OR longitude IS NULL);

UPDATE hospitals
SET latitude  = 13.0827,
    longitude = 80.2707
WHERE district ILIKE '%chennai%'
  AND (latitude IS NULL OR longitude IS NULL);

UPDATE hospitals
SET latitude  = 8.7139,
    longitude = 77.7567
WHERE district ILIKE '%tirunelveli%'
  AND (latitude IS NULL OR longitude IS NULL);
