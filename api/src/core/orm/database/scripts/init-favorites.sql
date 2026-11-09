-- Ejecutar después de iniciar la API una vez (el ORM crea la tabla "Favorites").

-- Un usuario no puede marcar el mismo espacio dos veces.
CREATE UNIQUE INDEX IF NOT EXISTS "idx_favorites_user_space" ON "Favorites" ("userId", "spaceId");

INSERT INTO "Permissions" ("id", "name", "alias", "description", "type") VALUES
('d4f1a7c2-6b3e-4c8a-9f2d-a10000000001', 'ReadFavorites', 'Leer Favoritos', 'Consultar los espacios favoritos propios.', 'Read'),
('d4f1a7c2-6b3e-4c8a-9f2d-a10000000002', 'CreateFavorites', 'Agregar Favoritos', 'Marcar espacios recreativos como favoritos.', 'Create'),
('d4f1a7c2-6b3e-4c8a-9f2d-a10000000003', 'DeleteFavorites', 'Quitar Favoritos', 'Quitar espacios recreativos de favoritos.', 'Delete'),
('d4f1a7c2-6b3e-4c8a-9f2d-a10000000004', 'AccessFavorites', 'Acceso a Favoritos', 'Acceder a la sección Mis lugares favoritos.', 'Access')
ON CONFLICT DO NOTHING;

-- Admin y User pueden usar favoritos.
INSERT INTO "RolesPermissions" ("roleId", "permissionId") VALUES
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'd4f1a7c2-6b3e-4c8a-9f2d-a10000000001'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'd4f1a7c2-6b3e-4c8a-9f2d-a10000000002'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'd4f1a7c2-6b3e-4c8a-9f2d-a10000000003'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'd4f1a7c2-6b3e-4c8a-9f2d-a10000000004'),
('f60fb7a5-673d-4f3e-af61-b800a79469a5', 'd4f1a7c2-6b3e-4c8a-9f2d-a10000000001'),
('f60fb7a5-673d-4f3e-af61-b800a79469a5', 'd4f1a7c2-6b3e-4c8a-9f2d-a10000000002'),
('f60fb7a5-673d-4f3e-af61-b800a79469a5', 'd4f1a7c2-6b3e-4c8a-9f2d-a10000000003'),
('f60fb7a5-673d-4f3e-af61-b800a79469a5', 'd4f1a7c2-6b3e-4c8a-9f2d-a10000000004')
ON CONFLICT DO NOTHING;
