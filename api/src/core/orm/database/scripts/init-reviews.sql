-- Ejecutar después de iniciar la API una vez (el ORM crea la tabla "Reviews").

-- Una reseña por usuario y espacio.
CREATE UNIQUE INDEX IF NOT EXISTS "idx_reviews_user_space" ON "Reviews" ("userId", "spaceId");

-- Para calcular rápido el promedio de cada espacio.
CREATE INDEX IF NOT EXISTS "idx_reviews_space" ON "Reviews" ("spaceId");

-- La calificación siempre entre 1 y 5.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_rating_range') THEN
    ALTER TABLE "Reviews" ADD CONSTRAINT "reviews_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
  END IF;
END $$;

INSERT INTO "Permissions" ("id", "name", "alias", "description", "type") VALUES
('e7a2b9d4-3c1f-4a6e-8b5d-a20000000001', 'ReadReviews', 'Leer Reseñas', 'Consultar la reseña propia y si se puede reseñar un espacio.', 'Read'),
('e7a2b9d4-3c1f-4a6e-8b5d-a20000000002', 'CreateReviews', 'Crear Reseñas', 'Crear o editar la reseña propia de un espacio reservado.', 'Create')
ON CONFLICT DO NOTHING;

-- Admin y User pueden reseñar.
INSERT INTO "RolesPermissions" ("roleId", "permissionId") VALUES
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'e7a2b9d4-3c1f-4a6e-8b5d-a20000000001'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'e7a2b9d4-3c1f-4a6e-8b5d-a20000000002'),
('f60fb7a5-673d-4f3e-af61-b800a79469a5', 'e7a2b9d4-3c1f-4a6e-8b5d-a20000000001'),
('f60fb7a5-673d-4f3e-af61-b800a79469a5', 'e7a2b9d4-3c1f-4a6e-8b5d-a20000000002')
ON CONFLICT DO NOTHING;
